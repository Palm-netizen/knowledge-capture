"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AppData, ContentItem, DailyLog, Idea, Platform, Publication } from "../types";
import { nowIso, uid } from "../utils";
import type { Collection } from "./mappers";
import {
  RemoteSync,
  getSupabase,
  loadRemote,
  readLocal,
  writeLocal,
  type SyncMode,
  type SyncStatus,
} from "./persistence";

type IdeaInput = Partial<Omit<Idea, "id" | "createdAt" | "updatedAt">> & { title: string };
type ContentInput = Partial<Omit<ContentItem, "id" | "createdAt" | "updatedAt">> & { title: string };

interface StoreValue extends AppData {
  ready: boolean;
  syncMode: SyncMode;
  syncStatus: SyncStatus;
  syncError: string | null;

  addIdea: (input: IdeaInput) => Idea;
  updateIdea: (id: string, patch: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;

  addContent: (input: ContentInput) => ContentItem;
  updateContent: (id: string, patch: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  createContentFromIdea: (ideaId: string) => ContentItem | null;

  addPublication: (contentId: string, platform: Platform, patch?: Partial<Publication>) => Publication;
  updatePublication: (id: string, patch: Partial<Publication>) => void;
  deletePublication: (id: string) => void;

  /** Create-or-update the journal row for a day (YYYY-MM-DD). */
  saveDailyLog: (date: string, patch: Partial<Pick<DailyLog, "todos" | "experience" | "lesson">>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const EMPTY: AppData = { ideas: [], contents: [], publications: [], dailyLogs: [] };

export const EMPTY_TODOS = () => Array.from({ length: 5 }, () => ({ text: "", done: false }));

export function newIdea(input: IdeaInput): Idea {
  const now = nowIso();
  return {
    id: uid(),
    details: "",
    kind: "content",
    source: null,
    sourceNote: "",
    category: null,
    status: "new",
    imageUrl: null,
    ...input,
    title: input.title.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function newContent(input: ContentInput): ContentItem {
  const now = nowIso();
  return {
    id: uid(),
    ideaId: null,
    category: null,
    status: "draft",
    objective: "",
    audience: "",
    painPoint: "",
    hook: "",
    mainMessage: "",
    story: "",
    takeaway: "",
    cta: "",
    format: null,
    script: "",
    onImageText: "",
    caption: "",
    hashtags: "",
    ...input,
    title: input.title.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [ready, setReady] = useState(false);
  const [syncMode, setSyncMode] = useState<SyncMode>("local");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);

  const dataRef = useRef<AppData>(EMPTY);
  const remoteRef = useRef<RemoteSync | null>(null);
  // false while the daily_logs table doesn't exist in Supabase: journal stays local-only
  const dailyRemoteRef = useRef(true);

  // ---- initial load -------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const local = readLocal();
    dataRef.current = local;
    setData(local);

    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    loadRemote(sb)
      .then((remote) => {
        if (cancelled) return;
        remoteRef.current = new RemoteSync(sb, (s, msg) => {
          setSyncStatus(s);
          setSyncError(s === "error" ? msg ?? "บันทึกไม่สำเร็จ" : null);
        });
        const { dailyLogsAvailable, ...rest } = remote;
        dailyRemoteRef.current = dailyLogsAvailable;
        const merged: AppData = dailyLogsAvailable ? rest : { ...rest, dailyLogs: local.dailyLogs };
        dataRef.current = merged;
        setData(merged);
        writeLocal(merged);
        setSyncMode("supabase");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // Tables missing / offline → keep working locally.
        setSyncError(`เชื่อม Supabase ไม่สำเร็จ ใช้ข้อมูลในเครื่องแทน (${e instanceof Error ? e.message : "unknown"})`);
      })
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // flush pending remote writes when the tab is hidden/closed
  useEffect(() => {
    const flush = () => void remoteRef.current?.flush();
    const onVis = () => document.visibilityState === "hidden" && flush();
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // ---- core mutation helper ----------------------------------------
  const commit = useCallback(
    (
      next: AppData,
      ops: { upsert?: [Collection, { id: string }][]; remove?: [Collection, string[]][] },
    ) => {
      dataRef.current = next;
      setData(next);
      writeLocal(next);
      const remote = remoteRef.current;
      if (!remote) {
        setSyncStatus("saved");
        return;
      }
      // deletes: children first
      if (!dailyRemoteRef.current) {
        ops = {
          upsert: ops.upsert?.filter(([c]) => c !== "dailyLogs"),
          remove: ops.remove?.filter(([c]) => c !== "dailyLogs"),
        };
        if (!ops.upsert?.length && !ops.remove?.length) {
          setSyncStatus("saved");
          return;
        }
      }
      const removeOrder: Collection[] = ["publications", "contents", "ideas", "dailyLogs"];
      const removes = [...(ops.remove ?? [])].sort(
        (a, b) => removeOrder.indexOf(a[0]) - removeOrder.indexOf(b[0]),
      );
      void (async () => {
        for (const [c, ids] of removes) await remote.remove(c, ids);
      })();
      ops.upsert?.forEach(([c, row]) => remote.upsert(c, row));
    },
    [],
  );

  // ---- ideas --------------------------------------------------------
  const addIdea = useCallback(
    (input: IdeaInput) => {
      const idea = newIdea(input);
      const d = dataRef.current;
      commit({ ...d, ideas: [idea, ...d.ideas] }, { upsert: [["ideas", idea]] });
      return idea;
    },
    [commit],
  );

  const updateIdea = useCallback(
    (id: string, patch: Partial<Idea>) => {
      const d = dataRef.current;
      const cur = d.ideas.find((i) => i.id === id);
      if (!cur) return;
      const updated = { ...cur, ...patch, id, updatedAt: nowIso() };
      commit({ ...d, ideas: d.ideas.map((i) => (i.id === id ? updated : i)) }, { upsert: [["ideas", updated]] });
    },
    [commit],
  );

  const deleteIdea = useCallback(
    (id: string) => {
      const d = dataRef.current;
      // contents keep living; they just lose the link (FK: on delete set null)
      const touched = d.contents.filter((c) => c.ideaId === id).map((c) => ({ ...c, ideaId: null }));
      commit(
        {
          ...d,
          ideas: d.ideas.filter((i) => i.id !== id),
          contents: d.contents.map((c) => touched.find((t) => t.id === c.id) ?? c),
        },
        { remove: [["ideas", [id]]] },
      );
    },
    [commit],
  );

  // ---- contents -----------------------------------------------------
  const addContent = useCallback(
    (input: ContentInput) => {
      const item = newContent(input);
      const d = dataRef.current;
      commit({ ...d, contents: [item, ...d.contents] }, { upsert: [["contents", item]] });
      return item;
    },
    [commit],
  );

  const updateContent = useCallback(
    (id: string, patch: Partial<ContentItem>) => {
      const d = dataRef.current;
      const cur = d.contents.find((c) => c.id === id);
      if (!cur) return;
      const updated = { ...cur, ...patch, id, updatedAt: nowIso() };
      commit(
        { ...d, contents: d.contents.map((c) => (c.id === id ? updated : c)) },
        { upsert: [["contents", updated]] },
      );
    },
    [commit],
  );

  const deleteContent = useCallback(
    (id: string) => {
      const d = dataRef.current;
      const pubIds = d.publications.filter((p) => p.contentId === id).map((p) => p.id);
      commit(
        {
          ...d,
          contents: d.contents.filter((c) => c.id !== id),
          publications: d.publications.filter((p) => p.contentId !== id),
        },
        { remove: [["publications", pubIds], ["contents", [id]]] },
      );
    },
    [commit],
  );

  const createContentFromIdea = useCallback(
    (ideaId: string) => {
      const d = dataRef.current;
      const idea = d.ideas.find((i) => i.id === ideaId);
      if (!idea) return null;
      const item = newContent({
        title: idea.title,
        ideaId: idea.id,
        category: idea.category,
        status: "producing",
        mainMessage: idea.details,
      });
      const updatedIdea = { ...idea, status: "used" as const, updatedAt: nowIso() };
      commit(
        {
          ...d,
          contents: [item, ...d.contents],
          ideas: d.ideas.map((i) => (i.id === ideaId ? updatedIdea : i)),
        },
        { upsert: [["ideas", updatedIdea], ["contents", item]] },
      );
      return item;
    },
    [commit],
  );

  // ---- publications (platform versions) -----------------------------
  const addPublication = useCallback(
    (contentId: string, platform: Platform, patch: Partial<Publication> = {}) => {
      const d = dataRef.current;
      const master = d.contents.find((c) => c.id === contentId);
      const now = nowIso();
      const pub: Publication = {
        id: uid(),
        contentId,
        platform,
        // start from the master content — each version is then edited independently
        hook: master?.hook ?? "",
        caption: master?.caption ?? "",
        hashtags: master?.hashtags ?? "",
        format: master?.format ?? null,
        scheduledDate: null,
        scheduledTime: null,
        status: "draft",
        publishedAt: null,
        reach: null,
        views: null,
        likes: null,
        comments: null,
        shares: null,
        saves: null,
        newFollowers: null,
        learnings: "",
        improvements: "",
        ...patch,
        createdAt: now,
        updatedAt: now,
      };
      if (pub.scheduledDate && pub.status === "draft") pub.status = "scheduled";
      commit({ ...d, publications: [...d.publications, pub] }, { upsert: [["publications", pub]] });
      return pub;
    },
    [commit],
  );

  const updatePublication = useCallback(
    (id: string, patch: Partial<Publication>) => {
      const d = dataRef.current;
      const cur = d.publications.find((p) => p.id === id);
      if (!cur) return;
      const updated: Publication = { ...cur, ...patch, id, updatedAt: nowIso() };
      // keep status consistent with the schedule unless explicitly published
      if (updated.status !== "published") {
        updated.status = updated.scheduledDate ? "scheduled" : "draft";
        updated.publishedAt = null;
      } else if (!updated.publishedAt) {
        updated.publishedAt = nowIso();
      }
      const ops: { upsert: [Collection, { id: string }][] } = { upsert: [["publications", updated]] };
      let contents = d.contents;
      // When every version of a content is published, mark the master published too.
      const siblings = d.publications.map((p) => (p.id === id ? updated : p)).filter((p) => p.contentId === cur.contentId);
      const master = d.contents.find((c) => c.id === cur.contentId);
      if (master && siblings.length && siblings.every((p) => p.status === "published") && master.status !== "published") {
        const m = { ...master, status: "published" as const, updatedAt: nowIso() };
        contents = d.contents.map((c) => (c.id === m.id ? m : c));
        ops.upsert.push(["contents", m]);
      }
      commit({ ...d, contents, publications: d.publications.map((p) => (p.id === id ? updated : p)) }, ops);
    },
    [commit],
  );

  const deletePublication = useCallback(
    (id: string) => {
      const d = dataRef.current;
      commit({ ...d, publications: d.publications.filter((p) => p.id !== id) }, { remove: [["publications", [id]]] });
    },
    [commit],
  );

  const saveDailyLog = useCallback<StoreValue["saveDailyLog"]>(
    (date, patch) => {
      const d = dataRef.current;
      const cur = d.dailyLogs.find((l) => l.date === date);
      const now = nowIso();
      const row: DailyLog = cur
        ? { ...cur, ...patch, updatedAt: now }
        : { id: uid(), date, todos: EMPTY_TODOS(), experience: "", lesson: "", ...patch, createdAt: now, updatedAt: now };
      commit(
        { ...d, dailyLogs: cur ? d.dailyLogs.map((l) => (l.id === row.id ? row : l)) : [row, ...d.dailyLogs] },
        { upsert: [["dailyLogs", row]] },
      );
    },
    [commit],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      ready,
      syncMode,
      syncStatus,
      syncError,
      addIdea,
      updateIdea,
      deleteIdea,
      addContent,
      updateContent,
      deleteContent,
      createContentFromIdea,
      addPublication,
      updatePublication,
      deletePublication,
      saveDailyLog,
    }),
    [data, ready, syncMode, syncStatus, syncError, addIdea, updateIdea, deleteIdea, addContent, updateContent, deleteContent, createContentFromIdea, addPublication, updatePublication, deletePublication, saveDailyLog],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

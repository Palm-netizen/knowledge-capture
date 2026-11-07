"use client";

import { CATEGORIES, FORMATS } from "@/lib/constants";
import type { ContentItem } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { ChipGroup } from "@/components/ui/Form";
import { EditorSection, WriteBlock } from "./EditorBlocks";
import { PublishPlanner } from "./PublishPlanner";

const filled = (...v: (string | null)[]) => v.filter((x) => x && x.trim()).length;

/** Master Content — sections 1–4 of the production workflow. */
export function MasterEditor({ item, onOpenVersion }: { item: ContentItem; onOpenVersion: (pubId: string) => void }) {
  const { updateContent } = useStore();
  const set = <K extends keyof ContentItem>(key: K) => (v: ContentItem[K]) => updateContent(item.id, { [key]: v } as Partial<ContentItem>);

  return (
    <div>
      <EditorSection
        step={1}
        title="วางแนวคิด"
        description="คุยกับใคร เรื่องอะไร เพื่ออะไร"
        done={filled(item.category, item.objective, item.audience, item.painPoint)}
        total={4}
      >
        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted">หมวดหมู่</p>
          <ChipGroup value={item.category} onChange={set("category")} options={CATEGORIES} allowClear size="sm" />
        </div>
        <WriteBlock label="วัตถุประสงค์" value={item.objective} onChange={set("objective")} placeholder="อยากให้คนดูรู้สึก / รู้ / ทำอะไรหลังดูจบ" />
        <WriteBlock label="กลุ่มคนที่อยากสื่อสารด้วย" value={item.audience} onChange={set("audience")} placeholder="เช่น คนวัยทำงานที่อยากดูแลสุขภาพแต่ไม่มีเวลา" />
        <WriteBlock label="ปัญหาหรือความต้องการของคนดู" value={item.painPoint} onChange={set("painPoint")} placeholder="เขากำลังติดอยู่กับอะไร" />
      </EditorSection>

      <EditorSection
        step={2}
        title="วางเนื้อหา"
        description="โครงเรื่องหลักที่ทุกเวอร์ชันใช้ร่วมกัน"
        done={filled(item.hook, item.mainMessage, item.story, item.takeaway, item.cta)}
        total={5}
      >
        <WriteBlock label="Hook" hint="ประโยคเปิดให้น่าสนใจ" value={item.hook} onChange={set("hook")} placeholder="เช่น “ผมเคยแพ้ความอยากทุกคืน จนเปลี่ยนแค่เรื่องเดียว…”" large />
        <WriteBlock label="Main Message" hint="สิ่งที่ต้องการสื่อ" value={item.mainMessage} onChange={set("mainMessage")} placeholder="ถ้าคนจำได้แค่ประโยคเดียว อยากให้จำอะไร" minRows={2} />
        <WriteBlock label="Story" hint="ประสบการณ์หรือตัวอย่าง" value={item.story} onChange={set("story")} placeholder="เล่าเหตุการณ์จริงที่เกิดขึ้น" minRows={3} />
        <WriteBlock label="Takeaway" hint="สิ่งที่คนดูนำไปใช้ได้" value={item.takeaway} onChange={set("takeaway")} placeholder="ขั้นตอนหรือเคล็ดลับที่ทำตามได้ทันที" minRows={2} />
        <WriteBlock label="CTA" hint="ชวนให้ทำอะไรต่อ" value={item.cta} onChange={set("cta")} placeholder="เช่น เซฟไว้ลองทำ / คอมเมนต์เล่าให้ฟังหน่อย" />
      </EditorSection>

      <EditorSection
        step={3}
        title="เตรียมชิ้นงาน"
        description="ต้นฉบับ — แต่ละแพลตฟอร์มปรับต่อได้"
        done={filled(item.format, item.script, item.onImageText, item.caption, item.hashtags)}
        total={5}
      >
        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted">รูปแบบ</p>
          <ChipGroup value={item.format} onChange={set("format")} options={FORMATS} allowClear size="sm" />
        </div>
        <WriteBlock label="สคริปต์วิดีโอ" value={item.script} onChange={set("script")} placeholder="ฉาก / คำพูด / สิ่งที่ต้องถ่าย" minRows={3} />
        <WriteBlock label="ข้อความบนภาพ" value={item.onImageText} onChange={set("onImageText")} placeholder="ข้อความสั้น ๆ บนปก หรือแต่ละสไลด์" minRows={2} />
        <WriteBlock label="Caption" value={item.caption} onChange={set("caption")} placeholder="คำบรรยายใต้โพสต์" minRows={3} />
        <WriteBlock label="Hashtag" value={item.hashtags} onChange={set("hashtags")} placeholder="#สุขภาพ #พัฒนาตัวเอง" />
      </EditorSection>

      <EditorSection step={4} title="เตรียมเผยแพร่" description="เลือกช่องทาง วันที่ และเวลา">
        <PublishPlanner item={item} onOpenVersion={onOpenVersion} />
      </EditorSection>
    </div>
  );
}

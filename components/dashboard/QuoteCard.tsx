"use client";

import { useState } from "react";
import Link from "next/link";
import { randomIndex, type Quote } from "@/lib/quotes";

export default function QuoteCard({ quotes, initialIndex }: { quotes: Quote[]; initialIndex: number }) {
  const [index, setIndex] = useState(initialIndex);
  const quote = quotes[index];

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-nav p-6 text-white md:p-8">
      <div className="pointer-events-none absolute -right-12 -bottom-20 h-56 w-56 rounded-full bg-linear-to-br from-primary to-accent opacity-70 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/60">คำคมเตือนใจ</p>
          {quotes.length > 1 ? (
            <button
              type="button"
              onClick={() => setIndex((i) => randomIndex(quotes.length, i))}
              className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-white/20"
            >
              สุ่มใหม่ ↻
            </button>
          ) : null}
        </div>

        {quote ? (
          <>
            <p className="mt-4 font-display text-xl leading-relaxed md:text-2xl">&ldquo;{quote.text}&rdquo;</p>
            {quote.sourceTitle && quote.sourceId ? (
              <Link
                href={`/library/item?id=${quote.sourceId}`}
                className="mt-4 inline-block text-sm text-white/70 hover:text-white hover:underline"
              >
                — {quote.sourceTitle}
              </Link>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-white/80">
            ยังไม่มีคำคม ลองใส่ &ldquo;ข้อความที่ประทับใจ&rdquo; ตอนจด Deep Note แล้วจะสุ่มมาเตือนใจที่นี่
          </p>
        )}
      </div>
    </div>
  );
}

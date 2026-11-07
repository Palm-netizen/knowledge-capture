const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function formatThaiDate(iso: string | null | undefined, opts: { short?: boolean } = {}): string {
  if (!iso) return "";
  const d = new Date(iso);
  const months = opts.short ? THAI_MONTHS_SHORT : THAI_MONTHS;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export function timeAgoThai(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} สัปดาห์ที่แล้ว`;
  return formatThaiDate(iso, { short: true });
}

export function formatHours(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  if (hours === 0) return "0";
  if (hours < 10) return hours.toFixed(1).replace(/\.0$/, "");
  return Math.round(hours).toString();
}

export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "สวัสดีตอนเช้า";
  if (hour < 16) return "สวัสดีตอนบ่าย";
  if (hour < 19) return "สวัสดีตอนเย็น";
  return "สวัสดีตอนค่ำ";
}

export default function ErrorState({ message = "โหลดข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง" }: { message?: string }) {
  return (
    <div className="rounded-[20px] bg-danger-tint px-4 py-6 text-center text-sm text-danger">{message}</div>
  );
}

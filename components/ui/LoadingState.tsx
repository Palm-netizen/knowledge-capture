export default function LoadingState({ message = "กำลังโหลดข้อมูล..." }: { message?: string }) {
  return <div className="py-16 text-center text-sm text-muted">{message}</div>;
}

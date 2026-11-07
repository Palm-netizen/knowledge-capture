import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 pt-24 text-center">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-1 text-xl font-semibold">ไม่พบหน้านี้</h1>
      <div className="mt-6">
        <ButtonLink href="/" variant="primary">กลับหน้าภาพรวม</ButtonLink>
      </div>
    </div>
  );
}

export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-[20px] border border-dashed border-border py-10 px-4 text-center text-sm text-muted">
      {message}
    </div>
  );
}

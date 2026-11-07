import { Suspense } from "react";
import LoadingState from "@/components/ui/LoadingState";
import SourceDetail from "@/components/library/SourceDetail";

// The item id lives in the query string (?id=...) because this is a static
// export — there's no server to render a page per id at request time.
export default function LibraryItemPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5 py-8 md:px-12 md:py-12">
          <LoadingState />
        </div>
      }
    >
      <SourceDetail />
    </Suspense>
  );
}

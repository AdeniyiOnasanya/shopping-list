import { TriangleAlert } from "lucide-react";

type ErrorStateProps = {
  header:string
  subHeader?:string
}
export function ErrorState({header, subHeader}:ErrorStateProps) {
  return (
    <div
      role="alert"
      className="m-4 flex gap-3 rounded-xl border border-danger-edge bg-danger-tint p-4 sm:m-6"
    >
      <TriangleAlert
        aria-hidden="true"
        size={20}
        className="mt-0.5 shrink-0 text-danger"
      />

      <div>
        <p className="text-base font-semibold text-danger">
          {header}
        </p>
        {
            subHeader && (
                <p className="mt-1 text-sm text-mute">
                  {subHeader}
                </p>
            )
        }
      </div>
    </div>
  );
}

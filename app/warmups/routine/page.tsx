import { Suspense } from "react";
import RoutineEditor from "./RoutineEditor";

export default function Page() {
  return (
    <Suspense>
      <RoutineEditor />
    </Suspense>
  );
}

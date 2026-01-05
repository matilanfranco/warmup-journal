import { Suspense } from "react";
import SessionClient from "./SessionClient";

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading session...</div>}>
      <SessionClient />
    </Suspense>
  );
}
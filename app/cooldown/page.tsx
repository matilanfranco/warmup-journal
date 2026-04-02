import { Suspense } from "react";
import CoolDownClient from "./CoolDownClient";

export default function CoolDownPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[#9B8EC4]">Loading...</div>}>
      <CoolDownClient />
    </Suspense>
  );
}
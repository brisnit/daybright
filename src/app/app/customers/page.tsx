import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomersPage } from "@/components/workspace/customers-page";

export const metadata: Metadata = { title: "Customers" };

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-6xl px-4 py-10" aria-busy="true" />}>
      <CustomersPage />
    </Suspense>
  );
}

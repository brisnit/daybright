import type { Metadata } from "next";
import { ReviewQueue } from "@/components/workspace/review-queue";

export const metadata: Metadata = { title: "Review birthdays" };

export default function ReviewPage() {
  return <ReviewQueue />;
}

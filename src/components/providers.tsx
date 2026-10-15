"use client";

import { MotionConfig } from "framer-motion";
import { useEffect } from "react";
import { useDemo } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useDemo.persist.rehydrate();
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}

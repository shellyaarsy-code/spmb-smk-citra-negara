"use client";

import { useEffect, useState } from "react";

export function useStudentDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsDemoMode(new URLSearchParams(window.location.search).get("mode") === "demo");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return isDemoMode;
}

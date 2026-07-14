"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TransferCertificatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to unified students page with "tc" tab
    router.replace("/admin/students?tab=tc");
  }, [router]);

  return null;
}

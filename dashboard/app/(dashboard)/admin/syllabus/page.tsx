"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SyllabusRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/notes?tab=syllabus");
    }, [router]);

    return null;
}

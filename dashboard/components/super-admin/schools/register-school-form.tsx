"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RegisterSchoolFormContent } from "./register-school-form-content";

export function RegisterSchoolForm() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Register New School</h1>
          <p className="text-gray-600 mt-1">
            Create a new school account in the system
          </p>
        </div>
      </div>

      <RegisterSchoolFormContent
        onSuccess={() => router.push("/super-admin/schools")}
        onCancel={() => router.back()}
        showBackButton={true}
      />
    </div>
  );
}


"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopHeader() {
  const router = useRouter();

  return (
    <div className="h-[54px] lg:h-[72px] bg-[#f7f7f7] flex items-center justify-between px-6 lg:px-9 mr-2 lg:mr-3 mt-3 lg:mt-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full bg-white border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600" />
        </Button>
      </div>
      <div className="flex items-center gap-3 lg:gap-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/settings")}
          className="rounded-full bg-white border border-gray-300 hover:bg-gray-50"
        >
          <Settings className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600" />
        </Button>
        <Avatar className="cursor-pointer">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}


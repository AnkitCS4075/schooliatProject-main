"use client";

import { HelpCenter } from "@/components/help/help-center";

export default function SuperAdminHelpPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <HelpCenter showQueryForm={false} />
    </div>
  );
}


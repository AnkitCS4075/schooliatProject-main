"use client";

import { ProfileView } from "@/components/profile/profile-view";

export default function SuperAdminProfilePage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <ProfileView
        roleLabel="Super Admin"
        theme="super-admin"
        settingsHref="/super-admin/settings"
      />
    </div>
  );
}

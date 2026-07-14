"use client";

import { ProfileView } from "@/components/profile/profile-view";

export default function AdminProfilePage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <ProfileView
        roleLabel="School Admin"
        theme="admin"
        settingsHref="/admin/settings"
      />
    </div>
  );
}

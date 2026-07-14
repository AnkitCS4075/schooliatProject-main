import { redirect } from "next/navigation";
import { MASTER_DATA_ROUTES } from "@/lib/super-admin/master-data/routes";

export default function LegacyMasterDataLocationsPage() {
  redirect(MASTER_DATA_ROUTES.locationsTab);
}

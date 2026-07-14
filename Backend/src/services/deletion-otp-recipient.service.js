import prisma from "../prisma/client.js";
import { RoleName } from "../prisma/generated/index.js";

/**
 * Email address that receives deletion OTPs.
 * - Super admin: always the signed-in user's email.
 * - School admin: school settings `deletionOtpEmail` when set, otherwise the admin's email.
 */
export async function resolveDeletionOtpRecipientEmail(user) {
  if (!user) return null;
  const roleName = user.role?.name;
  if (roleName === RoleName.SUPER_ADMIN) {
    return user.email?.trim().toLowerCase() || null;
  }
  if (user.schoolId) {
    const settings = await prisma.settings.findFirst({
      where: { schoolId: user.schoolId, deletedAt: null },
      select: { deletionOtpEmail: true },
    });
    const configured = settings?.deletionOtpEmail?.trim();
    if (configured) return configured.toLowerCase();
  }
  return user.email?.trim().toLowerCase() || null;
}

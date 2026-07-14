
import prisma from "./src/prisma/client.js";
import dashboardService from "./src/services/dashboard.service.js";
import { RoleName } from "./src/prisma/generated/index.js";

async function test() {
    const schoolAdmin = await prisma.user.findFirst({
        where: {
            role: { name: RoleName.SCHOOL_ADMIN },
            deletedAt: null
        },
        include: { role: true }
    });

    if (!schoolAdmin) {
        console.log("No school admin found");
        process.exit(0);
    }

    console.log(`Testing dashboard for school admin: ${schoolAdmin.email}`);

    const currentYearData = await dashboardService.getDashboard(schoolAdmin, "2025-26");
    console.log("2025-26 Stats:", {
        students: currentYearData.userCounts?.students?.total,
        teachers: currentYearData.userCounts?.teachers,
        staff: currentYearData.userCounts?.staff
    });

    const prevYearData = await dashboardService.getDashboard(schoolAdmin, "2024-25");
    console.log("2024-25 Stats:", {
        students: prevYearData.userCounts?.students?.total,
        teachers: prevYearData.userCounts?.teachers,
        staff: prevYearData.userCounts?.staff
    });

    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});

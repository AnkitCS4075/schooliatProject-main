import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import browserPool from "../utils/browser-pool.util.js";
import logger from "../config/logger.js";
import prisma from "../prisma/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate TC PDF buffer
 * @param {Object} tcData - TC record with student and school info
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateTCPdf = async (tcData) => {
    try {
        const templatePath = path.join(__dirname, "../templates/tc.html");
        const htmlTemplate = await fs.readFile(templatePath, "utf-8");

        const school = await prisma.school.findUnique({
            where: { id: tcData.schoolId }
        });

        const template = Handlebars.compile(htmlTemplate);

        // Prepare data for template
        const data = {
            tcNumber: tcData.tcNumber,
            date: new Date().toLocaleDateString("en-IN"),
            studentName: `${tcData.student.firstName} ${tcData.student.lastName}`.toUpperCase(),
            fatherName: tcData.student.studentProfile?.fatherName || "N/A",
            motherName: tcData.student.studentProfile?.motherName || "N/A",
            dob: tcData.student.dateOfBirth ? new Date(tcData.student.dateOfBirth).toLocaleDateString("en-IN") : "N/A",
            class: tcData.student.studentProfile?.class?.grade || "N/A",
            division: tcData.student.studentProfile?.class?.division || "",
            admissionNumber: tcData.student.studentProfile?.admissionNumber || "N/A",
            transferDate: new Date(tcData.transferDate).toLocaleDateString("en-IN"),
            reason: tcData.reason,
            destinationSchool: tcData.destinationSchool || "N/A",
            schoolName: school?.name || "SchooliAT Public School",
            schoolAddress: school?.address || "Address not available",
            schoolPhone: school?.phone || "Phone not available",
            schoolEmail: school?.email || "Email not available",
            schoolAffiliation: school?.affiliationNumber || "N/A",
        };

        const renderedHtml = template(data);

        const browser = await browserPool.acquire();
        let page;
        try {
            page = await browser.newPage();
            await page.setContent(renderedHtml, { waitUntil: "networkidle0" });
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20mm",
                    right: "20mm",
                    bottom: "20mm",
                    left: "20mm"
                }
            });
            return Buffer.from(pdfBuffer);
        } finally {
            if (page) await page.close();
            browserPool.release(browser);
        }
    } catch (error) {
        logger.error({ error: error.message }, "Failed to generate TC PDF");
        throw new Error("Failed to generate Transfer Certificate PDF");
    }
};

const tcPdfService = {
    generateTCPdf,
};

export default tcPdfService;

import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import getSubjectsSchema from "../schemas/subject/get-subjects.schema.js";
import createSubjectSchema from "../schemas/subject/create-subject.schema.js";
import updateSubjectSchema from "../schemas/subject/update-subject.schema.js";
import deleteSubjectSchema from "../schemas/subject/delete-subject.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import subjectService from "../services/subject.service.js";
import logger from "../config/logger.js";

const router = Router();

router.get(
    "/",
    withPermission([Permission.GET_CLASSES, Permission.GET_HOMEWORK]),
    validateRequest(getSubjectsSchema),
    async (req, res) => {
        const currentUser = req.context.user;
        const { page, limit } = req.query;

        if (!currentUser?.schoolId) {
            return res.status(400).json({
                errorCode: "SCHOOL_CONTEXT_REQUIRED",
                message: "User is not associated with a school.",
            });
        }

        try {
            const result = await subjectService.getSubjects(currentUser.schoolId, {
                page,
                limit,
            });

            return res.json({
                message: "Subjects fetched successfully",
                data: result.subjects,
                pagination: {
                    total: result.total,
                    totalPages: result.totalPages,
                    page: result.page,
                    limit: result.limit,
                },
            });
        } catch (error) {
            logger.error({ error, query: req.query }, "Failed to fetch subjects");
            return res.status(500).json({
                errorCode: "SUBJECTS_FETCH_FAILED",
                message: error.message || "Failed to fetch subjects",
            });
        }
    },
);

router.post(
    "/",
    withPermission([Permission.CREATE_CLASSES]),
    validateRequest(createSubjectSchema),
    async (req, res) => {
        const currentUser = req.context.user;

        if (!currentUser?.schoolId) {
            return res.status(400).json({
                errorCode: "SCHOOL_CONTEXT_REQUIRED",
                message: "User is not associated with a school.",
            });
        }

        const { name, code, description } = req.body.request;

        try {
            const subject = await subjectService.createSubject({
                name,
                code,
                description,
                schoolId: currentUser.schoolId,
                createdBy: currentUser.id,
            });

            return res.status(201).json({
                message: "Subject created successfully",
                data: subject,
            });
        } catch (error) {
            logger.error({ error, body: req.body }, "Failed to create subject");
            return res.status(400).json({
                errorCode: "SUBJECT_CREATION_FAILED",
                message: error.message || "Failed to create subject",
            });
        }
    },
);

router.patch(
    "/:id",
    withPermission([Permission.EDIT_CLASSES]),
    validateRequest(updateSubjectSchema),
    async (req, res) => {
        const currentUser = req.context.user;

        if (!currentUser?.schoolId) {
            return res.status(400).json({
                errorCode: "SCHOOL_CONTEXT_REQUIRED",
                message: "User is not associated with a school.",
            });
        }

        const { id } = req.params;
        const updateData = req.body.request;

        try {
            const subject = await subjectService.updateSubject(
                id,
                updateData,
                currentUser.schoolId,
                currentUser.id
            );

            return res.json({
                message: "Subject updated successfully",
                data: subject,
            });
        } catch (error) {
            logger.error({ error, params: req.params, body: req.body }, "Failed to update subject");
            return res.status(400).json({
                errorCode: "SUBJECT_UPDATE_FAILED",
                message: error.message || "Failed to update subject",
            });
        }
    },
);

router.delete(
    "/:id",
    withPermission([Permission.DELETE_CLASSES]),
    validateRequest(deleteSubjectSchema),
    requireDeletionOTP({ entityType: "Subject" }),
    async (req, res) => {
        const currentUser = req.context.user;

        if (!currentUser?.schoolId) {
            return res.status(400).json({
                errorCode: "SCHOOL_CONTEXT_REQUIRED",
                message: "User is not associated with a school.",
            });
        }

        const { id } = req.params;

        try {
            await subjectService.deleteSubject(id, currentUser.schoolId, currentUser.id);

            return res.json({
                message: "Subject deleted successfully",
            });
        } catch (error) {
            logger.error({ error, params: req.params }, "Failed to delete subject");
            return res.status(400).json({
                errorCode: "SUBJECT_DELETION_FAILED",
                message: error.message || "Failed to delete subject",
            });
        }
    },
);

export default router;

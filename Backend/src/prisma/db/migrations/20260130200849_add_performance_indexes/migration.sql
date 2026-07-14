-- CreateIndex
CREATE INDEX "fee_installments_school_installment_status_idx" ON "fee_installments"("school_id", "installement_number", "payment_status", "deleted_at");

-- CreateIndex
CREATE INDEX "fee_installments_school_id_deleted_at_idx" ON "fee_installments"("school_id", "deleted_at");

-- CreateIndex
CREATE INDEX "fee_installments_student_id_deleted_at_idx" ON "fee_installments"("student_id", "deleted_at");

-- CreateIndex
CREATE INDEX "notices_school_id_deleted_at_idx" ON "notices"("school_id", "deleted_at");

-- CreateIndex
CREATE INDEX "notices_school_id_visible_range_idx" ON "notices"("school_id", "visible_from", "visible_to");

-- CreateIndex
CREATE INDEX "users_school_id_deleted_at_idx" ON "users"("school_id", "deleted_at");

-- CreateIndex
CREATE INDEX "users_role_id_user_type_deleted_at_idx" ON "users"("role_id", "user_type", "deleted_at");

-- CreateIndex
CREATE INDEX "users_school_id_role_id_deleted_at_idx" ON "users"("school_id", "role_id", "deleted_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

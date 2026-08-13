"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StaffTable } from "@/components/staff/staff-table";
import { useStaffPage, useCreateStaff, useDeleteStaff, useBulkDeleteStaff } from "@/lib/hooks/use-staff";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffSchema, StaffFormData } from "@/lib/schemas/staff-schema";
import { FormCard } from "@/components/forms/form-card";
import { RadioGroup } from "@/components/forms/radio-group";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { RoleAssignmentSelector } from "@/components/admin/custom-roles/role-assignment-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { UserPlus, Copy, KeyRound } from "lucide-react";

type CreatedCredentials = { email: string; password: string } | null;

type StaffOtpTarget =
    | { mode: "one"; id: string }
    | { mode: "bulk"; ids: string[] };

export default function StaffPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials>(null);
    const [staffOtpTarget, setStaffOtpTarget] = useState<StaffOtpTarget | null>(null);
    const limit = 15;

    // Staff data
    const { data: staffData, isLoading: staffLoading, refetch: refetchStaff } = useStaffPage(page, limit);
    const staff = staffData?.data || [];
    const staffTotalPages = staffData?.totalPages || 1;

    // Mutations
    const createStaff = useCreateStaff();
    const deleteStaff = useDeleteStaff();
    const bulkDeleteStaff = useBulkDeleteStaff();

    // Staff form
    const staffForm = useForm<StaffFormData>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            gender: undefined,
            dob: "",
            contact: "",
            email: "",
            areaStreet: "",
            location: "",
            district: "",
            pincode: "",
            state: "",
            registrationPhotoId: null,
            aadhaarId: "",
            designation: "",
            customRoleId: "",
        },
        mode: "onBlur",
    });

    const handleCreateStaff = useCallback(async (data: StaffFormData) => {
        try {
            const result = await createStaff.mutateAsync(data);
            const created = result?.data;
            const password = created?.password;
            staffForm.reset();
            setIsAddStaffDialogOpen(false);
            refetchStaff();
            if (password && created?.email) {
                setCreatedCredentials({ email: created.email, password });
            } else {
                toast.success("Staff member created successfully!");
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to create staff member");
        }
    }, [createStaff, staffForm, refetchStaff]);

    const handleDeleteStaff = useCallback((staffId: string) => {
        setStaffOtpTarget({ mode: "one", id: staffId });
    }, []);

    const handleBulkDelete = useCallback((ids: string[]) => {
        setStaffOtpTarget({ mode: "bulk", ids });
    }, []);

    const handleEditStaff = useCallback((member: any) => {
        if (member?.id) {
            router.push(`/admin/staff/${member.id}/edit`);
        }
    }, [router]);

    return (
        <div className="space-y-6 pb-8">
            {/* Table */}
            <StaffTable
                staff={staff}
                onAddNew={() => setIsAddStaffDialogOpen(true)}
                onEdit={handleEditStaff}
                onDelete={handleDeleteStaff}
                onBulkDelete={handleBulkDelete}
                page={page - 1}
                onPageChange={(newPage) => setPage(newPage + 1)}
                serverTotalPages={staffTotalPages}
                loading={staffLoading}
                onRefresh={refetchStaff}
            />

            {/* Add Staff Dialog */}
            <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Add New Staff Member</DialogTitle>
                        <DialogDescription>
                            Fill in the information below to add a new staff member.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-4 min-h-0">
                        <FormProvider {...staffForm}>
                            <form onSubmit={staffForm.handleSubmit(handleCreateStaff)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                                    {/* Basic Information */}
                                    <FormCard title="Basic Information">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="publicUserId">Login ID (Optional)</Label>
                                                <Input
                                                    id="publicUserId"
                                                    {...staffForm.register("publicUserId")}
                                                    placeholder="e.g. SCHAT001"
                                                />
                                                <p className="text-[10px] text-muted-foreground italic">
                                                    Share this with the staff member for mobile/app login. If left blank, it will be auto-generated.
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name *</Label>
                                                <Input
                                                    id="firstName"
                                                    {...staffForm.register("firstName")}
                                                    placeholder="First Name"
                                                    className={staffForm.formState.errors.firstName ? "border-red-500" : ""}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name *</Label>
                                                <Input
                                                    id="lastName"
                                                    {...staffForm.register("lastName")}
                                                    placeholder="Last Name"
                                                    className={staffForm.formState.errors.lastName ? "border-red-500" : ""}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Gender *</Label>
                                                <Controller
                                                    control={staffForm.control}
                                                    name="gender"
                                                    render={({ field: { value, onChange } }) => (
                                                        <RadioGroup
                                                            options={[
                                                                { value: "MALE", label: "Male" },
                                                                { value: "FEMALE", label: "Female" },
                                                            ]}
                                                            value={value}
                                                            onChange={onChange}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="dob">Date of Birth *</Label>
                                                <Input
                                                    id="dob"
                                                    type="date"
                                                    {...staffForm.register("dob")}
                                                    className={staffForm.formState.errors.dob ? "border-red-500" : ""}
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="aadhaarId">Aadhaar ID *</Label>
                                                <Input
                                                    id="aadhaarId"
                                                    {...staffForm.register("aadhaarId")}
                                                    placeholder="XXXX XXXX XXXX"
                                                    maxLength={12}
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2 md:col-span-1">
                                                <Label htmlFor="designation">Designation</Label>
                                                <Input
                                                    id="designation"
                                                    {...staffForm.register("designation")}
                                                    placeholder="e.g. Office Assistant"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2 md:col-span-1">
                                                <Label htmlFor="basicSalary">Monthly Base Salary</Label>
                                                <Input
                                                    id="basicSalary"
                                                    type="number"
                                                    {...staffForm.register("basicSalary", { valueAsNumber: true })}
                                                    placeholder="Enter exact salary (e.g. 50000)"
                                                    className={staffForm.formState.errors.basicSalary ? "border-red-500" : ""}
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <PhotoUpload
                                                    name="registrationPhotoId"
                                                    label="Profile Photo"
                                                />
                                            </div>
                                        </div>
                                    </FormCard>

                                    {/* Contact & Address */}
                                    <FormCard title="Contact & Address">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact">Contact *</Label>
                                                <Input
                                                    id="contact"
                                                    {...staffForm.register("contact")}
                                                    placeholder="Phone number"
                                                    maxLength={10}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    {...staffForm.register("email")}
                                                    placeholder="example@gmail.com"
                                                />
                                            </div>

                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="areaStreet">Area and Street *</Label>
                                                <Input
                                                    id="areaStreet"
                                                    {...staffForm.register("areaStreet")}
                                                    placeholder="Area and Street"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="location">Location *</Label>
                                                <Input
                                                    id="location"
                                                    {...staffForm.register("location")}
                                                    placeholder="Location"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="district">District *</Label>
                                                <Input
                                                    id="district"
                                                    {...staffForm.register("district")}
                                                    placeholder="District"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="pincode">Pincode *</Label>
                                                <Input
                                                    id="pincode"
                                                    {...staffForm.register("pincode")}
                                                    placeholder="6 digits"
                                                    maxLength={6}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="state">State *</Label>
                                                <Input
                                                    id="state"
                                                    {...staffForm.register("state")}
                                                    placeholder="State"
                                                />
                                            </div>
                                        </div>
                                    </FormCard>

                                    {/* Role Assignment — inline custom role with read-only permission preview */}
                                    <FormCard title="Role & Permissions" className="md:col-span-2">
                                        <RoleAssignmentSelector
                                            value={staffForm.watch("customRoleId") || ""}
                                            onChange={(roleId) => staffForm.setValue("customRoleId", roleId, { shouldValidate: true })}
                                            hint="Selecting a role grants the listed permissions immediately and emails the staff member their login credentials."
                                        />
                                    </FormCard>
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                staffForm.reset();
                                setIsAddStaffDialogOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={staffForm.handleSubmit(handleCreateStaff)}
                            disabled={createStaff.isPending}
                            className="bg-primary hover:bg-primary/90 font-bold px-8"
                        >
                            {createStaff.isPending ? "Creating..." : "Create Staff Member"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Login credentials modal after create */}
            <Dialog open={!!createdCredentials} onOpenChange={() => setCreatedCredentials(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5" />
                            Staff login credentials
                        </DialogTitle>
                        <DialogDescription>
                            Share these with the staff member for app and dashboard login. The password cannot be viewed again.
                        </DialogDescription>
                    </DialogHeader>
                    {createdCredentials && (
                        <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                            <div>
                                <Label className="text-muted-foreground text-xs">Login ID (Email)</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input readOnly value={createdCredentials.email} className="font-mono" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdCredentials.email);
                                            toast.success("Email copied");
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Temporary password</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input readOnly value={createdCredentials.password} className="font-mono" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdCredentials.password);
                                            toast.success("Password copied");
                                        }}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setCreatedCredentials(null)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeletionOtpDialog
                open={!!staffOtpTarget}
                onOpenChange={(open) => !open && setStaffOtpTarget(null)}
                audience="school-admin"
                title={
                    staffOtpTarget?.mode === "bulk"
                        ? `Delete ${staffOtpTarget.ids.length} staff member(s)`
                        : "Delete staff member"
                }
                description="This removes the staff member from your school. You must confirm with an email code."
                entityType={SCHOOL_DELETION_ENTITY.STAFF}
                entityId={
                    staffOtpTarget?.mode === "one"
                        ? staffOtpTarget.id
                        : staffOtpTarget
                            ? `bulk:${staffOtpTarget.ids.length}`
                            : ""
                }
                isDeleting={deleteStaff.isPending || bulkDeleteStaff.isPending}
                onDeleteWithOtp={async (otp) => {
                    if (!staffOtpTarget) return;
                    if (staffOtpTarget.mode === "one") {
                        await deleteStaff.mutateAsync({ id: staffOtpTarget.id, otp });
                        toast.success("Staff member deleted");
                    } else {
                        const res = await bulkDeleteStaff.mutateAsync({
                            staffIds: staffOtpTarget.ids,
                            otp,
                        });
                        const n =
                            (res as { data?: { count?: number } })?.data?.count ??
                            staffOtpTarget.ids.length;
                        toast.success(`${n} staff member(s) deleted`);
                    }
                    refetchStaff();
                }}
            />
        </div>
    );
}

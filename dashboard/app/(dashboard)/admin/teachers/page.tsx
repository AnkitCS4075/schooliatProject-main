"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TeachersTable } from "@/components/teachers/teachers-table";
import {
  useTeachersPage,
  useCreateTeacher,
  useDeleteTeacher,
  useBulkDeleteTeachers,
  useBulkUploadTeachers,
} from "@/lib/hooks/use-teachers";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";
import { BulkUploadDialog } from "@/components/common/bulk-upload-dialog";
import {
  TEACHER_BULK_CSV,
  getTeacherBulkUploadCsv,
  triggerCsvDownload,
} from "@/lib/bulk-upload/school-csv-templates";
import { FileDown, FileUp, Loader2, Plus, Search, Trash2, Mail, Phone, MapPin, User, ShieldCheck, Download } from "lucide-react";
import { downloadFromApi } from "@/lib/api/client";
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
import { useForm, FormProvider, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addTeacherSchemaWithRefinement,
  AddTeacherFormData,
} from "@/lib/schemas/teacher-schema";
import { FormCard } from "@/components/forms/form-card";
import { RadioGroup } from "@/components/forms/radio-group";
import { ChipGroup } from "@/components/forms/chip-group";
import { TransportDropdown } from "@/components/forms/transport-dropdown";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { UserPlus, Copy, KeyRound } from "lucide-react";

type CreatedCredentials = {
  email: string;
  password: string;
  publicUserId?: string | null;
} | null;

type TeacherOtpTarget =
  | { mode: "one"; id: string }
  | { mode: "bulk"; ids: string[] };

export default function TeachersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [isAddTeacherDialogOpen, setIsAddTeacherDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials>(null);
  const [teacherOtpTarget, setTeacherOtpTarget] = useState<TeacherOtpTarget | null>(null);
  const limit = 15;

  // Teachers data
  const { data: teachersData, isLoading: teachersLoading, refetch: refetchTeachers } = useTeachersPage(page, limit);
  const teachers = teachersData?.data || [];
  const teachersTotalPages = teachersData?.totalPages || 1;

  // Mutations
  const createTeacher = useCreateTeacher();
  const deleteTeacher = useDeleteTeacher();
  const bulkDeleteTeachers = useBulkDeleteTeachers();
  const bulkUploadTeachers = useBulkUploadTeachers();

  // Teacher form
  const teacherForm = useForm<AddTeacherFormData>({
    resolver: zodResolver(addTeacherSchemaWithRefinement),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      dob: "",
      designation: "",
      contact: "",
      email: "",
      areaStreet: "",
      location: "",
      district: "",
      pincode: "",
      state: "",
      highestQualification: "",
      university: "",
      yearOfPassing: "",
      percentage: "",
      transportMode: "Transport",
      transportId: "",
      registrationPhotoId: null,
      aadhaarId: "",
      panCardNumber: "",
      subjects: "",
    },
    mode: "onBlur",
  });

  const onCreateTeacherInvalid = useCallback((errors: FieldErrors<AddTeacherFormData>) => {
    const first = Object.values(errors).find(
      (e): e is { message?: string } => !!e && typeof e === "object" && "message" in e && !!e.message
    );
    toast.error(first?.message ?? "Please complete all required fields (including subjects and transport if applicable).");
  }, []);

  const handleCreateTeacher = useCallback(async (data: AddTeacherFormData) => {
    try {
      const result = await createTeacher.mutateAsync(data);
      const created = result?.data;
      const password = created?.password;
      teacherForm.reset();
      setIsAddTeacherDialogOpen(false);
      refetchTeachers();
      if (password && created?.email) {
        setCreatedCredentials({
          email: created.email,
          password,
          publicUserId: created.publicUserId,
        });
        toast.success("Teacher created — save mobile login details in the dialog.");
      } else {
        toast.success("Teacher created successfully!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create teacher");
    }
  }, [createTeacher, teacherForm, refetchTeachers]);

  const handleDeleteTeacher = useCallback((teacherId: string) => {
    setTeacherOtpTarget({ mode: "one", id: teacherId });
  }, []);

  const handleBulkDelete = useCallback((ids: string[]) => {
    setTeacherOtpTarget({ mode: "bulk", ids });
  }, []);

  const handleEditTeacher = useCallback((teacher: any) => {
    router.push(`/admin/teachers/${teacher.id}/edit`);
  }, [router]);

  const transportMode = teacherForm.watch("transportMode");

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage teachers and their information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddTeacherDialogOpen(true)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Teacher
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              triggerCsvDownload(TEACHER_BULK_CSV.filename, getTeacherBulkUploadCsv());
              toast.success("Sample CSV downloaded — replace the example row with your data.");
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download sample
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBulkUploadDialogOpen(true)}
            className="gap-2"
          >
            <FileUp className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setIsExporting(true);
              try {
                const blob = await downloadFromApi("/users/teachers/export");
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "all_teachers.csv";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Teachers exported successfully!");
              } catch (e: any) {
                toast.error(e?.message || "Failed to export teachers");
              } finally {
                setIsExporting(false);
              }
            }}
            className="gap-2"
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Download All
          </Button>
        </div>
      </div>

      {/* Teachers Table */}
      <TeachersTable
        teachers={teachers}
        onEdit={handleEditTeacher}
        onDelete={handleDeleteTeacher}
        onBulkDelete={handleBulkDelete}
        page={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        serverTotalPages={teachersTotalPages}
        loading={teachersLoading}
        onRefresh={refetchTeachers}
      />

      <Dialog open={isAddTeacherDialogOpen} onOpenChange={setIsAddTeacherDialogOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Fill in the teacher information below. All required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-4 min-h-0">
            <FormProvider {...teacherForm}>
              <form
                id="add-teacher-dialog-form"
                onSubmit={teacherForm.handleSubmit(handleCreateTeacher, onCreateTeacherInvalid)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <FormCard title="Basic Information">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="publicUserId">Login ID (Optional)</Label>
                        <Input
                          id="publicUserId"
                          {...teacherForm.register("publicUserId")}
                          placeholder="e.g. SCHT001"
                        />
                        <p className="text-[10px] text-muted-foreground italic">
                          Share this with the teacher for mobile/app tracking and login. If left blank, it will be auto-generated.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...teacherForm.register("firstName")}
                          placeholder="First Name"
                          className={teacherForm.formState.errors.firstName ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...teacherForm.register("lastName")}
                          placeholder="Last Name"
                          className={teacherForm.formState.errors.lastName ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Gender *</Label>
                        <Controller
                          control={teacherForm.control}
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
                        {teacherForm.formState.errors.gender && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.gender.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth *</Label>
                        <Input
                          id="dob"
                          type="date"
                          {...teacherForm.register("dob")}
                          className={teacherForm.formState.errors.dob ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.dob && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.dob.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation *</Label>
                        <Input
                          id="designation"
                          {...teacherForm.register("designation")}
                          placeholder="Designation"
                          className={teacherForm.formState.errors.designation ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.designation && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.designation.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="aadhaarId">Aadhaar ID *</Label>
                        <Input
                          id="aadhaarId"
                          type="tel"
                          {...teacherForm.register("aadhaarId")}
                          placeholder="XXXX XXXX XXXX"
                          maxLength={12}
                          className={teacherForm.formState.errors.aadhaarId ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.aadhaarId && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.aadhaarId.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 col-span-2">
                        <PhotoUpload
                          name="registrationPhotoId"
                          label="Teacher Photo"
                        />
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="panCardNumber">PAN card number</Label>
                        <Input
                          id="panCardNumber"
                          {...teacherForm.register("panCardNumber")}
                          placeholder="e.g. ABCDE1234F"
                          maxLength={10}
                          autoCapitalize="characters"
                          autoCorrect="off"
                          spellCheck={false}
                          className={teacherForm.formState.errors.panCardNumber ? "border-red-500 uppercase" : "uppercase"}
                        />
                        {teacherForm.formState.errors.panCardNumber && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.panCardNumber.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormCard>

                  {/* Contact Information */}
                  <FormCard title="Contact Information">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact *</Label>
                        <Input
                          id="contact"
                          type="tel"
                          {...teacherForm.register("contact")}
                          placeholder="Contact number"
                          maxLength={10}
                          className={teacherForm.formState.errors.contact ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.contact && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.contact.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...teacherForm.register("email")}
                          placeholder="example@gmail.com"
                          className={teacherForm.formState.errors.email ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="areaStreet">Area and Street *</Label>
                        <Input
                          id="areaStreet"
                          {...teacherForm.register("areaStreet")}
                          placeholder="Area and Street"
                          className={teacherForm.formState.errors.areaStreet ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.areaStreet && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.areaStreet.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          {...teacherForm.register("location")}
                          placeholder="Location"
                          className={teacherForm.formState.errors.location ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.location && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.location.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">District *</Label>
                        <Input
                          id="district"
                          {...teacherForm.register("district")}
                          placeholder="District"
                          className={teacherForm.formState.errors.district ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.district && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.district.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          type="tel"
                          {...teacherForm.register("pincode")}
                          placeholder="Pincode"
                          maxLength={6}
                          className={teacherForm.formState.errors.pincode ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.pincode && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.pincode.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          {...teacherForm.register("state")}
                          placeholder="State"
                          className={teacherForm.formState.errors.state ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.state && (
                          <p className="text-sm text-red-500">{teacherForm.formState.errors.state.message}</p>
                        )}
                      </div>
                    </div>
                  </FormCard>

                  {/* Education */}
                  <FormCard title="Education">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="highestQualification">Highest Qualification *</Label>
                        <Input
                          id="highestQualification"
                          {...teacherForm.register("highestQualification")}
                          placeholder="E.g. B.E"
                          className={
                            teacherForm.formState.errors.highestQualification ? "border-red-500" : ""
                          }
                        />
                        {teacherForm.formState.errors.highestQualification && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.highestQualification.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="university">University *</Label>
                        <Input
                          id="university"
                          {...teacherForm.register("university")}
                          placeholder="University Name"
                          className={teacherForm.formState.errors.university ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.university && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.university.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearOfPassing">Year of Passing *</Label>
                        <Input
                          id="yearOfPassing"
                          type="tel"
                          {...teacherForm.register("yearOfPassing")}
                          placeholder="Year"
                          maxLength={4}
                          className={teacherForm.formState.errors.yearOfPassing ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.yearOfPassing && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.yearOfPassing.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="percentage">Percentage / Grade *</Label>
                        <Input
                          id="percentage"
                          {...teacherForm.register("percentage")}
                          placeholder="e.g. 78%, 8.2 CGPA"
                          className={teacherForm.formState.errors.percentage ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.percentage && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.percentage.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="subjects">Subjects taught *</Label>
                        <Input
                          id="subjects"
                          {...teacherForm.register("subjects")}
                          placeholder="e.g. Mathematics, Physics"
                          className={teacherForm.formState.errors.subjects ? "border-red-500" : ""}
                        />
                        {teacherForm.formState.errors.subjects && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.subjects.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </FormCard>

                  {/* Additional Information */}
                  <FormCard title="Additional Information">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="basicSalary">Monthly Base Salary</Label>
                        <Input
                          id="basicSalary"
                          type="number"
                          {...teacherForm.register("basicSalary", { valueAsNumber: true })}
                          placeholder="E.g. 60000"
                          className={teacherForm.formState.errors.basicSalary ? "border-red-500" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Transport Mode *</Label>
                        <Controller
                          control={teacherForm.control}
                          name="transportMode"
                          render={({ field: { value, onChange } }) => (
                            <ChipGroup
                              options={[
                                { value: "Transport", label: "Transport" },
                                { value: "Non Transport", label: "Non Transport" },
                              ]}
                              value={value}
                              onChange={(val) => {
                                onChange(val);
                                if (val === "Non Transport") {
                                  teacherForm.setValue("transportId", "");
                                }
                              }}
                            />
                          )}
                        />
                        {teacherForm.formState.errors.transportMode && (
                          <p className="text-sm text-red-500">
                            {teacherForm.formState.errors.transportMode.message}
                          </p>
                        )}
                      </div>

                      {transportMode === "Transport" && (
                        <div className="space-y-2">
                          <TransportDropdown
                            name="transportId"
                            label="Select Transport *"
                            rules={{ required: "Transport is required" }}
                          />
                          {teacherForm.formState.errors.transportId && (
                            <p className="text-sm text-red-500">
                              {teacherForm.formState.errors.transportId.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </FormCard>
                </div>
              </form>
            </FormProvider>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                teacherForm.reset();
                setIsAddTeacherDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => teacherForm.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              form="add-teacher-dialog-form"
              disabled={createTeacher.isPending}
            >
              {createTeacher.isPending ? "Creating..." : "Create Teacher"}
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
              Teacher login credentials
            </DialogTitle>
            <DialogDescription>
              Mobile app: use email or Login ID with this password and header{" "}
              <span className="font-mono text-xs">x-platform: android</span> or{" "}
              <span className="font-mono text-xs">ios</span>. This password is shown only once.
            </DialogDescription>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
              <div>
                <Label className="text-muted-foreground text-xs">Email (mobile login)</Label>
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
              {createdCredentials.publicUserId ? (
                <div>
                  <Label className="text-muted-foreground text-xs">Login ID (alternate)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input readOnly value={createdCredentials.publicUserId} className="font-mono" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.publicUserId!);
                        toast.success("Login ID copied");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
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

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={isBulkUploadDialogOpen}
        onOpenChange={setIsBulkUploadDialogOpen}
        title="Bulk Upload Teachers"
        description="Upload a CSV file with teacher details. A mobile login password is created for each successful row; download the credentials CSV from the results (shown once)."
        onUpload={(csv) => bulkUploadTeachers.mutateAsync(csv)}
        templateFilename={TEACHER_BULK_CSV.filename}
        templateHeaders={[...TEACHER_BULK_CSV.headers]}
        templateSampleRow={[...TEACHER_BULK_CSV.sampleRow]}
      />

      <DeletionOtpDialog
        open={!!teacherOtpTarget}
        onOpenChange={(open) => !open && setTeacherOtpTarget(null)}
        audience="school-admin"
        title={
          teacherOtpTarget?.mode === "bulk"
            ? `Delete ${teacherOtpTarget.ids.length} teacher(s)`
            : "Delete teacher"
        }
        description="This removes the teacher from your school. You must confirm with an email code."
        entityType={SCHOOL_DELETION_ENTITY.TEACHER}
        entityId={
          teacherOtpTarget?.mode === "one"
            ? teacherOtpTarget.id
            : teacherOtpTarget
              ? `bulk:${teacherOtpTarget.ids.length}`
              : ""
        }
        isDeleting={deleteTeacher.isPending || bulkDeleteTeachers.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!teacherOtpTarget) return;
          if (teacherOtpTarget.mode === "one") {
            await deleteTeacher.mutateAsync({ id: teacherOtpTarget.id, otp });
            toast.success("Teacher deleted");
          } else {
            const res = await bulkDeleteTeachers.mutateAsync({
              teacherIds: teacherOtpTarget.ids,
              otp,
            });
            const n = (res as { data?: { count?: number } })?.data?.count ?? teacherOtpTarget.ids.length;
            toast.success(`${n} teacher(s) deleted`);
          }
          refetchTeachers();
        }}
      />
    </div >
  );
}


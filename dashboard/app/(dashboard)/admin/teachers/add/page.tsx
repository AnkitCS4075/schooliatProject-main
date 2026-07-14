"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addTeacherSchemaWithRefinement,
  AddTeacherFormData,
} from "@/lib/schemas/teacher-schema";
import { useCreateTeacher } from "@/lib/hooks/use-teachers";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/forms/radio-group";
import { ChipGroup } from "@/components/forms/chip-group";
import { TransportDropdown } from "@/components/forms/transport-dropdown";
import { PhotoUpload } from "@/components/forms/photo-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, KeyRound } from "lucide-react";
import {
  TEACHER_BULK_CSV,
  getTeacherBulkUploadCsv,
  triggerCsvDownload,
} from "@/lib/bulk-upload/school-csv-templates";

type CreatedCredentials = {
  email: string;
  password: string;
  publicUserId?: string | null;
} | null;

export default function AddTeacherPage() {
  const router = useRouter();
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials>(null);
  const { mutateAsync: createTeacher, isPending: isSaving } = useCreateTeacher();

  const methods = useForm<AddTeacherFormData>({
    resolver: zodResolver(addTeacherSchemaWithRefinement) as any,
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

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const transportMode = watch("transportMode");

  const onSubmit = async (data: AddTeacherFormData) => {
    try {
      const result = await createTeacher(data);
      const created = result?.data;
      const password = created?.password;
      if (password && created?.email) {
        setCreatedCredentials({
          email: created.email,
          password,
          publicUserId: created.publicUserId,
        });
        toast.success("Teacher created — save mobile login details below.");
      } else {
        toast.success("Teacher saved successfully");
        reset();
        router.push("/admin/teachers");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to save teacher");
    }
  };

  return (
    <>
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8 overflow-y-auto max-h-[calc(100vh-120px)]">
        <FormTopBar
          title="Add New Teacher"
          onCancel={() => router.push("/admin/teachers")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit, (err) => {
            const keys = Object.keys(err);
            if (keys.length > 0) {
              const first = (err as any)[keys[0]];
              toast.error(`Please fix: ${first?.message || "Validation error"}`);
            }
          })}
          isSaving={isSaving}
          extraActions={
            <button
              type="button"
              onClick={() => {
                triggerCsvDownload(TEACHER_BULK_CSV.filename, getTeacherBulkUploadCsv());
                toast.success("Sample CSV downloaded — same format as Teachers → Bulk Upload.");
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              Download sample
            </button>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <FormCard title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...methods.register("firstName")}
                    placeholder="First Name"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...methods.register("lastName")}
                    placeholder="Last Name"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Controller
                    control={methods.control}
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
                  {errors.gender && (
                    <p className="text-sm text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    {...methods.register("dob")}
                    className={errors.dob ? "border-red-500" : ""}
                  />
                  {errors.dob && (
                    <p className="text-sm text-red-500">{errors.dob.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    {...methods.register("designation")}
                    placeholder="Designation"
                    className={errors.designation ? "border-red-500" : ""}
                  />
                  {errors.designation && (
                    <p className="text-sm text-red-500">
                      {errors.designation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects</Label>
                  <Input
                    id="subjects"
                    {...methods.register("subjects")}
                    placeholder="e.g. Maths, Science"
                    className={errors.subjects ? "border-red-500" : ""}
                  />
                  {errors.subjects && (
                    <p className="text-sm text-red-500">
                      {errors.subjects.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaarId">Aadhaar ID</Label>
                  <Input
                    id="aadhaarId"
                    type="tel"
                    {...methods.register("aadhaarId")}
                    placeholder="XXXX XXXX XXXX"
                    maxLength={12}
                    className={errors.aadhaarId ? "border-red-500" : ""}
                  />
                  {errors.aadhaarId && (
                    <p className="text-sm text-red-500">
                      {errors.aadhaarId.message}
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
                    {...methods.register("panCardNumber")}
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    className={errors.panCardNumber ? "border-red-500 uppercase" : "uppercase"}
                  />
                  {errors.panCardNumber && (
                    <p className="text-sm text-red-500">
                      {errors.panCardNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </FormCard>

            {/* Contact Information */}
            <FormCard title="Contact Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    type="tel"
                    {...methods.register("contact")}
                    placeholder="Contact number"
                    maxLength={10}
                    className={errors.contact ? "border-red-500" : ""}
                  />
                  {errors.contact && (
                    <p className="text-sm text-red-500">
                      {errors.contact.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...methods.register("email")}
                    placeholder="example@gmail.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="areaStreet">Area and Street</Label>
                  <Input
                    id="areaStreet"
                    {...methods.register("areaStreet")}
                    placeholder="Area and Street"
                    className={errors.areaStreet ? "border-red-500" : ""}
                  />
                  {errors.areaStreet && (
                    <p className="text-sm text-red-500">
                      {errors.areaStreet.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...methods.register("location")}
                    placeholder="Location"
                    className={errors.location ? "border-red-500" : ""}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    {...methods.register("district")}
                    placeholder="District"
                    className={errors.district ? "border-red-500" : ""}
                  />
                  {errors.district && (
                    <p className="text-sm text-red-500">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    type="tel"
                    {...methods.register("pincode")}
                    placeholder="Pincode"
                    maxLength={6}
                    className={errors.pincode ? "border-red-500" : ""}
                  />
                  {errors.pincode && (
                    <p className="text-sm text-red-500">
                      {errors.pincode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...methods.register("state")}
                    placeholder="State"
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state.message}</p>
                  )}
                </div>
              </div>
            </FormCard>

            {/* Education */}
            <FormCard title="Education">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="highestQualification">
                    Highest Qualification
                  </Label>
                  <Input
                    id="highestQualification"
                    {...methods.register("highestQualification")}
                    placeholder="E.g. B.E"
                    className={
                      errors.highestQualification ? "border-red-500" : ""
                    }
                  />
                  {errors.highestQualification && (
                    <p className="text-sm text-red-500">
                      {errors.highestQualification.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    {...methods.register("university")}
                    placeholder="University Name"
                    className={errors.university ? "border-red-500" : ""}
                  />
                  {errors.university && (
                    <p className="text-sm text-red-500">
                      {errors.university.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfPassing">Year of Passing</Label>
                  <Input
                    id="yearOfPassing"
                    type="tel"
                    {...methods.register("yearOfPassing")}
                    placeholder="Year"
                    maxLength={4}
                    className={errors.yearOfPassing ? "border-red-500" : ""}
                  />
                  {errors.yearOfPassing && (
                    <p className="text-sm text-red-500">
                      {errors.yearOfPassing.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentage">Percentage / Grade</Label>
                  <Input
                    id="percentage"
                    {...methods.register("percentage")}
                    placeholder="e.g. 78%, 8.2 CGPA"
                    className={errors.percentage ? "border-red-500" : ""}
                  />
                  {errors.percentage && (
                    <p className="text-sm text-red-500">
                      {errors.percentage.message}
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
                    {...methods.register("basicSalary", { valueAsNumber: true })}
                    placeholder="E.g. 60000"
                    className={errors.basicSalary ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Transport Mode</Label>
                  <Controller
                    control={methods.control}
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
                            setValue("transportId", "");
                          }
                        }}
                      />
                    )}
                  />
                  {errors.transportMode && (
                    <p className="text-sm text-red-500">
                      {errors.transportMode.message}
                    </p>
                  )}
                </div>

                {transportMode === "Transport" && (
                  <div className="space-y-2">
                    <TransportDropdown
                      name="transportId"
                      label="Select Transport"
                      rules={{ required: "Transport is required" }}
                    />
                    {errors.transportId && (
                      <p className="text-sm text-red-500">
                        {errors.transportId.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </FormCard>
          </div>
        </form>
      </div>
    </FormProvider>

    <Dialog open={!!createdCredentials} onOpenChange={(open) => { if (!open) setCreatedCredentials(null); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Teacher login credentials
          </DialogTitle>
          <DialogDescription>
            Mobile app: email or Login ID plus this password; header{" "}
            <span className="font-mono text-xs">x-platform: android</span> or{" "}
            <span className="font-mono text-xs">ios</span>. Shown only once.
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
          <Button onClick={() => { setCreatedCredentials(null); reset(); router.push("/admin/teachers"); }}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}


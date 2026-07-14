"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  editTeacherSchemaWithRefinement,
  EditTeacherFormData,
} from "@/lib/schemas/teacher-schema";
import { useTeacher, useUpdateTeacher } from "@/lib/hooks/use-teachers";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/forms/radio-group";
import { ChipGroup } from "@/components/forms/chip-group";
import { TransportDropdown } from "@/components/forms/transport-dropdown";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

function parseAddress(address: string[]): {
  areaStreet: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
} {
  const [areaStreet = "", locationDistrict = "", statePincode = ""] = address || [];
  const [location = "", district = ""] = (locationDistrict || "")
    .split(",")
    .map((s) => s.trim());
  const [state = "", pincode = ""] = (statePincode || "")
    .split("-")
    .map((s) => s.trim());
  return { areaStreet, location, district, state, pincode };
}

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;
  const { data: teacherResponse, isLoading: isTeacherFetching } = useTeacher(teacherId);
  const teacher = teacherResponse?.data;
  const { mutateAsync: updateTeacher, isPending: isSaving } = useUpdateTeacher();

  const methods = useForm<EditTeacherFormData>({
    resolver: zodResolver(editTeacherSchemaWithRefinement) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: "",
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
      subjects: "",
      basicSalary: undefined,
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

  useEffect(() => {
    if (!teacher) return;
    const addr = teacher.address || [];
    const { areaStreet, location, district, state, pincode } = parseAddress(addr);
    const tp = teacher.teacherProfile || {};

    reset({
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      gender: teacher.gender || undefined,
      dateOfBirth: teacher.dateOfBirth
        ? format(new Date(teacher.dateOfBirth), "yyyy-MM-dd")
        : "",
      designation: teacher.designation || tp.designation || "",
      contact: teacher.contact || "",
      email: teacher.email || "",
      areaStreet,
      location,
      district,
      pincode,
      state,
      highestQualification:
        teacher.highestQualification || tp.highestQualification || "",
      university: teacher.university || tp.university || "",
      yearOfPassing: teacher.yearOfPassing
        ? String(teacher.yearOfPassing)
        : tp.yearOfPassing
          ? String(tp.yearOfPassing)
          : "",
      percentage: teacher.grade || teacher.percentage || tp.grade || "",
      transportMode: teacher.transportId == null ? "Non Transport" : "Transport",
      transportId: teacher.transportId || "",
      registrationPhotoId: teacher.registrationPhotoId || null,
      subjects: teacher.subjects ?? teacher.teacherProfile?.subjects ?? "",
      basicSalary: teacher.teacherProfile?.basicSalary || undefined,
    });
  }, [teacher, reset]);

  const onSubmit = async (data: EditTeacherFormData) => {
    if (!teacherId) {
      toast.error("Missing teacher ID");
      return;
    }

    try {
      await updateTeacher({ id: teacherId, ...data });
      toast.success("Teacher updated successfully");
      setTimeout(() => {
        router.push("/admin/teachers");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update teacher");
    }
  };

  if (isTeacherFetching) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Teacher not found</p>
          <button
            onClick={() => router.push("/admin/teachers")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-in-out"
          >
            Back to Teachers
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8 overflow-y-auto max-h-[calc(100vh-120px)]">
        <FormTopBar
          title="Edit Teacher"
          onCancel={() => router.push("/admin/teachers")}
          onReset={() => reset()}
          submitFormId="edit-teacher-form"
          saveLabel="Update"
          isSaving={isSaving}
        />

        <form
          id="edit-teacher-form"
          onSubmit={handleSubmit(onSubmit, (err) => {
            const keys = Object.keys(err);
            if (keys.length > 0) {
              const first = (err as any)[keys[0]];
              toast.error(`Please fix: ${first?.message || "Validation error"}`);
            }
          })}
          className="space-y-6"
        >
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
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...methods.register("dateOfBirth")}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">
                      {errors.dateOfBirth.message}
                    </p>
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

                <div className="space-y-2 col-span-2">
                  <PhotoUpload
                    name="registrationPhotoId"
                    label="Teacher Photo"
                    existingFileId={teacher?.registrationPhotoId}
                  />
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
  );
}


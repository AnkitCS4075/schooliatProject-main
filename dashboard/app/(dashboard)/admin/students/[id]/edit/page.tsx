"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { editStudentSchema, StudentFormData } from "@/lib/schemas/student-schema";
import { useStudent, useUpdateStudent } from "@/lib/hooks/use-students";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/forms/radio-group";
import { ChipGroup } from "@/components/forms/chip-group";
import { ClassDropdown } from "@/components/forms/class-dropdown";
import { TransportDropdown } from "@/components/forms/transport-dropdown";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { EmergencyContactsSection } from "@/components/students/emergency-contacts-section";

function parseAddress(address: string[]): {
  areaStreet: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
} {
  const [areaStreet = "", locationDistrict = "", statePincode = ""] = address || [];
  const [location = "", district = ""] = (locationDistrict || "").split(",").map((s) => s.trim());
  const [state = "", pincode = ""] = (statePincode || "").split("-").map((s) => s.trim());
  return { areaStreet, location, district, state, pincode };
}

function studentToFormValues(student: any): StudentFormData {
  const addr = student.address || [];
  const { areaStreet, location, district, state, pincode } = parseAddress(addr);
  const sp = student.studentProfile || {};
  return {
    firstName: student.firstName || "",
    lastName: student.lastName || "",
    gender: student.gender || undefined,
    dob: student.dateOfBirth
      ? format(new Date(student.dateOfBirth), "yyyy-MM-dd")
      : "",
    phone: student.contact || "",
    email: student.email || "",
    areaStreet,
    location,
    district,
    pincode,
    state,
    fatherName: sp.fatherName || "",
    fatherContact: sp.fatherContact || "",
    motherName: sp.motherName || "",
    motherContact: sp.motherContact || "",
    fatherIncome: sp.annualIncome?.toString() || "",
    fatherOccupation: sp.fatherOccupation || "",
    aadhaarNumber: student.aadhaarId || "",
    apaarId: sp.apaarId || "",
    classId: sp.classId || "",
    accommodationType: sp.accommodationType || "DAY_SCHOLAR",
    transportMode: sp.transportId == null ? "Non Transport" : "Transport",
    transportId: sp.transportId || "",
    registrationPhotoId: student.registrationPhotoId || null,
      bloodGroup: sp.bloodGroup ? String(sp.bloodGroup) : "",
      rollNumber: sp.rollNumber != null && sp.rollNumber !== "" ? String(sp.rollNumber) : "",
  };
}

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const { data: studentResponse, isLoading: isStudentFetching } = useStudent(studentId);
  const student = studentResponse?.data;
  const { mutateAsync: updateStudent, isPending: isSaving } = useUpdateStudent();

  const methods = useForm<StudentFormData>({
    resolver: zodResolver(editStudentSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      dob: "",
      phone: "",
      email: "",
      areaStreet: "",
      location: "",
      district: "",
      pincode: "",
      state: "",
      fatherName: "",
      fatherContact: "",
      motherName: "",
      motherContact: "",
      fatherIncome: "",
      fatherOccupation: "",
      classId: "",
      accommodationType: "DAY_SCHOLAR",
      transportMode: "Transport",
      transportId: "",
      registrationPhotoId: null,
      aadhaarNumber: "",
      apaarId: "",
      bloodGroup: "",
      rollNumber: "",
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

  /** Avoid resetting on every React Query refetch (new `student` reference) — that was clearing class & parent fields while editing. */
  const hydratedForStudentIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!student?.id || student.id !== studentId) return;
    if (hydratedForStudentIdRef.current === student.id) return;
    hydratedForStudentIdRef.current = student.id;
    reset(studentToFormValues(student));
  }, [student, studentId, reset]);

  const classAdditionalOptions = useMemo(() => {
    const sp = student?.studentProfile;
    if (!sp?.classId) return undefined;
    const label = sp.class
      ? `${sp.class.grade}${sp.class.division ? `-${sp.class.division}` : ""}`
      : "Current class";
    return [{ value: sp.classId, label }];
  }, [
    student?.studentProfile?.classId,
    student?.studentProfile?.class?.grade,
    student?.studentProfile?.class?.division,
  ]);

  const transportMode = watch("transportMode");

  const onInvalid = useCallback((err: FieldErrors<StudentFormData>) => {
    const first = Object.values(err).find(
      (e): e is { message?: string } =>
        !!e && typeof e === "object" && "message" in e && !!e.message
    );
    toast.error(first?.message ?? "Please fix the highlighted fields and try again.");
  }, []);

  const onSubmit = async (data: StudentFormData) => {
    try {
      await updateStudent({ id: studentId, ...data });
      toast.success("Student updated successfully");
      setTimeout(() => {
        router.push("/admin/students");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update Student");
    }
  };

  if (isStudentFetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Student not found</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Edit Student"
          onCancel={() => router.push("/admin/students")}
          onReset={() => student && reset(studentToFormValues(student))}
          submitFormId="edit-student-form"
          isSaving={isSaving}
        />

        <form
          id="edit-student-form"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
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

                <div className="space-y-2 col-span-2">
                  <ClassDropdown
                    key={studentId}
                    name="classId"
                    label="Select Class"
                    rules={{ required: "Class is required" }}
                    additionalOptions={classAdditionalOptions}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    {...methods.register("aadhaarNumber")}
                    placeholder="Aadhaar Number"
                    maxLength={12}
                    className={errors.aadhaarNumber ? "border-red-500" : ""}
                  />
                  {errors.aadhaarNumber && (
                    <p className="text-sm text-red-500">
                      {errors.aadhaarNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apaarId">Apaar ID</Label>
                  <Input
                    id="apaarId"
                    {...methods.register("apaarId")}
                    placeholder="Apaar ID"
                    className={errors.apaarId ? "border-red-500" : ""}
                  />
                  {errors.apaarId && (
                    <p className="text-sm text-red-500">
                      {errors.apaarId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Controller
                    control={methods.control}
                    name="bloodGroup"
                    render={({ field: { value, onChange } }) => (
                      <select
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A_POSITIVE">A+</option>
                        <option value="A_NEGATIVE">A-</option>
                        <option value="B_POSITIVE">B+</option>
                        <option value="B_NEGATIVE">B-</option>
                        <option value="O_POSITIVE">O+</option>
                        <option value="O_NEGATIVE">O-</option>
                        <option value="AB_POSITIVE">AB+</option>
                        <option value="AB_NEGATIVE">AB-</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              <div className="mt-4">
                <PhotoUpload
                  name="registrationPhotoId"
                  label="Student Photo"
                  existingFileId={student.registrationPhotoId}
                />
              </div>
            </FormCard>

            {/* Contact Information */}
            <FormCard title="Contact Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...methods.register("phone")}
                    placeholder="Contact number"
                    maxLength={10}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
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

            {/* Parent Details */}
            <FormCard title="Parent Details">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father Name</Label>
                  <Input
                    id="fatherName"
                    {...methods.register("fatherName")}
                    placeholder="Full Name"
                    className={errors.fatherName ? "border-red-500" : ""}
                  />
                  {errors.fatherName && (
                    <p className="text-sm text-red-500">
                      {errors.fatherName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother Name</Label>
                  <Input
                    id="motherName"
                    {...methods.register("motherName")}
                    placeholder="Full Name"
                    className={errors.motherName ? "border-red-500" : ""}
                  />
                  {errors.motherName && (
                    <p className="text-sm text-red-500">
                      {errors.motherName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherContact">Father Contact</Label>
                  <Input
                    id="fatherContact"
                    type="tel"
                    {...methods.register("fatherContact")}
                    placeholder="Contact"
                    maxLength={10}
                    className={errors.fatherContact ? "border-red-500" : ""}
                  />
                  {errors.fatherContact && (
                    <p className="text-sm text-red-500">
                      {errors.fatherContact.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motherContact">Mother Contact</Label>
                  <Input
                    id="motherContact"
                    type="tel"
                    {...methods.register("motherContact")}
                    placeholder="Contact"
                    maxLength={10}
                    className={errors.motherContact ? "border-red-500" : ""}
                  />
                  {errors.motherContact && (
                    <p className="text-sm text-red-500">
                      {errors.motherContact.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherOccupation">Father Occupation</Label>
                  <Input
                    id="fatherOccupation"
                    {...methods.register("fatherOccupation")}
                    placeholder="Occupation"
                    className={errors.fatherOccupation ? "border-red-500" : ""}
                  />
                  {errors.fatherOccupation && (
                    <p className="text-sm text-red-500">
                      {errors.fatherOccupation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fatherIncome">Family Annual Income</Label>
                  <Input
                    id="fatherIncome"
                    type="tel"
                    {...methods.register("fatherIncome")}
                    placeholder="Income"
                    maxLength={10}
                    className={errors.fatherIncome ? "border-red-500" : ""}
                  />
                  {errors.fatherIncome && (
                    <p className="text-sm text-red-500">
                      {errors.fatherIncome.message}
                    </p>
                  )}
                </div>
              </div>
            </FormCard>

            {/* Additional Information */}
            <FormCard title="Additional Information">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Accommodation Type</Label>
                  <Controller
                    control={methods.control}
                    name="accommodationType"
                    render={({ field: { value, onChange } }) => (
                      <ChipGroup
                        options={[
                          { value: "DAY_SCHOLAR", label: "Day Scholar" },
                          { value: "HOSTELLER", label: "Hosteller" },
                        ]}
                        value={value}
                        onChange={onChange}
                      />
                    )}
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

        {/* Emergency Contacts Section */}
        <EmergencyContactsSection studentId={studentId} />
      </div>
    </FormProvider>
  );
}


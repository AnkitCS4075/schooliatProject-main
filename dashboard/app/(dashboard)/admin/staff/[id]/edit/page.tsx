"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { staffSchema, StaffFormData } from "@/lib/schemas/staff-schema";
import { useStaffMember, useUpdateStaff } from "@/lib/hooks/use-staff";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/forms/radio-group";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;
  const { data: staffRes, isLoading } = useStaffMember(staffId);
  const staff = staffRes?.data;
  const { mutateAsync: updateStaff, isPending } = useUpdateStaff();

  const methods = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema) as any,
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
      basicSalary: undefined,
    },
    mode: "onBlur",
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (!staff) return;
    const addr = staff.address || [];
    const { areaStreet, location, district, state, pincode } = parseAddress(addr);
    const sp = staff.staffProfile || {};
    reset({
      firstName: staff.firstName || "",
      lastName: staff.lastName || "",
      gender: staff.gender || undefined,
      dob: staff.dateOfBirth ? format(new Date(staff.dateOfBirth), "yyyy-MM-dd") : "",
      contact: staff.contact || "",
      email: staff.email || "",
      areaStreet,
      location,
      district,
      pincode,
      state,
      registrationPhotoId: staff.registrationPhotoId || null,
      aadhaarId: staff.aadhaarId || "",
      designation: sp.designation || "",
      basicSalary: sp.basicSalary != null ? Number(sp.basicSalary) : undefined,
    });
  }, [staff, reset]);

  const onSubmit = async (data: StaffFormData) => {
    try {
      await updateStaff({
        id: staffId,
        ...data,
        dateOfBirth: data.dob,
      });
      toast.success("Staff member updated successfully!");
      router.push("/admin/staff");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update staff member");
    }
  };

  if (isLoading || !staff) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" type="button" onClick={() => router.push("/admin/staff")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Edit Staff Member</h1>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormCard title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" {...methods.register("firstName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" {...methods.register("lastName")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Gender *</Label>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input id="dob" type="date" {...methods.register("dob")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="aadhaarId">Aadhaar ID *</Label>
                  <Input id="aadhaarId" maxLength={12} {...methods.register("aadhaarId")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" {...methods.register("designation")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basicSalary">Monthly Base Salary</Label>
                  <Input
                    id="basicSalary"
                    type="number"
                    {...methods.register("basicSalary", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <PhotoUpload name="registrationPhotoId" label="Profile Photo" />
                </div>
              </div>
            </FormCard>

            <FormCard title="Contact & Address">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact *</Label>
                  <Input id="contact" maxLength={10} {...methods.register("contact")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...methods.register("email")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="areaStreet">Area and Street *</Label>
                  <Input id="areaStreet" {...methods.register("areaStreet")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" {...methods.register("location")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input id="district" {...methods.register("district")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input id="pincode" maxLength={6} {...methods.register("pincode")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" {...methods.register("state")} />
                </div>
              </div>
            </FormCard>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/staff")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

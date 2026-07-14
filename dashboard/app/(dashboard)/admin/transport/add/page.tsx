"use client";

import { useRouter } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addTransportSchema, AddTransportFormData } from "@/lib/schemas/transport-schema";
import { useCreateVehicle } from "@/lib/hooks/use-transport";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/forms/radio-group";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { toast } from "sonner";

export default function AddTransportPage() {
  const router = useRouter();
  const { mutateAsync: createVehicle, isPending: isSaving } = useCreateVehicle();

  const methods = useForm<AddTransportFormData>({
    resolver: zodResolver(addTransportSchema),
    defaultValues: {
      ownerfirstName: "",
      ownerlastName: "",
      vehicleNumber: "",
      busSerialNumber: "",
      driverfirstName: "",
      driverlastName: "",
      driverDateOfBirth: "",
      driverContact: "",
      driverGender: "MALE",
      driverPhotoId: null,
      conductorfirstName: null,
      conductorlastName: null,
      conductorDateOfBirth: "",
      conductorGender: null,
      conductorContact: null,
      conductorPhotoId: null,
      licenseNumber: "",
    },
    mode: "onBlur",
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: AddTransportFormData) => {
    try {
      await createVehicle(data);
      toast.success("Vehicle added successfully");
      setTimeout(() => {
        reset();
        router.push("/admin/transport");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save vehicle");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Add New Vehicle"
          onCancel={() => router.push("/admin/transport")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit)}
          isSaving={isSaving}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Owner + vehicle registration + DL */}
            <FormCard title="Vehicle details">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerfirstName">Vehicle Owner First Name</Label>
                  <Input
                    id="ownerfirstName"
                    {...methods.register("ownerfirstName")}
                    placeholder="First Name"
                    className={errors.ownerfirstName ? "border-red-500" : ""}
                  />
                  {errors.ownerfirstName && (
                    <p className="text-sm text-red-500">{errors.ownerfirstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerlastName">Vehicle Owner Last Name</Label>
                  <Input
                    id="ownerlastName"
                    {...methods.register("ownerlastName")}
                    placeholder="Last Name"
                    className={errors.ownerlastName ? "border-red-500" : ""}
                  />
                  {errors.ownerlastName && (
                    <p className="text-sm text-red-500">{errors.ownerlastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Vehicle no.</Label>
                  <Input
                    id="licenseNumber"
                    {...methods.register("licenseNumber")}
                    placeholder="e.g. AA11 AA 1111"
                    className={errors.licenseNumber ? "border-red-500" : ""}
                  />
                  {errors.licenseNumber && (
                    <p className="text-sm text-red-500">{errors.licenseNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">DL no.</Label>
                  <Input
                    id="vehicleNumber"
                    {...methods.register("vehicleNumber")}
                    placeholder="DL no."
                    className={errors.vehicleNumber ? "border-red-500" : ""}
                  />
                  {errors.vehicleNumber && (
                    <p className="text-sm text-red-500">{errors.vehicleNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="busSerialNumber">Bus Serial Number</Label>
                  <Input
                    id="busSerialNumber"
                    {...methods.register("busSerialNumber")}
                    placeholder="Bus Serial Number"
                  />
                </div>
              </div>
            </FormCard>

            {/* Driver's Basic Information */}
            <FormCard title="Driver's Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverfirstName">First Name</Label>
                  <Input
                    id="driverfirstName"
                    {...methods.register("driverfirstName")}
                    placeholder="First Name"
                    className={errors.driverfirstName ? "border-red-500" : ""}
                  />
                  {errors.driverfirstName && (
                    <p className="text-sm text-red-500">{errors.driverfirstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverlastName">Last Name</Label>
                  <Input
                    id="driverlastName"
                    {...methods.register("driverlastName")}
                    placeholder="Last Name"
                    className={errors.driverlastName ? "border-red-500" : ""}
                  />
                  {errors.driverlastName && (
                    <p className="text-sm text-red-500">{errors.driverlastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverDateOfBirth">Date of Birth</Label>
                  <Input
                    id="driverDateOfBirth"
                    type="date"
                    {...methods.register("driverDateOfBirth")}
                    className={errors.driverDateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.driverDateOfBirth && (
                    <p className="text-sm text-red-500">{errors.driverDateOfBirth.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Controller
                    control={methods.control}
                    name="driverGender"
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
                  {errors.driverGender && (
                    <p className="text-sm text-red-500">{errors.driverGender.message}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="driverContact">Phone</Label>
                  <Input
                    id="driverContact"
                    type="tel"
                    {...methods.register("driverContact")}
                    placeholder="Contact number"
                    maxLength={10}
                    className={errors.driverContact ? "border-red-500" : ""}
                  />
                  {errors.driverContact && (
                    <p className="text-sm text-red-500">{errors.driverContact.message}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <PhotoUpload name="driverPhotoId" label="Driver Photo" />
                </div>
              </div>
            </FormCard>

            {/* Conductor's Basic Information */}
            <FormCard title="Conductor's Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conductorfirstName">First Name</Label>
                  <Input
                    id="conductorfirstName"
                    {...methods.register("conductorfirstName")}
                    placeholder="First Name"
                    className={errors.conductorfirstName ? "border-red-500" : ""}
                  />
                  {errors.conductorfirstName && (
                    <p className="text-sm text-red-500">{errors.conductorfirstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conductorlastName">Last Name</Label>
                  <Input
                    id="conductorlastName"
                    {...methods.register("conductorlastName")}
                    placeholder="Last Name"
                    className={errors.conductorlastName ? "border-red-500" : ""}
                  />
                  {errors.conductorlastName && (
                    <p className="text-sm text-red-500">{errors.conductorlastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conductorDateOfBirth">Date of Birth</Label>
                  <Input
                    id="conductorDateOfBirth"
                    type="date"
                    {...methods.register("conductorDateOfBirth")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Controller
                    control={methods.control}
                    name="conductorGender"
                    render={({ field: { value, onChange } }) => (
                      <RadioGroup
                        options={[
                          { value: "MALE", label: "Male" },
                          { value: "FEMALE", label: "Female" },
                        ]}
                        value={value || undefined}
                        onChange={(val) => onChange(val || null)}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="conductorContact">Phone</Label>
                  <Input
                    id="conductorContact"
                    type="tel"
                    {...methods.register("conductorContact")}
                    placeholder="Contact number"
                    maxLength={10}
                    className={errors.conductorContact ? "border-red-500" : ""}
                  />
                  {errors.conductorContact && (
                    <p className="text-sm text-red-500">{errors.conductorContact.message}</p>
                  )}
                </div>

                <div className="space-y-2 col-span-2">
                  <PhotoUpload name="conductorPhotoId" label="Conductor Photo" />
                </div>
              </div>
            </FormCard>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}


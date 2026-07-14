"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { editTransportSchema, EditTransportFormData } from "@/lib/schemas/transport-schema";
import { useVehicle, useUpdateVehicle } from "@/lib/hooks/use-transport";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/forms/radio-group";
import { PhotoUpload } from "@/components/forms/photo-upload";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function EditTransportPage() {
  const router = useRouter();
  const params = useParams();
  const transportId = params.id as string;
  
  // Try to get from sessionStorage first, then fetch from API
  const [transportData, setTransportData] = useState<any>(null);
  
  useEffect(() => {
    const stored = sessionStorage.getItem("editingTransport");
    if (stored) {
      try {
        setTransportData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored transport", e);
      }
    }
  }, []);

  const { data: transportResponse, isLoading: isTransportFetching } = useVehicle(transportId);
  const transport = transportData || transportResponse?.data;
  const { mutateAsync: updateVehicle, isPending: isSaving } = useUpdateVehicle();

  const methods = useForm<EditTransportFormData>({
    resolver: zodResolver(editTransportSchema),
    defaultValues: {
      ownerfirstName: "",
      ownerlastName: "",
      vehicleNumber: "",
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
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (!transport) return;

    setValue("ownerfirstName", transport.ownerFirstName || "");
    setValue("ownerlastName", transport.ownerLastName || "");
    setValue("vehicleNumber", transport.vehicleNumber || "");
    setValue("driverfirstName", transport.driverFirstName || "");
    setValue("driverlastName", transport.driverLastName || "");
    setValue(
      "driverDateOfBirth",
      transport.driverDateOfBirth
        ? format(new Date(transport.driverDateOfBirth), "yyyy-MM-dd")
        : ""
    );
    setValue("driverContact", transport.driverContact || "");
    setValue("driverGender", transport.driverGender || "MALE");
    setValue("driverPhotoId", transport.driverPhotoLink || null);
    setValue("conductorfirstName", transport.conductorFirstName || null);
    setValue("conductorlastName", transport.conductorLastName || null);
    setValue(
      "conductorDateOfBirth",
      transport.conductorDateOfBirth
        ? format(new Date(transport.conductorDateOfBirth), "yyyy-MM-dd")
        : ""
    );
    setValue("conductorGender", transport.conductorGender || null);
    setValue("conductorContact", transport.conductorContact || null);
    setValue("conductorPhotoId", transport.conductorPhotoLink || null);
    setValue("licenseNumber", transport.licenseNumber || "");
  }, [transport, setValue]);

  const onSubmit = async (data: EditTransportFormData) => {
    if (!transportId) {
      toast.error("Missing transport ID");
      return;
    }

    try {
      await updateVehicle({ id: transportId, ...data });
      toast.success("Vehicle updated successfully");
      setTimeout(() => {
        router.push("/admin/transport");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update vehicle");
    }
  };

  if (isTransportFetching && !transport) {
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

  if (!transport) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Transport not found</p>
          <button
            onClick={() => router.push("/admin/transport")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-in-out"
          >
            Back to Transport
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6 pb-8">
        <FormTopBar
          title="Edit Vehicle"
          onCancel={() => router.push("/admin/transport")}
          onReset={() => reset()}
          onSave={handleSubmit(onSubmit)}
          saveLabel="Update"
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
                  <PhotoUpload
                    name="driverPhotoId"
                    label="Driver Photo"
                    existingFileId={transport?.driverPhotoLink}
                  />
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
                  <PhotoUpload
                    name="conductorPhotoId"
                    label="Conductor Photo"
                    existingFileId={transport?.conductorPhotoLink}
                  />
                </div>
              </div>
            </FormCard>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}


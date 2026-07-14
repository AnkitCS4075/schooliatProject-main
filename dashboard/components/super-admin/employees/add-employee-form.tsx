"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCard } from "@/components/forms/form-card";
import { RadioGroup } from "@/components/forms/radio-group";
import {
  useRegions,
  useCreateEmployee,
  useCreateRegion,
  Region,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Plus, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  contact: z.string().min(1, "Contact number is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  aadhaarId: z.string().optional(),
  regionId: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function AddEmployeeForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [newRegionName, setNewRegionName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [credentials, setCredentials] = useState<{
    loginId: string;
    password: string;
    publicUserId?: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(true);

  const { data: regionsData } = useRegions();
  const createEmployee = useCreateEmployee();
  const createRegion = useCreateRegion();

  const regions = useMemo(() => {
    if (!regionsData?.data) return [];
    return regionsData.data;
  }, [regionsData]);

  const filteredRegions = useMemo(() => {
    if (!regionSearch) return regions;
    const searchLower = regionSearch.toLowerCase();
    return regions.filter((region: Region) =>
      region.name.toLowerCase().includes(searchLower)
    );
  }, [regions, regionSearch]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
      gender: "MALE",
      dateOfBirth: "",
      address: "",
      aadhaarId: "",
      regionId: "",
    },
  });

  const handleCreateRegion = async () => {
    if (!newRegionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a region name",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await createRegion.mutateAsync({
        name: newRegionName.trim(),
      });
      form.setValue("regionId", result.data.id);
      setNewRegionName("");
      setShowRegionModal(false);
      toast({
        title: "Success",
        description: "Region created successfully!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create region",
        variant: "destructive",
      });
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await createEmployee.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        contact: values.contact.trim(),
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        address: values.address.split(",").map((a) => a.trim()),
        aadhaarId: values.aadhaarId?.trim() || undefined,
        assignedRegionId: values.regionId || undefined,
      });

      if (result?.data?.password) {
        setShowPassword(true);
        setCredentials({
          loginId: result.data.email,
          password: result.data.password,
          publicUserId: result.data.publicUserId,
        });
        setShowSuccessModal(true);
      } else {
        toast({
          title: "Success",
          description: "Employee created successfully!",
        });
        router.push("/super-admin/employees");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create employee",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Add New Employee</h1>
          <p className="text-gray-600 mt-1">
            Create a new employee account in the system
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <FormCard title="Employee Information" icon={<User className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  {...form.register("firstName")}
                  error={form.formState.errors.firstName?.message}
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  {...form.register("lastName")}
                  error={form.formState.errors.lastName?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@example.com"
                  {...form.register("email")}
                  error={form.formState.errors.email?.message}
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  placeholder="+91 1234567890"
                  {...form.register("contact")}
                  error={form.formState.errors.contact?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Gender *</Label>
                <RadioGroup
                  value={form.watch("gender")}
                  onChange={(value) => form.setValue("gender", value as any)}
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                    { value: "OTHER", label: "Other" },
                  ]}
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...form.register("dateOfBirth")}
                  error={form.formState.errors.dateOfBirth?.message}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Enter address (comma-separated for multiple lines)"
                {...form.register("address")}
                error={form.formState.errors.address?.message}
              />
            </div>

            <div>
              <Label htmlFor="aadhaarId">Aadhaar ID</Label>
              <Input
                id="aadhaarId"
                placeholder="Aadhaar number (optional)"
                {...form.register("aadhaarId")}
                error={form.formState.errors.aadhaarId?.message}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="regionId" className="mb-0">
                  Assigned Region
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRegionModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Region
                </Button>
              </div>
              <select
                id="regionId"
                className="w-full px-3 py-2 border rounded-md"
                {...form.register("regionId")}
              >
                <option value="">Select a region (optional)</option>
                {regions.map((region: Region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FormCard>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createEmployee.isPending}
            className="flex-1"
          >
            {createEmployee.isPending ? "Creating..." : "Create Employee"}
          </Button>
        </div>
      </form>

      <Dialog open={showRegionModal} onOpenChange={setShowRegionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Region</DialogTitle>
            <DialogDescription>
              Add a new region to assign to employees
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newRegionName">Region Name</Label>
              <Input
                id="newRegionName"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="Enter region name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRegionModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRegion}
                disabled={createRegion.isPending}
                className="flex-1"
              >
                {createRegion.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Created Successfully!</DialogTitle>
            <DialogDescription>
              Please save these credentials. They will not be shown again. If SMTP is configured, a
              welcome email with the same details was sent to this employee&apos;s address.
            </DialogDescription>
          </DialogHeader>
          {credentials && (
            <div className="space-y-4">
              {credentials.publicUserId ? (
                <div>
                  <Label>Public user ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={credentials.publicUserId} readOnly className="font-mono" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(credentials.publicUserId!);
                        toast({ title: "Copied to clipboard" });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ) : null}
              <div>
                <Label>Email (sign-in)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={credentials.loginId} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.loginId);
                      toast({ title: "Copied to clipboard" });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div>
                <Label>Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      value={credentials.password}
                      readOnly
                      type={showPassword ? "text" : "password"}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.password);
                      toast({ title: "Copied to clipboard" });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/super-admin/employees");
                }}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormCard } from "@/components/forms/form-card";
import { useMySchool, useUpdateMySchool } from "@/lib/hooks/use-my-school";
import { schoolProfileSchema, type SchoolProfileFormData } from "@/lib/schemas/settings-schema";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SchoolProfileSection() {
  const { toast } = useToast();
  const { data: school, isLoading } = useMySchool();
  const updateSchool = useUpdateMySchool();

  const form = useForm<SchoolProfileFormData>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      address: [""],
      certificateLink: "",
      gstNumber: "",
      principalName: "",
      principalEmail: "",
      principalPhone: "",
      establishedYear: "",
      boardAffiliation: "",
      studentStrength: "",
      bankName: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      bankBranchName: "",
      upiId: "",
      emergencyContacts: [""],
    },
  });

  useEffect(() => {
    if (!school) return;
    form.reset({
      name: school.name ?? "",
      code: school.code ?? "",
      email: school.email ?? "",
      phone: school.phone ?? "",
      address: school.address?.length ? school.address : [""],
      certificateLink: school.certificateLink ?? "",
      gstNumber: school.gstNumber ?? "",
      principalName: school.principalName ?? "",
      principalEmail: school.principalEmail ?? "",
      principalPhone: school.principalPhone ?? "",
      establishedYear: school.establishedYear != null ? String(school.establishedYear) : "",
      boardAffiliation: school.boardAffiliation ?? "",
      studentStrength: school.studentStrength != null ? String(school.studentStrength) : "",
      bankName: school.bankName ?? "",
      bankAccountNumber: school.bankAccountNumber ?? "",
      bankIfscCode: school.bankIfscCode ?? "",
      bankBranchName: school.bankBranchName ?? "",
      upiId: school.upiId ?? "",
      emergencyContacts: school.emergencyContacts?.length ? school.emergencyContacts : [""],
    });
  }, [school, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateSchool.mutateAsync({
        request: {
          name: values.name,
          code: values.code,
          email: values.email,
          phone: values.phone,
          address: values.address.filter(Boolean),
          certificateLink: values.certificateLink || null,
          gstNumber: values.gstNumber || null,
          principalName: values.principalName || null,
          principalEmail: values.principalEmail || null,
          principalPhone: values.principalPhone || null,
          establishedYear: values.establishedYear ? Number(values.establishedYear) : null,
          boardAffiliation: values.boardAffiliation || null,
          studentStrength: values.studentStrength ? Number(values.studentStrength) : null,
          bankName: values.bankName || null,
          bankAccountNumber: values.bankAccountNumber || null,
          bankIfscCode: values.bankIfscCode || null,
          bankBranchName: values.bankBranchName || null,
          upiId: values.upiId || null,
          emergencyContacts: values.emergencyContacts?.filter(Boolean) || [],
        },
      });
      toast({ title: "Success", description: "School profile updated successfully." });
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to update profile.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <FormCard title="School Profile" icon={<Building2 className="h-5 w-5" />}>
        <Skeleton className="h-64 w-full" />
      </FormCard>
    );
  }

  return (
    <FormCard title="School Profile" icon={<Building2 className="h-5 w-5" />}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">School Name</Label>
            <Input id="name" {...form.register("name")} placeholder="School name" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="code">School Code</Label>
            <Input id="code" {...form.register("code")} placeholder="e.g. SCH001" />
            {form.formState.errors.code && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.code.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} placeholder="school@example.com" />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} placeholder="+91 9876543210" />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Address</Label>
          {(form.watch("address") as string[])?.map((_, i) => (
            <div key={i} className="flex gap-2 mt-1">
              <Input
                {...form.register(`address.${i}`)}
                placeholder={`Address line ${i + 1}`}
              />
              {(form.watch("address") as string[])?.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = form.getValues("address").filter((_, j) => j !== i);
                    form.setValue("address", next.length ? next : [""]);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => form.setValue("address", [...(form.getValues("address") || [""]), ""])}
          >
            + Add address line
          </Button>
          {form.formState.errors.address && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
          )}
        </div>

        <div className="border-t pt-4">
          <Label>Emergency Contacts</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Add up to 6 emergency contact numbers.
          </p>
          {(form.watch("emergencyContacts") as string[])?.map((_, i) => (
            <div key={i} className="flex gap-2 mt-1">
              <Input
                {...form.register(`emergencyContacts.${i}`)}
                placeholder={`Contact number ${i + 1}`}
              />
              {(form.watch("emergencyContacts") as string[])?.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentContacts = form.getValues("emergencyContacts") || [];
                    const next = currentContacts.filter((_, j) => j !== i);
                    form.setValue("emergencyContacts", next.length ? next : [""]);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          {(form.watch("emergencyContacts") as string[])?.length < 6 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => form.setValue("emergencyContacts", [...(form.getValues("emergencyContacts") || [""]), ""])}
            >
              + Add contact number
            </Button>
          )}
          {form.formState.errors.emergencyContacts && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.emergencyContacts.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="certificateLink">Certificate / Affiliation Link</Label>
          <Input id="certificateLink" {...form.register("certificateLink")} placeholder="https://..." />
          {form.formState.errors.certificateLink && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.certificateLink.message}</p>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Principal &amp; Board</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="principalName">Principal Name</Label>
              <Input id="principalName" {...form.register("principalName")} />
            </div>
            <div>
              <Label htmlFor="principalEmail">Principal Email</Label>
              <Input id="principalEmail" type="email" {...form.register("principalEmail")} />
            </div>
            <div>
              <Label htmlFor="principalPhone">Principal Phone</Label>
              <Input id="principalPhone" {...form.register("principalPhone")} />
            </div>
            <div>
              <Label htmlFor="boardAffiliation">Board / Affiliation</Label>
              <Input id="boardAffiliation" {...form.register("boardAffiliation")} placeholder="e.g. CBSE" />
            </div>
            <div>
              <Label htmlFor="establishedYear">Established Year</Label>
              <Input id="establishedYear" type="number" {...form.register("establishedYear")} placeholder="e.g. 1990" />
            </div>
            <div>
              <Label htmlFor="studentStrength">Student Strength</Label>
              <Input id="studentStrength" type="number" {...form.register("studentStrength")} placeholder="e.g. 500" />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Bank Details (for Fee Payments)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" {...form.register("bankName")} placeholder="e.g. State Bank of India" />
            </div>
            <div>
              <Label htmlFor="bankAccountNumber">Account Number</Label>
              <Input id="bankAccountNumber" {...form.register("bankAccountNumber")} placeholder="e.g. 1234567890" />
            </div>
            <div>
              <Label htmlFor="bankIfscCode">IFSC Code</Label>
              <Input id="bankIfscCode" {...form.register("bankIfscCode")} placeholder="e.g. SBIN0001234" />
            </div>
            <div>
              <Label htmlFor="bankBranchName">Branch Name</Label>
              <Input id="bankBranchName" {...form.register("bankBranchName")} placeholder="e.g. Main Branch, Mumbai" />
            </div>
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input id="upiId" {...form.register("upiId")} placeholder="e.g. school@upi" />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Label htmlFor="gstNumber">GST Number</Label>
          <Input id="gstNumber" {...form.register("gstNumber")} placeholder="Optional" />
        </div>

        <Button type="submit" disabled={updateSchool.isPending}>
          {updateSchool.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </FormCard>
  );
}

"use client";

import { useState } from "react";
import { useEmergencyContacts, useCreateEmergencyContact, useUpdateEmergencyContact, useDeleteEmergencyContact } from "@/lib/hooks/use-emergency-contact";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Phone, MapPin, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "RELATIVE", "OTHER"]),
  contact: z.string().min(10, "Valid contact number is required"),
  alternateContact: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  isPrimary: z.boolean(),
});

type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>;

interface EmergencyContactsSectionProps {
  studentId: string;
}

export function EmergencyContactsSection({ studentId }: EmergencyContactsSectionProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contactOtpId, setContactOtpId] = useState<string | null>(null);

  const { data: contactsData, isLoading, refetch } = useEmergencyContacts(studentId);
  const createContact = useCreateEmergencyContact();
  const updateContact = useUpdateEmergencyContact();
  const deleteContact = useDeleteEmergencyContact();

  const contacts = contactsData?.data || [];

  const form = useForm<EmergencyContactFormData>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: "",
      relationship: "FATHER" as const,
      contact: "",
      alternateContact: "",
      address: "",
      isPrimary: false,
    },
  });

  const handleCreate = async (data: EmergencyContactFormData) => {
    try {
      await createContact.mutateAsync({
        studentId,
        ...data,
      });
      toast.success("Emergency contact created successfully!");
      setIsCreateDialogOpen(false);
      form.reset();
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create emergency contact");
    }
  };

  const handleUpdate = async (data: EmergencyContactFormData) => {
    if (!editingContact) return;
    try {
      await updateContact.mutateAsync({
        id: editingContact.id,
        ...data,
      });
      toast.success("Emergency contact updated successfully!");
      setEditingContact(null);
      form.reset();
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update emergency contact");
    }
  };

  const handleDelete = (contactId: string) => {
    setContactOtpId(contactId);
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    form.reset({
      name: contact.name,
      relationship: contact.relationship as "FATHER" | "MOTHER" | "GUARDIAN" | "RELATIVE" | "OTHER",
      contact: contact.contact,
      alternateContact: contact.alternateContact || "",
      address: contact.address,
      isPrimary: contact.isPrimary || false,
    });
  };

  const relationshipOptions = [
    { label: "Father", value: "FATHER" },
    { label: "Mother", value: "MOTHER" },
    { label: "Guardian", value: "GUARDIAN" },
    { label: "Relative", value: "RELATIVE" },
    { label: "Other", value: "OTHER" },
  ];

  const maxContacts = 6;
  const atLimit = contacts.length >= maxContacts;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Emergency Contacts
            <span className="text-sm font-normal text-muted-foreground">
              ({contacts.length} / {maxContacts} max)
            </span>
          </CardTitle>
          <Button
            onClick={() => {
              setEditingContact(null);
              form.reset();
              setIsCreateDialogOpen(true);
            }}
            size="sm"
            className="gap-2"
            disabled={atLimit}
            title={atLimit ? "Maximum 6 emergency contacts allowed" : undefined}
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No emergency contacts found. Add one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((contact: any) => (
              <Card key={contact.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold">{contact.name}</h3>
                        <p className="text-sm text-gray-500">{contact.relationship}</p>
                      </div>
                    </div>
                    {contact.isPrimary && (
                      <Badge className="bg-primary">Primary</Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{contact.contact}</span>
                    </div>
                    {contact.alternateContact && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{contact.alternateContact}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="line-clamp-2">{contact.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingContact}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingContact(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update the emergency contact information"
                : "Add a new emergency contact for this student"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(editingContact ? handleUpdate : handleCreate)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Full Name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <Select
                  value={form.watch("relationship")}
                  onValueChange={(value) => form.setValue("relationship", value as "FATHER" | "MOTHER" | "GUARDIAN" | "RELATIVE" | "OTHER")}
                >
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((rel) => (
                      <SelectItem key={rel.value} value={rel.value}>
                        {rel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.relationship && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.relationship.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  {...form.register("contact")}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                {form.formState.errors.contact && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.contact.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="alternateContact">Alternate Contact</Label>
                <Input
                  id="alternateContact"
                  {...form.register("alternateContact")}
                  placeholder="Optional alternate number"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                {...form.register("address")}
                placeholder="Full address"
                rows={3}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                {...form.register("isPrimary")}
                className="h-4 w-4"
              />
              <Label htmlFor="isPrimary" className="cursor-pointer mb-0">
                Set as primary emergency contact
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingContact(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createContact.isPending || updateContact.isPending}
              >
                {editingContact
                  ? updateContact.isPending
                    ? "Updating..."
                    : "Update"
                  : createContact.isPending
                  ? "Creating..."
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeletionOtpDialog
        open={!!contactOtpId}
        onOpenChange={(open) => !open && setContactOtpId(null)}
        audience="school-admin"
        title="Delete emergency contact"
        description="Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.EMERGENCY_CONTACT}
        entityId={contactOtpId ?? ""}
        isDeleting={deleteContact.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!contactOtpId) return;
          await deleteContact.mutateAsync({ id: contactOtpId, otp });
          toast.success("Emergency contact deleted successfully!");
          refetch();
        }}
      />
    </Card>
  );
}


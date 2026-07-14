"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useFile, getFileUrl } from "@/lib/hooks/use-file-upload";
import { User } from "lucide-react";

interface StudentDetailModalProps {
  visible: boolean;
  onClose: () => void;
  student: any;
}

export function StudentDetailModal({ visible, onClose, student }: StudentDetailModalProps) {
  const fileId =
    student?.registrationPhotoId ||
    student?.photoId ||
    student?.fileId ||
    student?.avatarId;

  const { data: userFile, isLoading: loadingUserFile } = useFile(fileId, {
    enabled: !!fileId && visible && !!student,
  });

  const userImageUrl = getFileUrl(userFile);

  if (!student) return null;

  const getFieldLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      publicUserId: "Student ID",
      class: "Current Class",
      rollNo: "Roll Number",
      parentContact: "Parent Phone",
      feeStatus: "Fee Status",
      dob: "Date of Birth",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      contact: "Phone",
      gender: "Gender",
      dateOfBirth: "Date of Birth",
    };

    if (labelMap[key]) return labelMap[key];

    if (key.includes(".")) {
      const parts = key.split(".");
      const lastPart = parts[parts.length - 1];
      return lastPart
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    }

    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const flattenObject = (obj: any, prefix = ""): Record<string, any> => {
    let flattened: Record<string, any> = {};

    const OMIT_FIELDS = [
      "id",
      "Id",
      "roleId",
      "Role Id",
      "schoolId",
      "School Id",
      "registrationPhotoId",
      "Registration Photo Id",
      "classId",
      "Class Id",
      "photoId",
      "Photo Id",
      "avatarId",
      "Avatar Id",
      "fileId",
      "File Id",
    ];

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (key.startsWith("_") || typeof value === "function") {
        return;
      }

      if (value === null || value === undefined || value === "") {
        return;
      }

      if (OMIT_FIELDS.includes(key)) {
        return;
      }

      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value.constructor === Object
      ) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        const displayValue = Array.isArray(value)
          ? value.join(", ")
          : String(value);
        flattened[newKey] = displayValue;
      }
    });

    return flattened;
  };

  const flattenedData = flattenObject(student);
  const entries = Object.entries(flattenedData);

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-0">
        <DialogHeader className="bg-schooliat-tint px-6 py-4 rounded-t-lg border-b-2 border-primary/15">
          <DialogTitle className="text-lg font-bold text-[#1f5e00]">
            {student.firstName
              ? `${student.firstName} ${student.lastName || ""}`
              : "Student Details"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 pb-6 border-b border-schooliat-tint/40">
              {fileId ? (
                loadingUserFile ? (
                  <div className="w-28 h-28 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                ) : userImageUrl ? (
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#1f5e00]/25 shadow-lg">
                    <img
                      src={userImageUrl}
                      alt="Student"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <Avatar className="w-28 h-28 border-4 border-[#1f5e00]/25">
                    <AvatarFallback className="bg-gray-100">
                      <User className="h-12 w-12 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                )
              ) : (
                <Avatar className="w-28 h-28 border-4 border-[#1f5e00]/25">
                  <AvatarFallback className="bg-gray-100">
                    <User className="h-12 w-12 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
              )}
              <h3 className="text-2xl font-bold text-[#1f5e00] mt-4">
                {(student.firstName || student.name || "User") +
                  " " +
                  (student.lastName || "")}
              </h3>
            </div>

            {/* Fields Section */}
            <div className="grid grid-cols-2 gap-4">
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  className="p-5 bg-schooliat-tint/25 rounded-xl border border-primary/15 shadow-sm min-h-[70px]"
                >
                  <p className="text-xs font-semibold text-[#2d5a1a] uppercase tracking-wide opacity-80 mb-2">
                    {getFieldLabel(key)}
                  </p>
                  <p className="text-base font-medium text-gray-900 line-clamp-2">
                    {value ?? "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}


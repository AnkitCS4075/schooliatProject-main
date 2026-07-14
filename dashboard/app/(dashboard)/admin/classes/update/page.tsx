"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FormTopBar } from "@/components/forms/form-top-bar";
import { FormCard } from "@/components/forms/form-card";
import { ClassFormTable } from "@/components/classes/class-form-table";
import { useAllClasses, useCreateClasses } from "@/lib/hooks/use-classes";
import { TEACHERS_MAX_PAGE_SIZE, useTeachersPage } from "@/lib/hooks/use-teachers";
import { ClassItem, classesSchema } from "@/lib/schemas/class-schema";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function UpdateClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mutateAsync: createClasses, isPending: isSaving } = useCreateClasses();

  const { data: classesData, isLoading: isLoadingClasses } = useAllClasses();
  const apiClassRows = classesData?.data;
  const allClasses = useMemo(() => apiClassRows ?? [], [apiClassRows]);

  // Fetch teachers
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachersPage(
    1,
    TEACHERS_MAX_PAGE_SIZE,
  );
  const teachers = teachersData?.data ?? [];

  useEffect(() => {
    if (allClasses && allClasses.length > 0) {
      setClasses(
        allClasses.map((cls: any) => ({
          id: cls.id || null,
          grade: cls.grade || "",
          division: cls.division || "",
          classTeacherId: cls.classTeacherId || null,
          defaultAnnualFee: cls.defaultAnnualFee ?? null,
          defaultMonthlyFee: cls.defaultMonthlyFee ?? null,
          defaultFeeComponents: Array.isArray(cls.defaultFeeComponents)
            ? cls.defaultFeeComponents
            : null,
        }))
      );
    } else {
      setClasses([
        {
          id: null,
          grade: "",
          division: "",
          classTeacherId: null,
          defaultAnnualFee: null,
          defaultMonthlyFee: null,
          defaultFeeComponents: null,
        },
      ]);
    }
  }, [allClasses]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      classesSchema.parse(classes);
    } catch (error: any) {
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path[0];
          if (typeof path === "number") {
            const field = err.path[1];
            if (field) {
              newErrors[`${field}_${path}`] = err.message;
            }
          }
        });
      }
    }

    classes.forEach((cls, index) => {
      if (!cls.grade) {
        newErrors[`grade_${index}`] = "Grade is required";
      }
      if (!cls.division) {
        newErrors[`division_${index}`] = "Division is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (index: number, field: keyof ClassItem, value: any) => {
    const newClasses = [...classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    setClasses(newClasses);

    // Clear error for this field
    const newErrors = { ...errors };
    delete newErrors[`${field}_${index}`];
    setErrors(newErrors);
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Please fix errors in the form");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsConfirmOpen(false);
    try {
      await createClasses(classes);
      toast.success("Classes updated successfully");
      setTimeout(() => {
        router.push("/admin/classes");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update classes");
    }
  };

  if (isLoadingClasses || isLoadingTeachers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <FormTopBar
        title="Update Classes"
        onCancel={() => router.push("/admin/classes")}
        onReset={() => {
          if (allClasses && allClasses.length > 0) {
            setClasses(
              allClasses.map((cls: any) => ({
                id: cls.id || null,
                grade: cls.grade || "",
                division: cls.division || "",
                classTeacherId: cls.classTeacherId || null,
                defaultAnnualFee: cls.defaultAnnualFee ?? null,
                defaultMonthlyFee: cls.defaultMonthlyFee ?? null,
                defaultFeeComponents: Array.isArray(cls.defaultFeeComponents)
                  ? cls.defaultFeeComponents
                  : null,
              }))
            );
          } else {
            setClasses([
              {
                id: null,
                grade: "",
                division: "",
                classTeacherId: null,
                defaultAnnualFee: null,
                defaultMonthlyFee: null,
                defaultFeeComponents: null,
              },
            ]);
          }
          setErrors({});
        }}
        onSave={handleSubmit}
        isSaving={isSaving}
      />

      <FormCard>
        <ClassFormTable
          classes={classes}
          teachers={teachers}
          errors={errors}
          onChange={setClasses}
          onFieldChange={handleFieldChange}
        />
      </FormCard>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle>Confirm Changes</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to save the changes to the school classes?
              This will update the configuration for {classes.length} class(es).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSave}
              disabled={isSaving}
              className="bg-primary hover:bg-schooliat-primary-dark"
            >
              {isSaving ? "Saving..." : "Confirm & Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


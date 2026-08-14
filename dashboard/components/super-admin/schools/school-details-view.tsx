"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  FileText,
  School as SchoolIcon,
  GraduationCap,
  UserCheck,
  Briefcase,
} from "lucide-react";
import {
  useSchoolById,
  useUpdateSchool,
  useDeleteSchool,
  useRegions,
  useSchoolStatistics,
  type School,
  type Region,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { EditSchoolDialog } from "./edit-school-dialog";
import { SuperAdminDeletionOtpDialog } from "@/components/super-admin/deletion-otp-dialog";
import { SUPER_ADMIN_DELETION_ENTITY } from "@/lib/super-admin/deletion-entity-types";

interface SchoolDetailsViewProps {
  schoolId: string;
}

export function SchoolDetailsView({ schoolId }: SchoolDetailsViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data, isLoading } = useSchoolById(schoolId);
  const updateSchool = useUpdateSchool();
  const deleteSchool = useDeleteSchool();
  const { data: regionsData } = useRegions();
  const { data: statisticsData } = useSchoolStatistics();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const school = (data ?? null) as (School & { bankName?: string; bankAccountNumber?: string; bankIfscCode?: string; bankBranchName?: string; upiId?: string }) | null;
  const regions = (regionsData?.data || []) as Region[];
  const schoolStats = statisticsData?.data?.schools?.find(
    (s: any) => s.id === schoolId
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">School not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/super-admin/schools")}
          className="mt-4"
        >
          Back to Schools
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/super-admin/schools")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{school.name}</h1>
            <p className="text-sm text-gray-600">School Code: {school.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <EditSchoolDialog
            school={school}
            isOpen={isEditOpen}
            onOpenChange={setIsEditOpen}
          />

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <SuperAdminDeletionOtpDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title="Delete school"
            description={`You are about to delete "${school.name}" (${school.code}). This cannot be undone.`}
            entityType={SUPER_ADMIN_DELETION_ENTITY.SCHOOL}
            entityId={schoolId}
            isDeleting={deleteSchool.isPending}
            onDeleteWithOtp={async (otp) => {
              await deleteSchool.mutateAsync({ id: schoolId, otp });
              toast({
                title: "Success",
                description: "School deleted successfully",
              });
              router.push("/super-admin/schools");
            }}
          />
        </div>
      </div>

      {/* School Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <SchoolIcon className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium">{school.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Code</p>
                <p className="text-sm font-medium">{school.code}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Registered</p>
                <p className="text-sm font-medium">
                  {format(new Date(school.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{school.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium">{school.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium">
                  {school.address?.[0] || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Students</span>
              </div>
              <Badge variant="outline">
                {schoolStats?.totalStudents || (school as any).userCount || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Teachers</span>
              </div>
              <Badge variant="outline">
                {schoolStats?.teachers || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Staff</span>
              </div>
              <Badge variant="outline">
                {schoolStats?.totalStaff || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Admins</span>
              </div>
              <Badge variant="outline">
                {schoolStats?.adminStaff || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contract &amp; Activation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Contract Status</span>
              <Badge variant="outline">
                {(school as any).contractStatus?.replace("_", " ") || "—"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Activation</span>
              <Badge variant="outline">
                {(school as any).activationStatus?.replace("_", " ") || "—"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Contract Accepted</span>
              <Badge
                variant={(school as any).contractAccepted ? "default" : "secondary"}
              >
                {(school as any).contractAccepted ? "Yes" : "No"}
              </Badge>
            </div>
            {(school as any).contractAcceptedAt && (
              <div>
                <p className="text-xs text-gray-500">Accepted On</p>
                <p className="text-sm font-medium">
                  {format(new Date((school as any).contractAcceptedAt), "MMM dd, yyyy hh:mm a")}
                </p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push("/super-admin/contracts")}
            >
              View in Contracts
            </Button>
          </CardContent>
        </Card>

        {(school as any).bankName || (school as any).bankAccountNumber || (school as any).upiId ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(school as any).bankName && (
                <div>
                  <p className="text-xs text-gray-500">Bank Name</p>
                  <p className="text-sm font-medium">{(school as any).bankName}</p>
                </div>
              )}
              {(school as any).bankAccountNumber && (
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="text-sm font-medium">{(school as any).bankAccountNumber}</p>
                </div>
              )}
              {(school as any).bankIfscCode && (
                <div>
                  <p className="text-xs text-gray-500">IFSC</p>
                  <p className="text-sm font-medium">{(school as any).bankIfscCode}</p>
                </div>
              )}
              {(school as any).bankBranchName && (
                <div>
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="text-sm font-medium">{(school as any).bankBranchName}</p>
                </div>
              )}
              {(school as any).upiId && (
                <div>
                  <p className="text-xs text-gray-500">UPI ID</p>
                  <p className="text-sm font-medium">{(school as any).upiId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Additional Information */}
      {(school as any).gstNumber ||
        (school as any).principalName ||
        (school as any).establishedYear ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(school as any).gstNumber && (
                <div>
                  <p className="text-xs text-gray-500">GST Number</p>
                  <p className="text-sm font-medium">
                    {(school as any).gstNumber}
                  </p>
                </div>
              )}
              {(school as any).principalName && (
                <div>
                  <p className="text-xs text-gray-500">Principal Name</p>
                  <p className="text-sm font-medium">
                    {(school as any).principalName}
                  </p>
                </div>
              )}
              {(school as any).principalEmail && (
                <div>
                  <p className="text-xs text-gray-500">Principal Email</p>
                  <p className="text-sm font-medium">
                    {(school as any).principalEmail}
                  </p>
                </div>
              )}
              {(school as any).principalPhone && (
                <div>
                  <p className="text-xs text-gray-500">Principal Phone</p>
                  <p className="text-sm font-medium">
                    {(school as any).principalPhone}
                  </p>
                </div>
              )}
              {(school as any).establishedYear && (
                <div>
                  <p className="text-xs text-gray-500">Established Year</p>
                  <p className="text-sm font-medium">
                    {(school as any).establishedYear}
                  </p>
                </div>
              )}
              {(school as any).boardAffiliation && (
                <div>
                  <p className="text-xs text-gray-500">Board Affiliation</p>
                  <p className="text-sm font-medium">
                    {(school as any).boardAffiliation}
                  </p>
                </div>
              )}
              {(school as any).studentStrength && (
                <div>
                  <p className="text-xs text-gray-500">Student Strength</p>
                  <p className="text-sm font-medium">
                    {(school as any).studentStrength}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}


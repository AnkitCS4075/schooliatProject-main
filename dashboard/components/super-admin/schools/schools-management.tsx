"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Receipt, Plus } from "lucide-react";
import { useSchools, useRegions, School, Region } from "@/lib/hooks/use-super-admin";
import { BILLING_ROUTES } from "@/lib/super-admin/billing/constants";
import { RegisterSchoolFormContent } from "./register-school-form-content";
import { EditSchoolDialog } from "./edit-school-dialog";
import { Edit } from "lucide-react";

interface SchoolDisplay {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: any[];
  region: string;
  status: string;
  registeredDate: string;
  _raw?: School;
}

export function SchoolsManagement() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const itemsPerPage = 10;

  const { data, isLoading, error, refetch } = useSchools(
    searchQuery ? { search: searchQuery } : undefined,
  );
  const { data: regionsData } = useRegions();
  const regions = (regionsData?.data || []) as Region[];

  const schools = useMemo<SchoolDisplay[]>(() => {
    if (!data?.data) return [];
    return data.data.map((school: School) => ({
      id: school.id,
      name: school.name,
      code: school.code,
      email: school.email,
      phone: school.phone,
      address: school.address || [],
      region: school.region?.name || "N/A",
      status: "Active",
      registeredDate: new Date(school.createdAt).toISOString().split("T")[0],
      _raw: school,
    }));
  }, [data]);

  const filteredSchools = useMemo(() => {
    let result = schools;
    if (regionFilter !== "all") {
      result = result.filter((s) => s._raw?.regionId === regionFilter);
    }
    return result;
  }, [schools, regionFilter]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredSchools.length);
  const numberOfPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = filteredSchools.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, regionFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600">Failed to load schools</p>
          <p className="text-sm text-gray-600 mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Schools</h1>
          <p className="text-gray-600 mt-1">
            View and manage all registered schools in the system
          </p>
        </div>
        <Button
          onClick={() => setIsRegisterDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add School
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search schools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead>School Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No schools found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSchools.map((school) => (
                  <TableRow key={school.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-semibold">{school.name}</div>
                        <div className="text-sm text-gray-500">
                          {school.address[0] || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{school.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{school.email}</div>
                        <div className="text-sm text-gray-500">{school.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{school.region}</Badge>
                    </TableCell>
                    <TableCell>{school.registeredDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-schooliat-tint text-primary border-primary/30"
                      >
                        {school.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => setEditingSchool(school._raw as School)}
                          title="Edit School"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                          onClick={() =>
                            router.push(`/super-admin/schools/${school.id}`)
                          }
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            router.push(
                              `${BILLING_ROUTES.standaloneReceiptGenerate}?schoolId=${school.id}`
                            )
                          }
                          title="Generate Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {numberOfPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {numberOfPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(numberOfPages - 1, page + 1))}
              disabled={page >= numberOfPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Register School Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New School</DialogTitle>
            <DialogDescription>
              Create a new school account in the system
            </DialogDescription>
          </DialogHeader>
          <RegisterSchoolFormContent
            onSuccess={() => {
              setIsRegisterDialogOpen(false);
              refetch();
            }}
            onCancel={() => setIsRegisterDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <EditSchoolDialog
        school={editingSchool}
        isOpen={editingSchool !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSchool(null);
            refetch(); // Refresh list after edit
          }
        }}
      />
    </div>
  );
}


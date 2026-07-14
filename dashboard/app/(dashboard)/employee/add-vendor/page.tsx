"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateVendor,
  useRegions,
  useCreateRegion,
  type CreateVendorData,
} from "@/lib/hooks/use-super-admin";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Store, MapPin, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  contact: z.string().min(10, "Contact number is required").max(10, "Contact must be 10 digits"),
  address: z.string().min(1, "Address is required"),
  comments: z.string().optional(),
  regionId: z.string().min(1, "Region is required"),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function AddVendorPage() {
  const router = useRouter();
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [newRegionName, setNewRegionName] = useState("");

  const { data: regionsData } = useRegions();
  const createVendor = useCreateVendor();
  const createRegion = useCreateRegion();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const regions = useMemo(() => {
    if (!regionsData?.data) return [];
    return regionsData.data;
  }, [regionsData]);

  const filteredRegions = useMemo(() => {
    if (!regionSearch) return regions;
    return regions.filter((r: { name: string }) =>
      r.name.toLowerCase().includes(regionSearch.toLowerCase())
    );
  }, [regions, regionSearch]);

  const selectedRegionId = watch("regionId");
  const selectedRegion = regions.find((r: { id: string }) => r.id === selectedRegionId);

  const onSubmit = async (data: VendorFormData) => {
    try {
      const vendorData: CreateVendorData = {
        name: data.name.trim(),
        email: data.email?.trim() || undefined,
        contact: data.contact.trim(),
        address: data.address.split(",").map((a) => a.trim()),
        comments: data.comments?.trim() || undefined,
        regionId: data.regionId,
      };

      await createVendor.mutateAsync(vendorData);
      toast.success("Vendor created successfully!");
      router.push("/employee/vendors");
    } catch (error: any) {
      toast.error(error.message || "Failed to create vendor");
    }
  };

  const handleCreateRegion = async () => {
    if (!newRegionName.trim()) {
      toast.error("Please enter a region name");
      return;
    }
    try {
      const result = await createRegion.mutateAsync({
        name: newRegionName.trim(),
      });
      setValue("regionId", result.data.id);
      setShowRegionModal(false);
      setRegionSearch("");
      setNewRegionName("");
      toast.success("Region created!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create region");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/employee/vendors">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add Vendor</h1>
          <p className="text-gray-600">Create a new vendor entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vendor Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Vendor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter vendor name"
                error={errors.name?.message}
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contact">
                Contact Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact"
                {...register("contact")}
                placeholder="+91 XXXXX XXXXX"
                maxLength={10}
                error={errors.contact?.message}
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="vendor@example.com"
                error={errors.email?.message}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="Full address (comma-separated)"
                rows={3}
                error={errors.address?.message}
              />
            </div>

            {/* Region Selector */}
            <div className="space-y-2">
              <Label>
                Region <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Select
                  value={selectedRegionId || ""}
                  onValueChange={(value) => setValue("regionId", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a region">
                      {selectedRegion?.name || "Select a region"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRegions.map((region: { id: string; name: string }) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showRegionModal} onOpenChange={setShowRegionModal}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Region</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Region Name</Label>
                        <Input
                          value={newRegionName}
                          onChange={(e) => setNewRegionName(e.target.value)}
                          placeholder="Enter region name"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleCreateRegion}
                          disabled={createRegion.isPending || !newRegionName.trim()}
                          className="flex-1"
                        >
                          {createRegion.isPending ? "Creating..." : "Create"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowRegionModal(false);
                            setNewRegionName("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {errors.regionId && (
                <p className="text-sm text-red-500">{errors.regionId.message}</p>
              )}
            </div>

            {/* Notes / Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Notes / Comments</Label>
              <Textarea
                id="comments"
                {...register("comments")}
                placeholder="Additional notes about this vendor..."
                rows={3}
                error={errors.comments?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Link href="/employee/vendors" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createVendor.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 hover:-translate-y-0.5 transition-all duration-300 ease-in-out disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {createVendor.isPending ? "Creating..." : "Create Vendor"}
          </Button>
        </div>
      </form>
    </div>
  );
}


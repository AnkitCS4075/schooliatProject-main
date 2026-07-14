"use client";

import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Plus } from "lucide-react";
import { searchTransportByName } from "@/lib/utils/search-utils";

const TRANSPORT_COLUMNS = [
  { key: "no", title: "No", width: "w-16" },
  { key: "licenseNumber", title: "Vehicle no.", width: "w-40" },
  { key: "vehicleNumber", title: "DL no.", width: "w-40" },
  { key: "driver", title: "Driver", width: "w-48" },
  { key: "driverContact", title: "Driver Contact", width: "w-40" },
  { key: "conductor", title: "Conductor", width: "w-48" },
  { key: "conductorContact", title: "Conductor Contact", width: "w-40" },
  { key: "action", title: "Action", width: "w-32" },
];

interface TransportTableProps {
  transports: any[];
  onAddNew: () => void;
  onEdit: (transport: any) => void;
  onDelete: (transportId: string) => void;
  onBulkDelete: (ids: string[]) => void;
  page: number;
  onPageChange: (page: number) => void;
  serverTotalPages: number;
  loading: boolean;
  onRefresh: () => void;
}

export function TransportTable({
  transports,
  onAddNew,
  onEdit,
  onDelete,
  onBulkDelete,
  page,
  onPageChange,
  serverTotalPages,
  loading,
}: TransportTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filteredTransports = useMemo(() => {
    if (!searchQuery.trim()) return transports;
    return searchTransportByName(transports, searchQuery);
  }, [transports, searchQuery]);

  const toggleRowSelection = (transportId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(transportId)) {
      newSelected.delete(transportId);
    } else {
      newSelected.add(transportId);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredTransports.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTransports.map((t) => t.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.size > 0) {
      onBulkDelete(Array.from(selectedRows));
      setSelectedRows(new Set());
    }
  };

  const allSelected = filteredTransports.length > 0 && selectedRows.size === filteredTransports.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Transport</h1>
        <Button onClick={onAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#4F7F3F] text-white p-4 rounded-lg">
          <p className="text-sm font-medium">Total Vehicles</p>
          <p className="text-2xl font-bold">{transports.length}</p>
        </div>
        <div className="bg-[#8FD46B] text-white p-4 rounded-lg">
          <p className="text-sm font-medium">Total Drivers</p>
          <p className="text-2xl font-bold">{transports.length}</p>
        </div>
        <div className="bg-[#4F7F3F] text-white p-4 rounded-lg">
          <p className="text-sm font-medium">Total Conductors</p>
          <p className="text-2xl font-bold">
            {transports.filter((t) => t.conductorFirstName || t.conductorLastName).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by DL no., vehicle no., driver, or conductor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedRows.size} transport(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={loading}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                {TRANSPORT_COLUMNS.map((column) => (
                  <TableHead key={column.key} className={column.width}>
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filteredTransports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TRANSPORT_COLUMNS.length + 1} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredTransports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TRANSPORT_COLUMNS.length + 1} className="text-center py-8">
                    No transports found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransports.map((transport, index) => {
                  const isSelected = selectedRows.has(transport.id);
                  return (
                    <TableRow
                      key={transport.id}
                      className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(transport.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell>{transport.licenseNumber || "-"}</TableCell>
                      <TableCell>{transport.vehicleNumber || "-"}</TableCell>
                      <TableCell>
                        {`${transport.driverFirstName || ""} ${transport.driverLastName || ""}`.trim() || "-"}
                      </TableCell>
                      <TableCell>{transport.driverContact || "-"}</TableCell>
                      <TableCell>
                        {transport.conductorFirstName && transport.conductorLastName
                          ? `${transport.conductorFirstName} ${transport.conductorLastName}`.trim()
                          : transport.conductorFirstName || transport.conductorLastName || "-"}
                      </TableCell>
                      <TableCell>{transport.conductorContact || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(transport)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(transport.id)}
                            disabled={loading}
                            className="h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {serverTotalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {serverTotalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(serverTotalPages - 1, page + 1))}
              disabled={page >= serverTotalPages - 1 || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


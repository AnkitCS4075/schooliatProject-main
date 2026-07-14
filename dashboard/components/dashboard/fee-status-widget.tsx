import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FeeStatusWidgetProps {
  paid?: number;
  pending?: number;
  partiallyPaid?: number;
  currentYear?: number;
  currentInstallmentNumber?: number;
}

export function FeeStatusWidget({
  paid = 0,
  pending = 0,
  partiallyPaid = 0,
  currentYear,
  currentInstallmentNumber,
}: FeeStatusWidgetProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("Annual");

  return (
    <Card className="relative isolate border-none shadow-sm h-full rounded-2xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4 shrink-0">
        <CardTitle className="text-xl font-bold">Fee Status</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col gap-4 h-full pt-2 pb-2">
          {/* Paid Fees Card */}
          <div className="px-5 py-4 border border-gray-100 rounded-2xl flex items-center justify-between bg-white shadow-sm transition-all hover:shadow-md">
            <span className="text-2xl font-bold text-gray-900">{paid.toLocaleString()}</span>
            <div className="flex items-center gap-1.5 bg-[#f0fdf4] text-[#16a34a] px-3 py-1 rounded-full text-xs font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              Paid
            </div>
          </div>

          {/* Pending Fees Card */}
          <div className="px-5 py-4 border border-gray-100 rounded-2xl flex items-center justify-between bg-white shadow-sm transition-all hover:shadow-md">
            <span className="text-2xl font-bold text-gray-900">{(pending + partiallyPaid).toLocaleString()}</span>
            <div className="flex items-center gap-1.5 bg-[#fffbeb] text-[#d97706] px-3 py-1 rounded-full text-xs font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
              Pending
            </div>
          </div>

          <div className="mt-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-24 h-8 text-xs border-none bg-gray-50 text-gray-500 rounded-full focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { TrendingUp, BarChart2, IndianRupee, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancialOverviewWidgetProps {
  totalIncome?: number;
  totalSalary?: number;
  todayCollection?: number;
  pendingAmount?: number;
  /** From dashboard API (`calculateGrowth`); omit to hide trend badges. */
  incomeChangePercent?: string | null;
  salaryChangePercent?: string | null;
  currentYear?: number;
  filterType?: string;
  filterValue?: string;
}

export function FinancialOverviewWidget({
  totalIncome = 0,
  totalSalary = 0,
  todayCollection = 0,
  pendingAmount = 0,
  incomeChangePercent,
  salaryChangePercent,
  currentYear,
  filterType,
  filterValue,
}: FinancialOverviewWidgetProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("Annual");
  const [selectedYear, setSelectedYear] = useState(currentYear?.toString() || new Date().getFullYear().toString());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCollectionLabel = () => {
    if (filterType === "date" && filterValue) return filterValue;
    if (filterType === "month" && filterValue) return "Monthly";
    if (filterType === "term" && filterValue) return `Term ${filterValue}`;
    return "Today";
  };

  const getCollectionSubLabel = () => {
    if (filterType === "date" && filterValue) return "Date Collection";
    if (filterType === "month" && filterValue) return "Monthly Collection";
    if (filterType === "term" && filterValue) return "Term Collection";
    return "Today's Collection";
  };

  return (
    <Card className="relative isolate border-none shadow-sm h-full rounded-2xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-0 shrink-0">
        <CardTitle className="text-lg font-bold">Financial Overview</CardTitle>
        <div className="flex items-center gap-2">
          {/* ... existing selects ... */}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pt-4 pb-4">
        <div className="grid grid-cols-2 gap-3 h-full">
          {/* Total Income Card */}
          <div className="p-4 bg-[#fff8e7] rounded-2xl border border-transparent transition-all shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-full bg-[#fdeab1] flex items-center justify-center text-[#d97706]">
                <BarChart2 className="h-3.5 w-3.5" />
              </div>
              {incomeChangePercent != null &&
                String(incomeChangePercent).trim() !== "" && (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {incomeChangePercent}
                  </div>
                )}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 mb-0.5">
                {formatCurrency(totalIncome)}
              </p>
              <span className="text-xs font-medium text-gray-600">Total Income</span>
            </div>
          </div>

          {/* Salary Distributed Card */}
          <div className="p-4 bg-[#fff8e7] rounded-2xl border border-transparent transition-all shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-full bg-[#fdeab1] flex items-center justify-center text-[#d97706]">
                <BarChart2 className="h-3.5 w-3.5" />
              </div>
              {salaryChangePercent != null &&
                String(salaryChangePercent).trim() !== "" && (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {salaryChangePercent}
                  </div>
                )}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 mb-0.5">
                {formatCurrency(totalSalary)}
              </p>
              <span className="text-xs font-medium text-gray-600">Salary Distributed</span>
            </div>
          </div>

          {/* Collection Card */}
          <div className="p-4 bg-green-50 rounded-2xl border border-transparent transition-all shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <IndianRupee className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{getCollectionLabel()}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 mb-0.5">
                {formatCurrency(todayCollection)}
              </p>
              <span className="text-xs font-medium text-gray-600">{getCollectionSubLabel()}</span>
            </div>
          </div>

          {/* Pending Amount Card */}
          <div className="p-4 bg-red-50 rounded-2xl border border-transparent transition-all shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">Pending</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 mb-0.5">
                {formatCurrency(pendingAmount)}
              </p>
              <span className="text-xs font-medium text-gray-600">Pending Amount</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

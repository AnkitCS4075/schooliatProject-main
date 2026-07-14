import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface NoticeBoardWidgetProps {
  notices?: Notice[];
}

export function NoticeBoardWidget({ notices = [] }: NoticeBoardWidgetProps) {
  const router = useRouter();

  const handleAddNew = () => {
    router.push("/admin/circulars/add");
  };

  const handleViewAll = () => {
    router.push("/admin/circulars");
  };

  return (
    <Card className="relative isolate border-none shadow-sm h-full rounded-2xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-xl font-bold">Notice Board</CardTitle>
        <button
          onClick={handleViewAll}
          className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors underline decoration-gray-300 underline-offset-4"
        >
          view all
        </button>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 overflow-hidden pt-2">
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {notices.length === 0 ? (
            <div className="text-center py-8 text-gray-500 h-full flex flex-col justify-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notices available</p>
            </div>
          ) : (
            notices.slice(0, 2).map((notice, index) => (
              <div
                key={notice.id}
                className="flex items-start gap-4 p-4 border rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#f0f9eb] flex items-center justify-center text-[#699849]">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-gray-900 mb-1">
                    {notice.title}
                  </h4>
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4 pt-4 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-gray-500 border-gray-200 hover:bg-gray-50 text-xs px-4"
            onClick={handleAddNew}
          >
            Add New
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import type { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AcademicClass } from "../../types/academic-class";

interface ColumnsOptions {
  onToggleStatus: (id: number) => void;
  isTogglingStatus: boolean;
  onEdit: (academicClass: AcademicClass) => void;
  onDelete: (academicClass: AcademicClass) => void;
  onViewApplicants: (academicClass: AcademicClass) => void;
  shiftLabels: Record<string, string>;
}

export function getAcademicClassColumns({
  onToggleStatus,
  isTogglingStatus,
  onEdit,
  onDelete,
  onViewApplicants,
  shiftLabels,
}: ColumnsOptions): ColumnDef<AcademicClass>[] {
  return [
    {
      accessorKey: "order",
      header: "Order",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }) => shiftLabels[row.original.shift] ?? row.original.shift,
    },
    {
      accessorKey: "totalSeats",
      header: "Total Seats",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const academicClass = row.original;
        return (
          <button
            type="button"
            onClick={() => onToggleStatus(academicClass.id)}
            disabled={isTogglingStatus}
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
              academicClass.isActive
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {academicClass.isActive ? "Active" : "Inactive"}
          </button>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => {
        const academicClass = row.original;
        return (
          <div className="text-right">
            <Button variant="ghost" size="icon-sm" onClick={() => onViewApplicants(academicClass)}>
              <UsersIcon />
              <span className="sr-only">View Applicants</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(academicClass)}>
              <PencilIcon />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(academicClass)}>
              <Trash2Icon />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];
}

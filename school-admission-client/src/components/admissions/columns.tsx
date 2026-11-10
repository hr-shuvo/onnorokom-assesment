import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDownIcon, PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Admission } from "../../types/admission";

interface ColumnsOptions {
  onChangeStatus: (admission: Admission, status: string) => void;
  changingStatusId: number | null;
  onEdit: (admission: Admission) => void;
  statusLabels: Record<string, string>;
  statuses: string[];
}

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Published: "bg-primary/10 text-primary",
  Archived: "bg-secondary text-secondary-foreground",
};

export function getAdmissionColumns({
  onChangeStatus,
  changingStatusId,
  onEdit,
  statusLabels,
  statuses,
}: ColumnsOptions): ColumnDef<Admission>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "opensAt",
      header: "Opens At",
      cell: ({ row }) => new Date(row.original.opensAt).toLocaleString(),
    },
    {
      accessorKey: "closesAt",
      header: "Closes At",
      cell: ({ row }) => new Date(row.original.closesAt).toLocaleString(),
    },
    {
      accessorKey: "holdMinutes",
      header: "Hold Minutes",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            STATUS_STYLES[row.original.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {statusLabels[row.original.status] ?? row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      cell: ({ row }) => {
        const admission = row.original;
        const otherStatuses = statuses.filter((status) => status !== admission.status);
        const isChanging = changingStatusId === admission.id;

        return (
          <div className="flex items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" disabled={isChanging}>
                    Status
                    <ChevronDownIcon />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                {otherStatuses.map((status) => (
                  <DropdownMenuItem key={status} onClick={() => onChangeStatus(admission, status)}>
                    {statusLabels[status] ?? status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(admission)}>
              <PencilIcon />
              <span className="sr-only">Edit</span>
            </Button>
          </div>
        );
      },
    },
  ];
}

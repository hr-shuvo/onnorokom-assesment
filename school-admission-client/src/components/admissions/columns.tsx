import type { ColumnDef } from "@tanstack/react-table";
import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Admission } from "../../types/admission";

interface ColumnsOptions {
  onChangeStatus: (admission: Admission) => void;
  isChangingStatus: boolean;
  onEdit: (admission: Admission) => void;
  statusLabels: Record<string, string>;
}

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Published: "bg-primary/10 text-primary",
  Archived: "bg-secondary text-secondary-foreground",
};

const NEXT_ACTION_LABEL: Record<string, string | null> = {
  Draft: "Publish",
  Published: "Archive",
  Archived: null,
};

export function getAdmissionColumns({
  onChangeStatus,
  isChangingStatus,
  onEdit,
  statusLabels,
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
        const nextActionLabel = NEXT_ACTION_LABEL[admission.status];

        return (
          <div className="flex items-center justify-end gap-2">
            {nextActionLabel && (
              <Button
                variant="outline"
                size="sm"
                disabled={isChangingStatus}
                onClick={() => onChangeStatus(admission)}
              >
                {nextActionLabel}
              </Button>
            )}
            {admission.status === "Draft" && (
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(admission)}>
                <PencilIcon />
                <span className="sr-only">Edit</span>
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}

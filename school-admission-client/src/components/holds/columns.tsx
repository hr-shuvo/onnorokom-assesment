import type { ColumnDef } from "@tanstack/react-table";

import type { AdmissionHold, HoldStatus } from "../../types/hold";

export const STATUS_STYLES: Record<HoldStatus, string> = {
  Waiting: "bg-muted text-muted-foreground",
  Held: "bg-amber-500/10 text-amber-600",
  Confirmed: "bg-primary/10 text-primary",
  Expired: "bg-destructive/10 text-destructive",
  Cancelled: "bg-muted text-muted-foreground",
};

export function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export function getAdmissionHoldColumns(): ColumnDef<AdmissionHold>[] {
  return [
    {
      accessorKey: "studentId",
      header: "Student ID",
    },
    {
      accessorKey: "studentName",
      header: "Name",
      cell: ({ row }) => row.original.studentName ?? "—",
    },
    {
      accessorKey: "guardianPhone",
      header: "Guardian Phone",
      cell: ({ row }) => row.original.guardianPhone ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Applied On",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires At",
      cell: ({ row }) => formatDate(row.original.expiresAt),
    },
    {
      accessorKey: "confirmedAt",
      header: "Confirmed At",
      cell: ({ row }) => formatDate(row.original.confirmedAt),
    },
  ];
}

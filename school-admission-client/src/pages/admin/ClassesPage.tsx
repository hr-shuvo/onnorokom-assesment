import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import { getErrorMessage } from "../../lib/http-client";
import { academicClassService } from "../../services/academic-class-service";
import type { AcademicClass, PagedResult } from "../../types/academic-class";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { useShifts } from "../../hooks/use-shifts";
import { getAcademicClassColumns } from "../../components/academic-classes/columns";
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const DEFAULT_PAGE_SIZE = 20;
const ALL_SHIFTS = "all";

const ClassesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const search = searchParams.get("q") || "";
  const shift = searchParams.get("shift") || "";

  const [deletingClass, setDeletingClass] = useState<AcademicClass | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const [data, setData] = useState<PagedResult<AcademicClass> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const { shifts } = useShifts();

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await academicClassService.load(page, pageSize, search || undefined, shift || undefined);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch === search) return;
    setSearchParams(
      { page: "1", pageSize: String(pageSize), q: debouncedSearch, shift },
      { replace: true }
    );
  }, [debouncedSearch, search, pageSize, shift, setSearchParams]);

  useEffect(() => {
    refetch();
  }, [page, pageSize, search, shift]);

  const goToPage = (newPage: number) => {
    setSearchParams({ page: String(newPage), pageSize: String(pageSize), q: search, shift }, { replace: true });
  };

  const setPageSize = (newPageSize: number) => {
    setSearchParams({ page: "1", pageSize: String(newPageSize), q: search, shift }, { replace: true });
  };

  const handleShiftChange = (newShift: string | null) => {
    setSearchParams(
      { page: "1", pageSize: String(pageSize), q: search, shift: !newShift || newShift === ALL_SHIFTS ? "" : newShift },
      { replace: true }
    );
  };

  const handleToggleStatus = async (id: number) => {
    setIsLoading(true);
    try {
      await academicClassService.toggleStatus(id);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClass) return;
    setIsLoading(true);
    try {
      await academicClassService.delete(deletingClass.id);
      toast.success("Class deleted.");
      setDeletingClass(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const shiftLabels = shifts.reduce<Record<string, string>>((labels, option) => {
    labels[option.name] = option.name;
    labels[String(option.value)] = option.name;
    return labels;
  }, {});

  const columns = getAcademicClassColumns({
    onToggleStatus: handleToggleStatus,
    isTogglingStatus: isLoading,
    onEdit: (academicClass) => navigate(`/admin/classes/${academicClass.id}/edit`),
    onDelete: setDeletingClass,
    onViewApplicants: (academicClass) => navigate(`/admin/classes/${academicClass.id}/applicants`),
    shiftLabels,
    page,
    pageSize,
  });

  return (
    <div className="space-y-4">
      <Card className="gap-4 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Classes</h1>
          <Button onClick={() => navigate("/admin/classes/new")}>
            <PlusIcon />
            New Class
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search classes..."
            className="max-w-xs"
          />

          <Select value={shift || ALL_SHIFTS} onValueChange={handleShiftChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All shifts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SHIFTS}>All shifts</SelectItem>
              {shifts.map((option) => (
                <SelectItem key={option.value} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error !== null && <p className="text-sm text-destructive">{getErrorMessage(error)}</p>}

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          emptyMessage="No classes yet."
          page={page}
          pageCount={data?.totalPage ?? 0}
          pageSize={pageSize}
          totalCount={data?.totalCount ?? 0}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <ConfirmDeleteDialog
        open={deletingClass !== null}
        onOpenChange={(open) => !open && setDeletingClass(null)}
        title={`Delete "${deletingClass?.name}"?`}
        isDeleting={isLoading}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ClassesPage;

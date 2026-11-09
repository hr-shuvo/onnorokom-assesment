import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import { getErrorMessage } from "../../api/client";
import { academicClassService } from "../../api/academic-classes";
import type { AcademicClass, PagedResult } from "../../types/academic-class";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { getAcademicClassColumns } from "../../components/academic-classes/columns";
import { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const DEFAULT_PAGE_SIZE = 20;

export default function ClassesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const search = searchParams.get("q") || "";

  const [deletingClass, setDeletingClass] = useState<AcademicClass | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const [data, setData] = useState<PagedResult<AcademicClass> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch === search) return;
    setSearchParams(
      { page: "1", pageSize: String(pageSize), q: debouncedSearch },
      { replace: true }
    );
  }, [debouncedSearch, search, pageSize, setSearchParams]);

  useEffect(() => {
    refetch();
  }, [page, pageSize, search]);

  function goToPage(newPage: number) {
    setSearchParams({ page: String(newPage), pageSize: String(pageSize), q: search }, { replace: true });
  }

  function setPageSize(newPageSize: number) {
    setSearchParams({ page: "1", pageSize: String(newPageSize), q: search }, { replace: true });
  }

  async function refetch() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await academicClassService.load({ pageNumber: page, pageSize, search: search || undefined });
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleStatus(id: number) {
    setIsLoading(true);
    try {
      await academicClassService.toggleStatus(id);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsLoading(false);
    }
  }

  async function handleDeleteConfirm() {
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
  }

  const columns = getAcademicClassColumns({
    onToggleStatus: handleToggleStatus,
    isTogglingStatus: isLoading,
    onEdit: (academicClass) => navigate(`/admin/classes/${academicClass.id}/edit`),
    onDelete: setDeletingClass,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <Button onClick={() => navigate("/admin/classes/new")}>
          <PlusIcon />
          New Class
        </Button>
      </div>

      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search classes..."
        className="max-w-xs"
      />

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

      <ConfirmDeleteDialog
        open={deletingClass !== null}
        onOpenChange={(open) => !open && setDeletingClass(null)}
        title={`Delete "${deletingClass?.name}"?`}
        isDeleting={isLoading}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

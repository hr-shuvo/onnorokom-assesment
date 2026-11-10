import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import { getErrorMessage } from "../../lib/http-client";
import { admissionService } from "../../services/admission-service";
import type { Admission, PagedResult } from "../../types/admission";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { useAdmissionStatuses } from "../../hooks/use-admission-statuses";
import { getAdmissionColumns } from "../../components/admissions/columns";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const DEFAULT_PAGE_SIZE = 20;

const AdmissionsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const search = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [data, setData] = useState<PagedResult<Admission> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const { statuses } = useAdmissionStatuses();

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await admissionService.load(page, pageSize, search || undefined);
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
      { page: "1", pageSize: String(pageSize), q: debouncedSearch },
      { replace: true }
    );
  }, [debouncedSearch, search, pageSize, setSearchParams]);

  useEffect(() => {
    refetch();
  }, [page, pageSize, search]);

  const goToPage = (newPage: number) => {
    setSearchParams({ page: String(newPage), pageSize: String(pageSize), q: search }, { replace: true });
  };

  const setPageSize = (newPageSize: number) => {
    setSearchParams({ page: "1", pageSize: String(newPageSize), q: search }, { replace: true });
  };

  const handleChangeStatus = async (admission: Admission) => {
    setIsLoading(true);
    try {
      await admissionService.changeStatus(admission.id);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const statusLabels = statuses.reduce<Record<string, string>>((labels, option) => {
    labels[option.name] = option.name;
    labels[String(option.value)] = option.name;
    return labels;
  }, {});

  const columns = getAdmissionColumns({
    onChangeStatus: handleChangeStatus,
    isChangingStatus: isLoading,
    onEdit: (admission) => navigate(`/admin/admissions/${admission.id}/edit`),
    statusLabels,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admissions</h1>
        <Button onClick={() => navigate("/admin/admissions/new")}>
          <PlusIcon />
          New Admission
        </Button>
      </div>

      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search admissions..."
        className="max-w-xs"
      />

      {error !== null && <p className="text-sm text-destructive">{getErrorMessage(error)}</p>}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage="No admissions yet."
        page={page}
        pageCount={data?.totalPage ?? 0}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        onPageChange={goToPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default AdmissionsPage;

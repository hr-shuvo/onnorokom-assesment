import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeftIcon } from "lucide-react";

import { getErrorMessage } from "../../lib/http-client";
import { academicClassService } from "../../services/academic-class-service";
import { holdService } from "../../services/hold-service";
import type { AcademicClass, PagedResult } from "../../types/academic-class";
import type { AdmissionHold, HoldStatus } from "../../types/hold";
import { getAdmissionHoldColumns } from "../../components/holds/columns";
import { DataTable } from "../../components/ui/data-table";
import { Button } from "../../components/ui/button";
import { Loading } from "../../components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const DEFAULT_PAGE_SIZE = 20;
const STATUS_OPTIONS: HoldStatus[] = ["Waiting", "Held", "Confirmed", "Expired", "Cancelled"];

const columns = getAdmissionHoldColumns();

const ClassApplicantsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;
  const status = (searchParams.get("status") as HoldStatus | null) ?? undefined;

  const [academicClass, setAcademicClass] = useState<AcademicClass | null>(null);
  const [data, setData] = useState<PagedResult<AdmissionHold> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const loadClass = async () => {
      const result = await academicClassService.get(Number(classId));
      setAcademicClass(result);
    };
    loadClass();
  }, [classId]);

  useEffect(() => {
    const refetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await holdService.loadForClass(Number(classId), {
          pageNumber: page,
          pageSize,
          status,
        });
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    refetch();
  }, [classId, page, pageSize, status]);

  const goToPage = (newPage: number) => {
    setSearchParams(
      { page: String(newPage), pageSize: String(pageSize), ...(status ? { status } : {}) },
      { replace: true }
    );
  };

  const setPageSize = (newPageSize: number) => {
    setSearchParams(
      { page: "1", pageSize: String(newPageSize), ...(status ? { status } : {}) },
      { replace: true }
    );
  };

  const setStatus = (newStatus: string | null) => {
    setSearchParams(
      {
        page: "1",
        pageSize: String(pageSize),
        ...(!newStatus || newStatus === "All" ? {} : { status: newStatus }),
      },
      { replace: true }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Applicants {academicClass ? `— ${academicClass.name} (${academicClass.shift})` : ""}
          </h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/classes")}>
          <ArrowLeftIcon />
          Back to Classes
        </Button>
      </div>

      {!academicClass ? (
        <Loading />
      ) : (
        <>
          <Select value={status ?? "All"} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error !== null && <p className="text-sm text-destructive">{getErrorMessage(error)}</p>}

          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            emptyMessage="No applicants yet."
            page={page}
            pageCount={data?.totalPage ?? 0}
            pageSize={pageSize}
            totalCount={data?.totalCount ?? 0}
            onPageChange={goToPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
};

export default ClassApplicantsPage;

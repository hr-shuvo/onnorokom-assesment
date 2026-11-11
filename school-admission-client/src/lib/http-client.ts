import axios from "axios";
import { toast } from "sonner";
import { useStudentStore } from "../stores/student-store";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

httpClient.interceptors.request.use((config) => {
  const studentId = useStudentStore.getState().applicant?.studentId;
  if (studentId) {
    config.headers["X-Student-Id"] = studentId;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && !error.response) {
      toast.error("Cannot reach the server. Please check your connection and try again.", {
        id: "network-error",
      });
    }
    return Promise.reject(error);
  }
);

type ProblemDetails = {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ProblemDetails>(error)) {
    if (!error.response) {
      return "Cannot reach the server. Please check your connection and try again.";
    }

    const data = error.response.data;
    const firstValidationError = data?.errors ? Object.values(data.errors).flat()[0] : undefined;

    return (
      firstValidationError ??
      data?.title ??
      data?.detail ??
      `Request failed (${error.response.status}). Please try again.`
    );
  }

  return "Something went wrong. Please try again.";
}

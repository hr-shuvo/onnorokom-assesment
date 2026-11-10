import axios from "axios";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

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

    return firstValidationError ?? data?.detail ?? `Request failed (${error.response.status}). Please try again.`;
  }

  return "Something went wrong. Please try again.";
}

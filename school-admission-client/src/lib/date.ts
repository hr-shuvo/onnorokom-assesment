export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
};

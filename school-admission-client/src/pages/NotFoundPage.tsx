import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/admin/classes" className="text-sm underline">
        Go to admin
      </Link>
    </div>
  );
}
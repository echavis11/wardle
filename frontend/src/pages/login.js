import AuthPanel from "@/components/AuthPanel";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <AuthPanel apiBaseUrl={API_BASE_URL} />
      </div>
    </div>
  );
}

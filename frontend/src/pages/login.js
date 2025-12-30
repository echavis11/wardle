import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import AuthForm from "@/components/AuthForm";
import { useRouter } from "next/router";

export default function LoginPage() {
  const { token } = useContext(AuthContext);
  const router = useRouter();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // If already logged in, go to game
  useEffect(() => {
    if (token) router.replace("/");
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <AuthForm apiBaseUrl={API_BASE_URL} />
    </div>
  );
}

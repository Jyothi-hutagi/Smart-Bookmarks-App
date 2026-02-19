import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Smart Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Organize and manage your bookmarks intelligently
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in with your account to get started
          </p>
        </div>
      </div>
    </div>
  );
}
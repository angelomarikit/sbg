import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isSupabaseConfigured } from "@/config/env";
import { getSupabase, tryGetSupabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

async function getAdminSession() {
  const supabase = tryGetSupabase();
  if (!supabase) return { authenticated: false, isAdmin: false };
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return { authenticated: false, isAdmin: false };
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", sessionData.session.user.id)
    .maybeSingle();
  const role = (profile as { role?: string } | null)?.role;
  return {
    authenticated: true,
    isAdmin: role === "admin" || role === "staff",
  };
}

export function AdminGuard() {
  const location = useLocation();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-session"],
    queryFn: getAdminSession,
    retry: false,
  });

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-deep">Configure Supabase environment variables to use the admin CMS.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64" />
      </div>
    );
  }

  if (!data?.authenticated || !data.isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export async function adminSignIn(email: string, password: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function adminSignOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

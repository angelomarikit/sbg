import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";

async function fetchActivity() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export function AdminActivityPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: fetchActivity,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-deep">Activity Log</h1>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="p-3">{log.action_type}</td>
                  <td className="p-3">
                    {log.entity_type} {log.entity_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

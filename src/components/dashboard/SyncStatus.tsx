"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, CloudUpload } from "lucide-react";
import { pendingCount } from "@/lib/offline/syncQueue";
import { getLastSyncedLabel, processSyncQueue } from "@/lib/offline/sync";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Sync status indicator — shows pending write count + last-synced time.
 * Click to manually trigger a sync. Lives in the Sidebar footer.
 */
export function SyncStatus() {
  const online = useOnlineStatus();
  const [pending, setPending] = useState(0);
  const [lastSynced, setLastSynced] = useState("Never");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const refresh = () => {
      void pendingCount().then(setPending);
      setLastSynced(getLastSyncedLabel());
    };
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, []);

  async function handleSync() {
    if (!online || syncing) return;
    setSyncing(true);
    await processSyncQueue();
    setPending(await pendingCount());
    setLastSynced(getLastSyncedLabel());
    setSyncing(false);
  }

  if (!online) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-200/40 text-xs font-bold text-amber-700">
        <CloudUpload size={14} className="shrink-0" />
        <span>Offline · {pending > 0 ? `${pending} pending` : "All saved"}</span>
      </div>
    );
  }

  if (pending > 0) {
    return (
      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50/80 border border-cyan-200/40 text-xs font-bold text-cyan-700 hover:bg-cyan-100/80 transition-colors"
      >
        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
        <span>{syncing ? "Syncing…" : `${pending} pending sync`}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/60 border border-emerald-200/30 text-xs font-bold text-emerald-700">
      <CheckCircle2 size={14} className="shrink-0" />
      <span>Synced · {lastSynced}</span>
    </div>
  );
}

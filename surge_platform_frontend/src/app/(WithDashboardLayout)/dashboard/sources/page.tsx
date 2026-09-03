"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  RefreshCw,
  CheckCircle2,
  Globe,
  Plus,
  AlertCircle,
  Clock,
  Rss,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { DashboardHeader } from "../DashboardHeader";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api } from "@/lib/api";
import { RssFeed } from "@/lib/types";

const FREQUENCY_OPTIONS = [
  { value: "1", label: "Every 1 Hour" },
  { value: "2", label: "Every 2 Hours" },
  { value: "6", label: "Every 6 Hours" },
  { value: "12", label: "Every 12 Hours" },
  { value: "24", label: "Once Daily (24 Hours)" },
];

function SourcesPage() {
  const { activeWorkspace } = useWorkspace();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [scrapingId, setScrapingId] = useState<string | null>(null);

  // Auto-Fetch Frequency State
  const [fetchFrequencyHours, setFetchFrequencyHours] = useState<string>("1");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const [manualScrapeMsg, setManualScrapeMsg] = useState("");

  const fetchFeeds = async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await api.get<RssFeed[]>(`/workspaces/${activeWorkspace.id}/rss-sources`);
      const list = Array.isArray(res) ? res : [];
      setFeeds(list);
    } catch (err: any) {
      console.error("Failed to fetch RSS feeds:", err);
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
    const currentConfig = (activeWorkspace as any)?.queue_config || (activeWorkspace as any)?.queueConfig;
    if (currentConfig?.fetchFrequencyHours) {
      setFetchFrequencyHours(String(currentConfig.fetchFrequencyHours));
    }
  }, [activeWorkspace]);

  const handleFrequencyChange = async (val: string) => {
    setFetchFrequencyHours(val);
    if (!activeWorkspace?.id) return;
    setSavingSchedule(true);
    setError("");
    setScheduleSaved(false);
    try {
      const hoursNum = parseInt(val, 10) || 1;
      await api.patch(`/workspaces/${activeWorkspace.id}/queue-config`, {
        fetchFrequencyHours: hoursNum,
      });
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save schedule settings.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAdd = async () => {
    let targetUrl = newUrl.trim();
    let targetName = newName.trim();

    if (!targetUrl && (targetName.startsWith("http://") || targetName.startsWith("https://") || targetName.includes("."))) {
      targetUrl = targetName;
      targetName = "";
    }

    if (!targetUrl) {
      setError("Please enter a valid RSS feed URL.");
      return;
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      new URL(targetUrl);
    } catch {
      setError("Please enter a valid RSS feed URL (e.g. https://techcrunch.com/feed/).");
      return;
    }

    if (!activeWorkspace?.id) {
      setError("Please select an active workspace first.");
      return;
    }

    setAdding(true);
    setError("");
    try {
      const created = await api.post<RssFeed>(`/workspaces/${activeWorkspace.id}/rss-sources`, {
        feedUrl: targetUrl,
        name: targetName || targetUrl,
      });
      setFeeds((prev) => [...prev, created]);
      setNewUrl("");
      setNewName("");
      setManualScrapeMsg("RSS feed added successfully!");
      setTimeout(() => setManualScrapeMsg(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add feed. You may have reached your subscription limit.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!activeWorkspace?.id) return;
    try {
      await api.delete(`/workspaces/${activeWorkspace.id}/rss-sources/${id}?force=true`);
      setFeeds((prev) => prev.filter((f) => f.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete feed.");
    }
  };

  const handleScrape = async (id: string) => {
    if (!activeWorkspace?.id) return;
    setScrapingId(id);
    setManualScrapeMsg("");
    try {
      await api.post(`/workspaces/${activeWorkspace.id}/rss-sources/${id}/scrape`);
      setManualScrapeMsg("Manual feed sync triggered successfully!");
      setTimeout(() => setManualScrapeMsg(""), 3000);
      await fetchFeeds();
    } catch (err: any) {
      setError(err.message || "Failed to trigger feed scrape.");
    } finally {
      setScrapingId(null);
    }
  };

  const activeLabel =
    FREQUENCY_OPTIONS.find((o) => o.value === fetchFrequencyHours)?.label ||
    `Every ${fetchFrequencyHours} Hours`;

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 min-h-screen overflow-auto">
      <DashboardHeader
        title="RSS Ingestion Sources"
        subtitle="Manage content sources and configure automated background fetch schedules"
      />

      <div className="px-8 pb-12 pt-4 flex flex-col gap-6 w-full">
        {manualScrapeMsg && (
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm font-semibold flex items-center gap-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{manualScrapeMsg}</span>
          </div>
        )}

        {/* ── UNIFIED MAIN CARD ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col gap-8 w-full">
          
          {/* Header & Auto-Fetch Frequency Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Rss className="w-5.5 h-5.5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Content Sources & Auto-Sync</h2>
                <p className="text-xs text-slate-500">
                  {feeds.length} feed source{feeds.length !== 1 ? "s" : ""} connected in "{activeWorkspace?.name || "Workspace"}"
                </p>
              </div>
            </div>

            {/* Inline Auto-Fetch Frequency Selector */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-2 rounded-2xl">
              <div className="flex items-center gap-2 pl-2">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Auto-Sync:</span>
              </div>
              <Select value={fetchFrequencyHours} onValueChange={(val) => handleFrequencyChange(val || "1")}>
                <SelectTrigger className="h-9 px-3 min-w-[170px] rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-900 shadow-xs focus:ring-2 focus:ring-indigo-300">
                  <span className="truncate">{activeLabel}</span>
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 shadow-lg">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {scheduleSaved && (
                <span className="text-xs text-emerald-600 font-semibold pr-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          </div>

          {/* Feeds List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Connected RSS Feeds
            </h3>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm font-medium border border-slate-100 rounded-2xl bg-slate-50/50">
                Loading RSS feeds...
              </div>
            ) : feeds.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50/40">
                <Rss className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No RSS feeds added yet</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Add your website or blog RSS feed below to start ingesting posts automatically.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                {feeds.map((feed) => (
                  <div key={feed.id} className="flex items-center justify-between p-4 hover:bg-slate-50/60 transition-colors gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {(feed as any).name || feed.feedUrl}
                          </p>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active Feed" />
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">{feed.feedUrl}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScrape(feed.id)}
                        disabled={scrapingId === feed.id}
                        className="text-xs h-8 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-white shadow-2xs flex items-center gap-1.5"
                      >
                        <RefreshCw className={cn("w-3.5 h-3.5 text-indigo-600", scrapingId === feed.id && "animate-spin")} />
                        {scrapingId === feed.id ? "Syncing..." : "Sync Now"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feed.id)}
                        className="text-xs h-8 w-8 p-0 rounded-xl text-red-600 hover:bg-red-50"
                        title="Remove Feed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New RSS Feed Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            className="flex flex-col gap-4 pt-6 border-t border-slate-100"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add New RSS Feed
              </h3>
              <p className="text-xs text-slate-500">
                Paste any website blog feed URL (e.g. <code>https://techcrunch.com/feed/</code>)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-6 flex flex-col gap-1">
                <Input
                  value={newUrl}
                  onChange={(e) => {
                    setNewUrl(e.target.value);
                    setError("");
                  }}
                  placeholder="https://example.com/feed/"
                  className="h-11 rounded-2xl border-slate-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-indigo-300"
                />
              </div>

              <div className="sm:col-span-4 flex flex-col gap-1">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Feed Display Name (Optional)"
                  className="h-11 rounded-2xl border-slate-200 bg-white text-sm focus-visible:ring-2 focus-visible:ring-indigo-300"
                />
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={adding}
                  className="w-full h-11 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20"
                >
                  {adding ? "Adding..." : "Add Feed"}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                {error}
              </p>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}

export default SourcesPage;
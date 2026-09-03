"use client";

import { useState, useEffect, useMemo } from "react";
import { Zap, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardHeader } from "../DashboardHeader";
import { DraftFilters } from "@/app/component/dashboard/zerodraft/DraftFilters";
import { DraftTable } from "@/app/component/dashboard/zerodraft/DraftTable";
import { Pagination } from "@/app/component/dashboard/zerodraft/Pagination";
import { PreviewModal } from "@/app/component/dashboard/zerodraft/PreviewModal";
import { EditDraftDialog } from "@/app/component/dashboard/zerodraft/EditDraftDialog";
import { ITEMS_PER_PAGE } from "@/app/component/dashboard/zerodraft/status-config";
import { useWorkspace } from "@/lib/context/WorkspaceContext";
import { api } from "@/lib/api";
import { GeneratedDraft, Workspace } from "@/lib/types";
import { Draft, FilterStatus, ArticleStatus } from "@/app/component/dashboard/zerodraft/types";

// Map backend status to UI ArticleStatus
function mapStatus(backendStatus: string): ArticleStatus {
  switch (backendStatus) {
    case "PUBLISHED":
      return "Published";
    case "FAILED":
      return "Failed";
    case "APPROVED":
    case "SCHEDULED":
      return "Retried"; // closest match – "Retried" shows amber badge
    case "DRAFT":
    case "READY_FOR_REVIEW":
    default:
      return "Draft";
  }
}

function mapToUiDraft(d: GeneratedDraft): Draft {
  return {
    id: d.id,
    title: d.topicTitle || "Untitled Digest",
    time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recently",
    platform: "Multi-channel",
    preview: d.polishedContent || d.blogPostContent || "No preview available",
    status: mapStatus(d.status),
  };
}

function ZerodraftsPage() {
  const { activeWorkspace } = useWorkspace();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("All");
  const [autoPosting, setAutoPosting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewDraft, setPreviewDraft] = useState<Draft | null>(null);
  const [editDraft, setEditDraft] = useState<Draft | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [messageBanner, setMessageBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    type: "on" | "off";
    title: string;
    message: string;
  }>({
    show: false,
    type: "on",
    title: "",
    message: "",
  });

  const fetchDrafts = async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await api.get<GeneratedDraft[]>(`/generated-drafts?workspaceId=${activeWorkspace.id}`);
      const list = Array.isArray(res) ? res : [];
      setDrafts(list.map(mapToUiDraft));

      // Fetch workspace autoPost status
      const ws = await api.get<Workspace>(`/workspaces/${activeWorkspace.id}`);
      if (ws?.queue_config?.autoPost !== undefined) {
        setAutoPosting(ws.queue_config.autoPost);
      }
    } catch (err: any) {
      console.error("Failed to fetch drafts:", err);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [activeWorkspace?.id]);

  const handleAutoPostingToggle = async (val: boolean) => {
    setAutoPosting(val);
    if (!activeWorkspace?.id) return;
    try {
      await api.patch(`/workspaces/${activeWorkspace.id}/auto-post`, { autoPost: val });
      setToast({
        show: true,
        type: val ? "on" : "off",
        title: val ? "Auto-post Enabled" : "Auto-post Paused",
        message: val
          ? "Scheduled content will publish automatically according to queue."
          : "Automatic publishing is paused. Drafts will wait for manual approval.",
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
    } catch (err: any) {
      console.error("Failed to toggle autoPost:", err);
      setAutoPosting(!val);
    }
  };

  const handleGenerateBatch = async () => {
    if (!activeWorkspace?.id) return;
    setGenerating(true);
    setMessageBanner(null);
    try {
      await api.post("/ai-prompts/batch-digest", { workspaceId: activeWorkspace.id });
      setMessageBanner({ type: "success", text: "AI Digest generation initiated! Refreshing list..." });
      setTimeout(() => fetchDrafts(), 2000);
    } catch (err: any) {
      setMessageBanner({ type: "error", text: err.message || "Failed to trigger AI digest generation." });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (id: string, title: string, content: string) => {
    try {
      await api.patch(`/generated-drafts/${id}`, {
        topicTitle: title,
        blogPostContent: content,
      });
      setDrafts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, title, preview: content } : d))
      );
      setMessageBanner({ type: "success", text: "Draft updated successfully." });
    } catch (err: any) {
      setMessageBanner({ type: "error", text: err.message || "Failed to update draft." });
    }
  };

  const handlePublish = async (id: string, title: string, content: string) => {
    try {
      await api.post(`/generated-drafts/${id}/publish`, {
        targetChannels: ["LINKEDIN", "WORDPRESS"],
      });
      setDrafts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, title, preview: content, status: "Published" as ArticleStatus } : d))
      );
      setMessageBanner({ type: "success", text: "Draft published successfully!" });
    } catch (err: any) {
      setMessageBanner({ type: "error", text: err.message || "Publishing failed." });
    }
  };

  const handleEdit = (draft: Draft) => {
    setEditDraft(draft);
    setEditOpen(true);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFilter = (f: FilterStatus) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return drafts.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.preview.toLowerCase().includes(search.toLowerCase());
      const matchStatus = activeFilter === "All" || d.status === activeFilter;
      return matchSearch && matchStatus;
    });
  }, [drafts, search, activeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-h-screen overflow-auto relative">
      <DashboardHeader
        title="ZeroDrafts Digest"
        subtitle="Review, polish, and publish AI-generated content digests."
      />

      <div className="px-8 pb-8 pt-4 flex flex-col gap-6">
        {messageBanner && (
          <div
            className={cn(
              "p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-sm",
              messageBanner.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            )}
          >
            <span>{messageBanner.text}</span>
            <button
              onClick={() => setMessageBanner(null)}
              className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Content Pipeline</h2>
            <p className="text-sm text-slate-500">
              Generate fresh multi-channel digests from queued RSS articles.
            </p>
          </div>
          <button
            onClick={handleGenerateBatch}
            disabled={generating || !activeWorkspace}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            {generating ? "Generating Digest..." : "✨ Generate AI Digest"}
          </button>
        </div>

        <DraftFilters
          search={search}
          activeFilter={activeFilter}
          autoPosting={autoPosting}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onAutoPosting={handleAutoPostingToggle}
        />

        {loading ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            Loading drafts...
          </div>
        ) : (
          <DraftTable
            drafts={paginated}
            onPreview={setPreviewDraft}
            onEdit={handleEdit}
          />
        )}

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <PreviewModal
        draft={previewDraft}
        onClose={() => setPreviewDraft(null)}
      />

      <EditDraftDialog
        draft={editDraft}
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditDraft(null); }}
        onSave={handleSave}
        onPublish={handlePublish}
      />

      {/* Toast Notification */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white border shadow-xl rounded-2xl p-4 max-w-sm transition-all duration-300 transform",
          toast.type === "on" ? "border-emerald-200" : "border-amber-200",
          toast.show
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {toast.type === "on" ? (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <PauseCircle className="w-4 h-4 text-amber-600" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-slate-900">{toast.title}</p>
          <p className="text-xs text-slate-600 leading-relaxed">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}

export default ZerodraftsPage;
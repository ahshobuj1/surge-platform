import { cn } from "@/lib/utils";
import { Eye, RotateCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ArticleStatus = "Published" | "Failed" | "Retried";

export interface Article {
  id: string;
  title: string;
  time: string;
  source: string;
  status: ArticleStatus;
  viewUrl?: string;
}

interface RecentlyPublishedProps {
  articles: Article[];
}

const statusVariant: Record<
  ArticleStatus,
  { className: string; label: string }
> = {
  Published: {
    className:
      "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50",
    label: "Published",
  },
  Failed: {
    className:
      "bg-red-50 text-red-500 border-red-200 hover:bg-red-50",
    label: "Failed",
  },
  Retried: {
    className:
      "bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-50",
    label: "Retried",
  },
};

function ArticleActions({ article }: { article: Article }) {
  const showRetry = article.status === "Failed";

  return (
    <TooltipProvider delay={200}>
      <div className="flex items-center gap-1 justify-end">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80"
              aria-label="View article"
            >
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">View article</TooltipContent>
        </Tooltip>

        {showRetry && (
          <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80"
                  aria-label="Retry publishing"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Retry</TooltipContent>
            </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

export function RecentlyPublished({ articles }: RecentlyPublishedProps) {
  return (
    <div className="bg-white rounded-2xl p-6 w-full">
      <h2 className="text-[17px] font-bold text-slate-800 mb-5">
        Recently Published
      </h2>

      {/* ── Desktop / Tablet table (sm and up) ── */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pb-3 pl-0 h-auto">
                Title
              </TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pb-3 h-auto w-[105px]">
                Time
              </TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pb-3 h-auto w-[110px]">
                Source
              </TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pb-3 h-auto w-[110px]">
                Status
              </TableHead>
              <TableHead className="pb-3 h-auto w-[68px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow
                key={article.id}
                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
              >
                {/* Title */}
                <TableCell className="py-[18px] pl-0 pr-4">
                  <span className="text-[14px] font-[450] text-slate-700 truncate block max-w-[200px] md:max-w-[260px] lg:max-w-sm xl:max-w-md">
                    {article.title}
                  </span>
                </TableCell>

                {/* Time */}
                <TableCell className="py-[18px] text-[13px] text-slate-500 whitespace-nowrap">
                  {article.time}
                </TableCell>

                {/* Source */}
                <TableCell className="py-[18px] text-[13px] text-slate-500 whitespace-nowrap">
                  {article.source}
                </TableCell>

                {/* Status badge */}
                <TableCell className="py-[18px]">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11.5px] font-semibold rounded-md px-2.5 py-[3px] border",
                      statusVariant[article.status].className
                    )}
                  >
                    {statusVariant[article.status].label}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-[18px] pr-0">
                  <ArticleActions article={article} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile cards (below sm) ── */}
      <div className="flex flex-col divide-y divide-slate-100 sm:hidden">
        {articles.map((article) => (
          <div key={article.id} className="py-3.5 space-y-1.5">
            {/* Title + actions */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] font-medium text-slate-700 leading-snug line-clamp-2 flex-1">
                {article.title}
              </p>
              <ArticleActions article={article} />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-semibold rounded-md px-2 py-0.5 border",
                  statusVariant[article.status].className
                )}
              >
                {statusVariant[article.status].label}
              </Badge>
              <span className="text-[12px] text-slate-400">{article.source}</span>
              <span className="text-[12px] text-slate-300">·</span>
              <span className="text-[12px] text-slate-400">{article.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
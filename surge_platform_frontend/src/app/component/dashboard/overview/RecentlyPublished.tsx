"use client";

import { useState } from "react";
import { Article } from "./types";
import { ArticleRow } from "./ArticleRow";
import { ArticlePreviewDialog } from "./ArticlePreviewDialog";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RecentlyPublishedProps {
  articles: Article[];
}

export function RecentlyPublished({ articles }: RecentlyPublishedProps) {
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePreview = (article: Article) => {
    setPreviewArticle(article);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xs border border-white/60 p-6 sm:p-7">
        <h2 className="text-base font-bold text-slate-900 mb-5">
          Recently Published
        </h2>

        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider h-8 pl-0">
                Title
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider h-8 px-4 w-[100px]">
                Time
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider h-8 px-4 w-[120px]">
                Source
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider h-8 px-4 w-[110px]">
                Status
              </TableHead>
              <TableHead className="h-8 w-14 pr-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onPreview={handlePreview}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ArticlePreviewDialog
        article={previewArticle}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setPreviewArticle(null);
        }}
      />
    </>
  );
}
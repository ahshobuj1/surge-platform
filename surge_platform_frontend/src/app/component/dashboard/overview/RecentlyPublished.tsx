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
      <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
        <h2 className="text-base font-bold text-foreground mb-5">
          Recently Published
        </h2>

        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-8 pl-2">
                Title
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-8 w-[90px]">
                Time
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-8 w-[110px]">
                Source
              </TableHead>
              <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider h-8 w-[120px]">
                Status
              </TableHead>
              <TableHead className="h-8 w-[56px]" />
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
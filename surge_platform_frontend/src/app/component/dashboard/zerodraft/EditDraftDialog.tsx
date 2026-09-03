"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Draft } from "./types";

const schema = z.object({
  title:   z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormValues = z.infer<typeof schema>;

interface EditDraftDialogProps {
  draft: Draft | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, title: string, content: string) => void;
  onPublish: (id: string, title: string, content: string) => void;
}

export function EditDraftDialog({
  draft,
  open,
  onClose,
  onSave,
  onPublish,
}: EditDraftDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "" },
  });

  // Sync form when draft changes
  useEffect(() => {
    if (draft) {
      form.reset({ title: draft.title, content: draft.preview });
    }
  }, [draft, form]);

  const handleSave = (data: FormValues) => {
    console.log("💾 Save draft:", { id: draft?.id, ...data });
    onSave(draft!.id, data.title, data.content);
    onClose();
  };

  const handlePublish = () => {
    form.handleSubmit((data) => {
      console.log("🚀 Publish draft:", { id: draft?.id, ...data });
      onPublish(draft!.id, data.title, data.content);
      onClose();
    })();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-full max-w-lg rounded-2xl p-6 gap-0 sm:rounded-2xl">
        <DialogHeader className="mb-5">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Edit Draft
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="flex flex-col gap-5">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1 space-y-0">
                  <FormLabel className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-11 rounded-xl border border-slate-200 bg-white text-base sm:text-lg text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1 space-y-0">
                  <FormLabel className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest">
                    Content
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={9}
                      className="rounded-xl border border-slate-200 bg-white text-base sm:text-lg text-foreground shadow-none resize-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-0 leading-relaxed"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-400" />
                </FormItem>
              )}
            />

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                type="submit"
                variant="ghost"
                className="h-10 px-5 rounded-xl text-base sm:text-lg font-semibold text-foreground hover:bg-slate-100"
              >
                Save
              </Button>
              <Button
                type="button"
                onClick={handlePublish}
                className="h-10 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-base sm:text-lg font-semibold shadow-md"
              >
                Publish
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
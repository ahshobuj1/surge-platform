"use client";

import * as React from "react";
import {
  useFormContext,
  FormProvider,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
  UseFormReturn,
  Control,
} from "react-hook-form";
import { cn } from "@/lib/utils";

// Allow spreading the useForm() return directly: <Form {...form}>
export function Form<TFormValues extends FieldValues>({
  children,
  ...props
}: UseFormReturn<TFormValues> & { children: React.ReactNode }) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

type FormFieldProps<
  TFormValues extends FieldValues,
  TName extends Path<TFormValues> = Path<TFormValues>,
> = {
  name: TName;
  control?: Control<TFormValues>;
  render: ControllerProps<TFormValues, TName>["render"];
};

export function FormField<
  TFormValues extends FieldValues,
  TName extends Path<TFormValues> = Path<TFormValues>,
>({
  name,
  control,
  render,
}: FormFieldProps<TFormValues, TName>) {
  const methods = useFormContext<TFormValues>();
  const ctl = control ?? methods.control;
  return <Controller control={ctl} name={name} render={render} />;
}

export function FormItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function FormControl({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function FormLabel({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-xs font-mono text-muted-foreground uppercase tracking-wider", className)} {...props}>
      {children}
    </label>
  );
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return (
    <p className={cn("text-xs text-destructive font-mono", className)} {...props}>
      {children}
    </p>
  );
}

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
} from "react-hook-form";
import { cn } from "@/lib/utils";

// Allow spreading the useForm() return directly: <Form {...form}>
export function Form<TFormValues extends FieldValues>({ children, ...props }: any) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

type FormFieldProps<TFormValues extends FieldValues, TName extends Path<TFormValues>> = {
  name: TName;
  control?: any;
  render: ControllerProps<TFormValues, TName>["render"];
};

export function FormField<TFormValues extends FieldValues, TName extends Path<TFormValues>>({
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

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}

export function FormControl({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function FormMessage({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-red-500", className)} {...props}>
      {children}
    </p>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, UseFormRegister } from "react-hook-form";

type FormInputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
};

export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-card-foreground">
        {label}
      </Label>

      <Input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className="h-11 border-0 bg-white/80 text-card-foreground placeholder:text-muted-foreground"
      />

      {error && (
        <p className="text-red-500 text-sm">{error.message}</p>
      )}
    </div>
  );
}
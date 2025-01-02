"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ResetPasswordFormProps {
  token: string;
}

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const password = watch("password");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const result = await response.json();
        setIsTokenValid(result.valid);
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password, token }),
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (!isTokenValid) {
    return (
      <p className="text-red-500">
        Token reset sudah kedaluwarsa. Silakan ulang reset password baru.
      </p>
    );
  }

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="relative">
          <FormField
            name="password"
            label="Password Baru"
            type={showPassword ? "text" : "password"}
            register={register}
            errors={errors}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            style={{ marginTop: "0.75rem" }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="relative">
          <FormField
            name="confirmPassword"
            label="Konfirmasi Password Baru"
            type={showConfirmPassword ? "text" : "password"}
            register={register}
            errors={errors}
            required
            validate={(value) => value === password || "Password tidak sama"}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            style={{ marginTop: "0.75rem" }}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {message && (
          <p
            className={`text-sm ${
              message.includes("error") ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </TooltipProvider>
  );
}

interface FormFieldProps {
  name: keyof ResetPasswordFormData;
  label: string;
  type?: string;
  register: any;
  errors: any;
  required?: boolean;
  minLength?: number;
  validate?: (value: string) => boolean | string;
}

const FormField = ({
  name,
  label,
  type = "text",
  register,
  errors,
  required,
  minLength,
  validate,
}: FormFieldProps) => {
  const registerOptions: any = {
    required: required ? `${label} diperlukan.` : false,
    minLength: minLength
      ? {
          value: minLength,
          message: `${label} tidak boleh kurang dari ${minLength} karakter.`,
        }
      : undefined,
    validate: validate,
  };

  return (
    <div className="flex flex-col">
      <Tooltip>
        <TooltipTrigger asChild>
          <Input
            label={label}
            id={name}
            type={type}
            placeholder={label}
            {...register(name, registerOptions)}
          />
        </TooltipTrigger>
        <TooltipContent>Masukan {label.toLowerCase()} kamu</TooltipContent>
      </Tooltip>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

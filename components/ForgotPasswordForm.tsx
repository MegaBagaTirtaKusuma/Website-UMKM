"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface FormValues {
  email: string;
}

const ForgotPasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setMessage(result.message);
      setIsSuccess(response.ok);
    } catch (error) {
      console.error("Forgot password error:", error);
      setMessage("An error occurred. Please try again.");
      setIsSuccess(false);
    }

    setIsSubmitting(false);
  };

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          name="email"
          label="Email"
          type="email"
          register={register}
          errors={errors}
          required
          maxLength={255}
        />
        {message && (
          <p
            className={`text-sm ${
              isSuccess ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Reset Password"}
        </Button>
      </form>
    </TooltipProvider>
  );
};

interface FormFieldProps {
  name: keyof FormValues;
  label: string;
  type?: string;
  register: any;
  errors: any;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

const FormField = ({
  name,
  label,
  type = "text",
  register,
  errors,
  required,
  minLength,
  maxLength,
}: FormFieldProps) => {
  const registerOptions: any = {
    required: required ? `${label} diperlukan.` : false,
    minLength: minLength
      ? {
          value: minLength,
          message: `${label} tidak boleh kurang dari ${minLength} karakter.`,
        }
      : undefined,
    maxLength: maxLength
      ? {
          value: maxLength,
          message: `${label} tidak boleh lebih dari ${maxLength} karakter.`,
        }
      : undefined,
  };

  if (type === "email") {
    registerOptions.pattern = {
      value: /\S+@\S+\.\S+/,
      message: "Format email tidak valid.",
    };
  }

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

export default ForgotPasswordForm;

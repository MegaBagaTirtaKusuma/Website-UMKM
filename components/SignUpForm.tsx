"use client";
// components/SignUpForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface FormValues {
  username: string;
  email: string;
  password: string;
}

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError("Email sudah digunakan. Silakan gunakan email lain.");
        } else {
          setError(result.message || "Error signing up");
        }
        return;
      }

      setSuccess("Account created successfully. Redirecting to sign-in...");
      setError(null);
      setTimeout(() => router.push("/auth/sign-in"), 2000);
    } catch (error) {
      setError("An error occurred while signing up.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormField
          name="username"
          label="Nama Pengguna"
          register={register}
          errors={errors}
          required
          maxLength={255}
        />
        <FormField
          name="email"
          label="Email"
          type="email"
          register={register}
          errors={errors}
          required
          maxLength={255}
        />
        <div className="relative">
          <FormField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            register={register}
            errors={errors}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            style={{ marginTop: "0.75rem" }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <Button type="submit">Sign Up</Button>
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
  maxLength?: number;
  minLength?: number;
}

const FormField = ({
  name,
  label,
  type = "text",
  register,
  errors,
  required,
  maxLength,
  minLength,
}: FormFieldProps) => {
  const registerOptions: any = {
    required: required ? `${label} diperlukan.` : false,
    maxLength: maxLength
      ? {
          value: maxLength,
          message: `${label} tidak boleh lebih dari ${maxLength} karakter.`,
        }
      : undefined,
    minLength: minLength
      ? {
          value: minLength,
          message: `${label} tidak boleh kurang dari ${minLength} karakter.`,
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

export default SignUpForm;

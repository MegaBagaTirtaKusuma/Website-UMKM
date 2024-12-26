"use client";
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
  email: string;
  password: string;
}

const SignInForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setError(null);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sign in");
      }

      const responseData = await response.json();
      localStorage.setItem("authToken", responseData.token);
      router.push("/");
    } catch (error) {
      console.error("Sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while signing in."
      );
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
        <Button type="submit">Sign In</Button>
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

export default SignInForm;

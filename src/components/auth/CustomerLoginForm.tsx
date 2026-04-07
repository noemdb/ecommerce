"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function CustomerLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn("customer-credentials", {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        toast.error("Credenciales inválidas");
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="juan@ejemplo.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <div className="space-y-1">
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />
          <div className="flex justify-end px-1">
            <Link 
              href="/recuperar-password" 
              className="text-[10px] font-bold text-neutral-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full h-16" isLoading={isLoading}>
        Iniciar Sesión
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      <div className="text-center pt-4">
        <p className="text-sm text-neutral-500">
          ¿Aún no eres miembro?{" "}
          <Link href="/registro" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            Crea tu cuenta premium
          </Link>
        </p>
      </div>
    </form>
  );
}

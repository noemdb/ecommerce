"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";

export function StaffLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      const result = await signIn("staff-credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (result?.error) {
        toast.error("Credenciales de administrador inválidas");
      } else {
        router.refresh();
        router.push("/admin");
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
          label="Email de Staff"
          type="email"
          placeholder="admin@ecommerce.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-16 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-2xl" 
        isLoading={isLoading}
      >
        Acceder al Dashboard
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      <div className="text-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <p className="text-xs text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Acceso Restringido a Personal Autorizado
        </p>
      </div>
    </form>
  );
}

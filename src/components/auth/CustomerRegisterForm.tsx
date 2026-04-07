"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerRegisterSchema, type CustomerRegisterInput } from "@/lib/validators/auth";
import { registerCustomerAction } from "@/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CustomerRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerRegisterInput>({
    resolver: zodResolver(customerRegisterSchema),
  });

  const onSubmit = async (data: CustomerRegisterInput) => {
    setIsLoading(true);
    try {
      const result = await registerCustomerAction(data);
      if (result.success) {
        setIsSuccess(true);
        toast.success(result.message || "¡Registro completado con éxito!");
        // We could redirect but the spec says "msg con token" so maybe wait for verification
      } else {
        toast.error(result.error || "Ocurrió un error inesperado");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">¡Bienvenido a la Élite!</h2>
          <p className="text-neutral-500 max-w-xs mx-auto text-sm">
            Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, confírmalo para activar tu cuenta.
          </p>
        </div>
        <Button variant="secondary" className="w-full" onClick={() => router.push("/")}>
          Volver al Inicio
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Nombre Completo"
          placeholder="Ej. Juan Pérez"
          {...register("name")}
          error={errors.name?.message}
        />
        <Input
          label="Email"
          type="email"
          placeholder="juan@ejemplo.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Teléfono"
          placeholder="+52 ..."
          {...register("phone")}
          error={errors.phone?.message}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
        />
        <Input
          label="Confirmar Contraseña"
          type="password"
          placeholder="••••••••"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button type="submit" className="w-full h-16" isLoading={isLoading}>
        Crear cuenta premium
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      <div className="text-center pt-4">
        <p className="text-sm text-neutral-500">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </form>
  );
}

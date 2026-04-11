"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { LogIn, ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function CustomerLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"email" | "whatsapp">("email");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/cuenta";

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
        redirect: false,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        toast.error("Credenciales inválidas");
      } else {
        router.refresh();
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error("Ingresa tu número celular");
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsOtpSent(true);
      toast.success(data.devMode ? `[DEV] OTP es: ${data.pin}` : "Código enviado a tu WhatsApp");
    } catch (error: any) {
      toast.error(error.message || "Error al solicitar código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return toast.error("Ingresa el código PIN");
    
    setIsLoading(true);
    try {
      const result = await signIn("whatsapp-otp", {
        phone,
        pin,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("Código inválido o expirado");
      } else {
        router.refresh();
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error("Error al verificar código");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
        <button
          onClick={() => setAuthMode("email")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${authMode === "email" ? "bg-white dark:bg-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"}`}
        >
          Email
        </button>
        <button
          onClick={() => setAuthMode("whatsapp")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${authMode === "whatsapp" ? "bg-white dark:bg-neutral-800 shadow-sm text-green-600 dark:text-green-500" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"}`}
        >
          WhatsApp
        </button>
      </div>

      {authMode === "email" ? (
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
        </form>
      ) : (
        <form onSubmit={isOtpSent ? handleVerifyOTP : handleSendOTP} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Teléfono Móvil"
              type="tel"
              placeholder="+584141234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isOtpSent || isLoading}
            />
            {isOtpSent && (
              <Input
                label="PIN Generado"
                type="text"
                placeholder="123456"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                disabled={isLoading}
                maxLength={6}
              />
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-16 bg-green-600 hover:bg-green-700 text-white" 
            isLoading={isLoading}
          >
            {isOtpSent ? "Autenticar PIN" : "Solicitar PIN vía WhatsApp"}
            {!isOtpSent && <MessageCircle className="ml-2 w-5 h-5" />}
          </Button>

          {isOtpSent && (
             <p className="text-center text-xs mt-4">
               ¿No llegó el código? <button type="button" onClick={() => setIsOtpSent(false)} className="text-blue-600 font-bold hover:underline">Intentar de nuevo</button>
             </p>
          )}
        </form>
      )}

      <div className="text-center pt-4">
        <p className="text-sm text-neutral-500">
          ¿Aún no eres miembro?{" "}
          <Link href="/registro" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            Crea tu cuenta premium
          </Link>
        </p>
      </div>
    </div>
  );
}

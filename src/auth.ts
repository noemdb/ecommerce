import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validators/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || "lccIuYgBEi9Bjub1lKFZKBD0NM1y6QvO0RozLFFuzJc=",
  trustHost: true,
  providers: [
    // Provider 1: Staff interno (ADMIN / STAFF)
    Credentials({
      id: "staff-credentials",
      name: "Staff Login",
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Check for staff/admin in User table (v1.0 compatibility)
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (user && user.password && user.isActive) {
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
    // Provider 2: Clientes (CUSTOMER)
    Credentials({
      id: "customer-credentials",
      name: "Customer Login",
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Check for customer
        const customer = await prisma.customer.findUnique({ 
          where: { email } 
        });

        if (customer && customer.password && !customer.isBlocked) {
          const passwordsMatch = await bcrypt.compare(password, customer.password);
          if (passwordsMatch) {
            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              role: "CUSTOMER",
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if ((user as any).role === "CUSTOMER") {
        await prisma.customerAction.create({
          data: {
            customerId: user.id as string,
            action: "LOGIN",
            description: "Sesión iniciada",
          },
        });
      }
    },
    async signOut(message) {
      // En Auth.js v5, message contiene { session, token }
      const token = (message as any).token;
      if (token && token.role === "CUSTOMER") {
        await prisma.customerAction.create({
          data: {
            customerId: token.id as string,
            action: "LOGOUT",
            description: "Sesión cerrada",
          },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});

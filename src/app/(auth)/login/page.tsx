import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";

import { LogoMark } from "@/components/layout/branding";

import { getSessionUserId } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const userId = await getSessionUserId();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-brand-950 p-10 xl:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px 400px at 20% 15%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(500px 500px at 85% 80%, rgba(45,212,191,0.18), transparent 55%)",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10 text-brand-600" />

            <div>
              <p className="text-base font-bold tracking-tight text-white">
                EMIS
              </p>

              <p className="text-xs text-brand-200/80">
                City Education System
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <h2 className="max-w-md text-2xl font-bold leading-snug text-white">
            One system for every school, teacher, student and transfer across
            the city.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-200/90">
            Manage school records, staff assignments, student enrollments and
            supervision workflows — with role-based access at every step.
          </p>

          <div className="mt-8 flex gap-8">
            <div>
              <p className="text-xl font-bold text-white">RBAC</p>

              <p className="text-xs text-brand-300/80">
                City → district → school scopes
              </p>
            </div>

            <div>
              <p className="text-xl font-bold text-white">Audited</p>

              <p className="text-xs text-brand-300/80">
                Every change is logged
              </p>
            </div>

            <div>
              <p className="text-xl font-bold text-white">Secure</p>

              <p className="text-xs text-brand-300/80">
                Session-based access
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-brand-300/60">
          © {new Date().getFullYear()} City Education Bureau
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 xl:hidden">
            <LogoMark className="h-9 w-9 text-brand-600" />

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">
                EMIS
              </p>

              <p className="text-[11px] leading-tight text-slate-500">
                City Education System
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Use the email address registered by your education office.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

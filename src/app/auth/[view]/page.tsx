import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Logo } from "@/components/brand/logo";

export default function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ view: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense>
      <Inner params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Inner({ params, searchParams }: { params: Promise<{ view: string }>; searchParams: Promise<{ next?: string }> }) {
  const { view } = await params;
  const { next } = await searchParams;
  if (view !== "sign-in" && view !== "sign-up") notFound();
  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-sm content-center gap-8 px-5 py-10">
      <div>
        <Link href="/welcome" aria-label="Ir a la portada">
          <Logo size={56} className="mb-4 rounded-[14px]" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Recapi</h1>
        <p className="mt-1 text-sm text-muted">Vuestro diario de trayectos, planes y logros.</p>
      </div>
      <AuthForm mode={view} next={next ?? "/"} />
    </main>
  );
}

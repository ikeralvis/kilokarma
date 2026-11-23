import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

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
        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent text-xl font-extrabold text-accent-fg">K</span>
        <h1 className="text-2xl font-semibold tracking-tight">KiloKarma</h1>
        <p className="mt-1 text-sm text-muted">Los kilómetros se pagan con créditos, no con dinero.</p>
      </div>
      <AuthForm mode={view} next={next ?? "/"} />
    </main>
  );
}

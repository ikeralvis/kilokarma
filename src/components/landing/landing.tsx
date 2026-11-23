"use client";

import { BookHeart, Car, Medal, Sparkles } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Penguin } from "@/components/brand/penguin";
import { InstallCard } from "@/components/install-card";

const FEATURES = [
  {
    icon: BookHeart,
    title: "Diario compartido",
    text: "Restaurantes, cines, visitas, vuelos, noches de hotel… Registra con un toque lo que hacéis y desglósalo por subcategorías.",
  },
  {
    icon: Car,
    title: "Coche con créditos",
    text: "Cada trayecto genera créditos según la gasolina. Se saldan invitando a una tortilla o una cena, sin dinero de por medio.",
  },
  {
    icon: Medal,
    title: "Liga y medallas",
    text: "Gana XP, sube de medalla y compite cada mes. El ganador se lleva un 🏆 y se guarda en el palmarés.",
  },
];

const STEPS = [
  ["Crea tu cuenta", "Con email y contraseña, en un minuto."],
  ["Añade a un amigo", "Por email o con tu enlace de amistad."],
  ["Empieza a registrar", "Planes, trayectos y contadores. Lo demás sale solo."],
];

export function Landing() {
  const reduce = useReducedMotion();

  // Entrada de bloques al hacer scroll (sin movimiento si el sistema pide reducirlo).
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.12 } } };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      {/* Burbujas de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] overflow-hidden">
        {[
          ["-left-16 top-28 size-64", 0],
          ["right-[-4rem] top-10 size-72", 1.4],
          ["left-1/3 top-[26rem] size-40", 0.7],
        ].map(([cls, delay], i) => (
          <motion.span
            key={i}
            className={`absolute rounded-full bg-accent/25 blur-2xl ${cls}`}
            animate={reduce ? undefined : { y: [0, -24, 0], x: [0, 14, 0] }}
            transition={{ duration: 9 + i * 2, repeat: Infinity, ease: "easeInOut", delay: Number(delay) }}
          />
        ))}
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Link href="/welcome" className="flex items-center gap-2.5">
          <Logo size={36} className="rounded-[10px]" />
          <span className="text-lg font-semibold tracking-tight">Recapi</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/auth/sign-in" className="grid h-10 place-items-center rounded-full px-4 text-sm font-medium">
            Entrar
          </Link>
          <Link href="/auth/sign-up" className="grid h-10 place-items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg transition active:scale-95">
            Crear cuenta
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5">
        {/* Hero */}
        <section className="grid items-center gap-8 py-10 md:grid-cols-2 md:py-20">
          <motion.div variants={container} initial="hidden" animate="show" className="order-2 space-y-6 text-center md:order-1 md:text-left">
            <motion.p variants={item} className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-muted ring-1 ring-line md:mx-0">
              <Sparkles size={13} className="text-accent-text" /> Para vosotros y vuestros planes
            </motion.p>
            <motion.h1 variants={item} className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Vuestro diario <span className="text-accent-text">con amigos</span>
            </motion.h1>
            <motion.p variants={item} className="mx-auto max-w-md text-pretty text-lg text-muted md:mx-0">
              Registra planes y viajes, gana XP, compite en la liga del mes y salda los kilómetros en coche con créditos. Sin dinero de por medio.
            </motion.p>
            <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link href="/auth/sign-up" className="grid h-14 place-items-center rounded-2xl bg-accent px-8 text-base font-semibold text-accent-fg shadow-[0_10px_30px_-10px_var(--accent)] transition active:scale-[.97]">
                Crear cuenta gratis
              </Link>
              <Link href="/auth/sign-in" className="grid h-14 place-items-center rounded-2xl border border-line bg-surface px-8 text-base font-semibold transition active:scale-[.97]">
                Ya tengo cuenta
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="order-1 grid place-items-center md:order-2"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.1 }}
          >
            <div className="relative grid place-items-center">
              <span aria-hidden className="absolute size-72 rounded-full bg-accent/30 blur-3xl sm:size-96" />
              <Penguin size={280} className="relative sm:!h-[340px] sm:!w-[340px]" />
            </div>
          </motion.div>
        </section>

        {/* Qué hace */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid gap-4 py-10 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <motion.article key={title} variants={item} whileHover={reduce ? undefined : { y: -4 }} className="rounded-3xl border border-line bg-surface p-6">
              <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-surface-2 text-accent-text">
                <Icon size={24} />
              </span>
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-muted">{text}</p>
            </motion.article>
          ))}
        </motion.section>

        {/* Créditos vs XP */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="grid gap-4 py-10 md:grid-cols-2">
          <motion.div variants={item} className="rounded-3xl border border-line bg-surface p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Créditos</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">La moneda del coche</p>
            <p className="mt-2 text-muted">Un trayecto de 12 km son unos 10 créditos. Se descuentan cuando tu amigo confirma que le invitaste a algo.</p>
          </motion.div>
          <motion.div variants={item} className="rounded-3xl border border-line bg-surface p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">XP</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">Los puntos de juego</p>
            <p className="mt-2 text-muted">Cada plan y cada viaje suma. Medallas, liga mensual y palmarés, solo por diversión: el XP nunca se cambia por créditos.</p>
          </motion.div>
        </motion.section>

        {/* Cómo empezar */}
        <section className="py-10">
          <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight md:text-left">Empezar es fácil</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <motion.li key={title} initial={{ opacity: 0, y: reduce ? 0 : 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: reduce ? 0 : i * 0.1, duration: reduce ? 0 : 0.5 }} className="flex gap-4 rounded-3xl border border-line bg-surface p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent font-semibold text-accent-fg">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-sm text-muted">{text}</span>
                </span>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* Instalar */}
        <motion.section initial={{ opacity: 0, y: reduce ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} className="my-10 grid items-center gap-6 rounded-[2rem] border border-line bg-surface p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Instálala en tu móvil</h2>
            <p className="text-muted">Se abre como una app, a pantalla completa y desde el icono de inicio.</p>
          </div>
          <div className="md:w-72">
            <InstallCard />
          </div>
        </motion.section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 text-center">
        <Penguin size={72} animated={false} />
        <p className="text-sm text-muted">Hecho para quienes comparten coche y planes. © Recapi</p>
        <div className="flex gap-3 text-sm font-medium">
          <Link href="/auth/sign-in" className="underline underline-offset-4">
            Entrar
          </Link>
          <Link href="/auth/sign-up" className="underline underline-offset-4">
            Crear cuenta
          </Link>
        </div>
      </footer>
    </div>
  );
}

import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Globe,
  MessageCircle,
  Phone,
} from "lucide-react";
import { MainNav, MAIN_NAV_MOBILE_BOTTOM_CLASS } from "../../components/layout/MainNav";
import { LandingFooter } from "../../components/layout/LandingFooter";
import { useEstablecimiento, type Establecimiento, type MediaAsset } from "../../hooks/useEstablecimientos";
import { municipioById } from "../../data/municipioSlugs";
import { categoriaDef } from "../Directorio/categorias";

const MiniMapa = lazy(() => import("./MiniMapa"));

const DIAS: Record<string, string> = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves",
  viernes: "Viernes", sabado: "Sábado", domingo: "Domingo",
};

/** wa.me exige solo dígitos; celulares colombianos de 10 dígitos llevan prefijo 57 */
function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 ? `57${digits}` : digits;
}

export default function Negocio() {
  const { slug } = useParams<{ slug: string }>();
  const { negocio, loading, notFound, error, reload } = useEstablecimiento(slug);

  useEffect(() => {
    if (negocio?.nombre) document.title = `${negocio.nombre} — VisitChocó`;
    return () => {
      document.title = "VisitChocó";
    };
  }, [negocio?.nombre]);

  return (
    <div className={`min-h-screen bg-[#020d1a] ${MAIN_NAV_MOBILE_BOTTOM_CLASS} md:pb-0`}>
      <MainNav />

      {loading && <NegocioSkeleton />}

      {!loading && (notFound || error) && (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-serif text-3xl font-bold text-white">
            {notFound ? "Negocio no encontrado" : "Algo salió mal"}
          </p>
          <p className="max-w-sm text-sm text-white/50">
            {notFound
              ? "Puede que este negocio ya no esté publicado o que el enlace esté errado."
              : "No pudimos cargar la información. Revisa tu conexión e inténtalo de nuevo."}
          </p>
          {error && !notFound && (
            <button
              type="button"
              onClick={reload}
              className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs
                         font-medium text-white/85 hover:bg-white/[0.12] transition-colors"
            >
              Reintentar
            </button>
          )}
          <Link
            to="/directorio"
            className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300"
          >
            <ArrowLeft size={15} /> Volver al directorio
          </Link>
        </div>
      )}

      {!loading && !notFound && !error && negocio && <NegocioContent negocio={negocio} />}

      <LandingFooter />
    </div>
  );
}

function NegocioContent({ negocio }: { negocio: Establecimiento }) {
  const cat = categoriaDef(negocio.categoria);
  const municipio = municipioById(negocio.municipio_id);

  // Contacto — el whatsapp explícito manda; si no llega, el teléfono RNT
  // (celulares colombianos) es el número de WhatsApp del negocio
  const waSource = negocio.whatsapp || negocio.telefono;
  const waHref = waSource
    ? `https://wa.me/${waNumber(waSource)}?text=${encodeURIComponent(
        `Hola, vi ${negocio.nombre} en VisitChocó`,
      )}`
    : null;
  const telHref = negocio.telefono ? `tel:${negocio.telefono.replace(/[^\d+]/g, "")}` : null;
  const webHref = negocio.sitio_web || null;
  const hasContacto = Boolean(waHref || telHref || webHref);

  const horarioEntries = negocio.horario ? Object.entries(negocio.horario) : [];
  const hasCoords = typeof negocio.lat === "number" && typeof negocio.lng === "number";

  return (
    <>
      {/* Breadcrumb sticky */}
      <nav
        aria-label="Miga de pan"
        className="sticky top-12 md:top-16 z-40 border-b border-white/[0.06]
                   bg-[rgba(2,13,26,0.92)] backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-5xl items-center px-4 md:px-6 py-3">
          <Link
            to={municipio ? `/directorio?municipio=${municipio.slug}` : "/directorio"}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60
                       hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            Directorio
            {negocio.municipio_nombre && (
              <span className="text-white/35"> · {negocio.municipio_nombre}</span>
            )}
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 md:px-6 pt-6 pb-28 md:pb-16">
        <Galeria negocio={negocio} />

        {/* Header */}
        <header className="mt-6">
          <h1
            className="font-serif text-white font-bold leading-tight"
            style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.6rem)" }}
          >
            {negocio.nombre}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/55">
            <span style={{ color: cat.accent }}>{cat.label}</span>
            {negocio.municipio_nombre && <><span aria-hidden>·</span> {negocio.municipio_nombre}</>}
            {negocio.rango_precio && <><span aria-hidden>·</span> {negocio.rango_precio}</>}
            {negocio.rnt && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30
                           bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-300"
              >
                <BadgeCheck size={11} strokeWidth={2.5} /> RNT {negocio.rnt}
              </span>
            )}
          </p>
          {negocio.direccion && (
            <p className="mt-2 text-xs text-white/40">{negocio.direccion}</p>
          )}
        </header>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_280px]">
          <div className="space-y-8 min-w-0">
            {negocio.descripcion && (
              <section>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Sobre el negocio
                </h2>
                <p className="text-sm leading-relaxed text-white/75">{negocio.descripcion}</p>
              </section>
            )}

            {Boolean(negocio.especialidades?.length) && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Especialidades
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {negocio.especialidades!.map((esp) => (
                    <span
                      key={esp}
                      className="rounded-full bg-white/[0.06] border border-white/[0.08]
                                 px-3 py-1 text-xs text-white/70"
                    >
                      {esp}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {horarioEntries.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Horario
                </h2>
                <table className="w-full max-w-sm text-sm">
                  <tbody>
                    {horarioEntries.map(([dia, horas]) => (
                      <tr key={dia} className="border-b border-white/[0.05] last:border-0">
                        <td className="py-1.5 pr-4 text-white/60">{DIAS[dia] ?? dia}</td>
                        <td className="py-1.5 text-white/85">{String(horas)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {hasCoords && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Ubicación
                </h2>
                <Suspense
                  fallback={<div className="h-[240px] animate-pulse rounded-2xl bg-white/[0.05]" />}
                >
                  <MiniMapa lat={negocio.lat as number} lng={negocio.lng as number} />
                </Suspense>
              </section>
            )}
          </div>

          {/* Bloque de contacto — card en desktop */}
          <aside className="hidden md:block">
            <div className="sticky top-32 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <h2 className="mb-4 font-serif text-lg font-bold text-white">Contacto</h2>
              {hasContacto ? (
                <div className="space-y-2.5">
                  {waHref && <BotonWhatsApp href={waHref} />}
                  {telHref && <BotonContacto href={telHref} Icon={Phone} label="Llamar" />}
                  {webHref && (
                    <BotonContacto
                      href={webHref}
                      Icon={Globe}
                      label="Sitio web"
                      external
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-white/45">Información de contacto próximamente.</p>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Bloque de contacto — bottom bar fija en móvil, sobre el tab nav (h-14) */}
      <div
        className="fixed inset-x-0 bottom-14 z-[1500] border-t border-white/[0.08]
                   bg-[rgba(2,13,26,0.95)] backdrop-blur-xl px-4 py-3 md:hidden"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {hasContacto ? (
          <div className="flex gap-2">
            {waHref && <BotonWhatsApp href={waHref} compact />}
            {telHref && <BotonContacto href={telHref} Icon={Phone} label="Llamar" compact />}
            {webHref && <BotonContacto href={webHref} Icon={Globe} label="Web" external compact />}
          </div>
        ) : (
          <p className="text-center text-xs text-white/45">
            Información de contacto próximamente.
          </p>
        )}
      </div>
    </>
  );
}

function BotonWhatsApp({ href, compact }: { href: string; compact?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full
                  bg-[#25D366] font-semibold text-[#04150b] transition-opacity hover:opacity-90
                  ${compact ? "h-11 flex-[2] text-sm" : "h-11 w-full text-sm"}`}
    >
      <MessageCircle size={17} strokeWidth={2.25} />
      WhatsApp
    </a>
  );
}

function BotonContacto({
  href,
  Icon,
  label,
  external,
  compact,
}: {
  href: string;
  Icon: typeof Phone;
  label: string;
  external?: boolean;
  compact?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/15
                  bg-white/[0.06] font-medium text-white/85 transition-colors hover:bg-white/[0.12]
                  ${compact ? "h-11 flex-1 text-sm" : "h-11 w-full text-sm"}`}
    >
      <Icon size={16} strokeWidth={2} />
      {label}
    </a>
  );
}

function Galeria({ negocio }: { negocio: Establecimiento }) {
  const media: MediaAsset[] = negocio.media ?? [];
  const fotos = media.length
    ? media
    : negocio.foto_url
      ? [{ id: "foto", url_publica: negocio.foto_url, es_principal: true }]
      : [];
  const [selected, setSelected] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const cat = categoriaDef(negocio.categoria);
  const CatIcon = cat.Icon;

  const visibles = fotos.filter((f) => !broken[f.id]);
  const principal = visibles[Math.min(selected, Math.max(visibles.length - 1, 0))];

  if (!principal) {
    return (
      <div
        className="flex aspect-[16/9] md:aspect-[21/9] items-center justify-center rounded-2xl"
        style={{ background: cat.gradient }}
        aria-hidden
      >
        <CatIcon size={56} strokeWidth={1.25} style={{ color: `${cat.accent}90` }} />
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl">
        <img
          src={principal.url_publica}
          alt={principal.alt_text || negocio.nombre}
          loading="lazy"
          onError={() => setBroken((b) => ({ ...b, [principal.id]: true }))}
          className="aspect-[16/9] md:aspect-[21/9] w-full object-cover"
        />
      </div>
      {visibles.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibles.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Foto ${i + 1}`}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                i === selected ? "border-sky-400" : "border-white/10 hover:border-white/30"
              }`}
            >
              <img
                src={f.url_publica}
                alt=""
                loading="lazy"
                onError={() => setBroken((b) => ({ ...b, [f.id]: true }))}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NegocioSkeleton() {
  return (
    <main className="mx-auto max-w-5xl px-4 md:px-6 pt-20 md:pt-24 pb-16">
      <div className="aspect-[16/9] md:aspect-[21/9] animate-pulse rounded-2xl bg-white/[0.06]" />
      <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-white/[0.08]" />
      <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-8 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-white/[0.05]" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-white/[0.05]" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.05]" />
      </div>
    </main>
  );
}

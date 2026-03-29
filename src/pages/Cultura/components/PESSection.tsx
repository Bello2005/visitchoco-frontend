import { useState } from "react";
import { PESCard } from "./PESCard";
import type { PESItem } from "./PESCard";
import { motion } from "framer-motion";

const PES_STATIC: PESItem[] = [
  {
    id: 1,
    titulo: "Fiestas de San Pacho",
    municipio_nombre: "Quibdó",
    fecha_declaracion: "2012",
    ambito: "UNESCO · Patrimonio de la Humanidad",
    descripcion_corta:
      "15 días de resistencia convertida en fiesta. Desde 1648, los 12 barrios franciscanos de Quibdó toman la calle con chirimía, disfraces políticos y la Balsada sobre el Atrato.",
    descripcion_larga:
      "Las fiestas de San Francisco de Asís son el epicentro espiritual y político de Quibdó. El disfraz no es decoración — es un periódico público donde cada barrio denuncia la corrupción, el abandono estatal y la discriminación racial con sátira y arte callejero. La Alborada del 20 de septiembre comienza a medianoche con disparos de cañones simbólicos y chirimías que despiertan a la ciudad. El clímax es la Balsada: canoas adornadas navegando el río Atrato mientras la gente baila sobre el agua.",
    elementos_clave: [
      "Chirimía",
      "Los 12 barrios",
      "Balsada en el Atrato",
      "Disfraz político",
      "Alborada",
      "Bunde",
    ],
    fecha_celebracion: "20 septiembre – 5 octubre",
    organizacion_gestora: "Junta Pro-Fiestas de San Pacho",
    color: "#f59e0b",
    colorDark: "#92400e",
    imagen: "/images/municipios/quibdo.jpg",
    icon: "🎭",
  },
  {
    id: 2,
    titulo: "Gualíes, Alabaos y Levantamientos de Tumba",
    municipio_nombre: "Medio San Juan",
    fecha_declaracion: "2014 · PCI Nacional",
    ambito: "Patrimonio Inmaterial de Colombia",
    descripcion_corta:
      "Cuando muere un niño, la comunidad canta para celebrar que un ángel voló. Cuando muere un adulto, las cantaoras guían su alma durante nueve noches de alabaos a capella.",
    descripcion_larga:
      "Los ritos mortuorios afrochocoanos son la prueba más profunda de que en el Chocó la muerte no es el fin — es un tránsito que exige el acompañamiento de toda la comunidad. El Gualí celebra la muerte infantil con cantos alegres: el niño es un angelito puro que va directo al cielo. El Alabao acompaña la muerte adulta con cantos polifónicos a capella durante nueve noches de novenario. El Levantamiento de Tumba cierra el ciclo: se desmonta ceremoniosamente el altar, el alma puede partir, los vivos pueden continuar.",
    elementos_clave: [
      "Alabaos polifónicos",
      "Gualí o Chigualo",
      "Levantamiento de Tumba",
      "Novenario",
      "Cantaoras",
      "Andagoya",
    ],
    fecha_celebracion: "En los velorios — todo el año",
    organizacion_gestora: "Fundación Cultural de Andagoya",
    color: "#6366f1",
    colorDark: "#312e81",
    imagen: "/images/municipios/medio-baudo.jpg",
    icon: "🕯️",
  },
  {
    id: 3,
    titulo: "Saberes de la Partería Afro del Pacífico",
    municipio_nombre: "Chocó",
    fecha_declaracion: "2015",
    ambito: "UNESCO · Patrimonio de la Humanidad",
    descripcion_corta:
      "Las parteras chocoanas son guardianas de vida. Sus saberes — transmitidos de abuela a nieta durante siglos — sostienen la salud reproductiva de comunidades enteras que nunca tuvieron hospitales.",
    descripcion_larga:
      "La partera afrochocoana no es solo una comadrona — es médica, consejera espiritual, guardiana de plantas medicinales y custodio de una red de conocimientos que la medicina occidental apenas empieza a reconocer. Sus técnicas incluyen el uso de plantas del bosque húmedo tropical, cantos de alumbramiento, masajes específicos y un acompañamiento emocional que ningún sistema de salud formal ha podido replicar. En un departamento donde la mortalidad materna es estructuralmente alta por el abandono estatal, las parteras son literalmente la diferencia entre la vida y la muerte.",
    elementos_clave: [
      "Plantas medicinales",
      "Cantos de alumbramiento",
      "Conocimiento intergeneracional",
      "Comunidades del Pacífico",
      "Autonomía territorial",
    ],
    fecha_celebracion: "Permanente — conocimiento vivo",
    organizacion_gestora: "Red Departamental de Parteras",
    color: "#10b981",
    colorDark: "#064e3b",
    imagen: "/images/municipios/riosucio.jpg",
    icon: "🌿",
  },
];

export function PESSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="pes" className="py-24 px-6 md:px-16 bg-[#0a0f0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-amber-400/70 text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          >
            Patrimonio Cultural Inmaterial
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-white leading-tight"
            style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 700 }}
          >
            Lo que el mundo ya<br />
            <span className="text-amber-400">declaró sagrado.</span>
          </motion.h2>
        </div>

        {/* Cards — accordion horizontal en desktop, stack en mobile */}
        <div
          className="flex flex-col md:flex-row gap-3 md:gap-2"
          style={{ minHeight: 560 }}
        >
          {PES_STATIC.map((pes, i) => (
            <PESCard
              key={pes.id}
              pes={pes}
              isActive={active === i}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

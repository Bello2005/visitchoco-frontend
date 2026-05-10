import { useReducedMotion, type Transition, type Variants } from "framer-motion";

/** Curvas estándar — todos los componentes deben referenciar estas */
export const ease = {
  out:    [0.16, 1, 0.3, 1] as const,   // out-expo, default
  inOut:  [0.65, 0, 0.35, 1] as const,
  stand:  [0.4, 0, 0.2, 1] as const,
} as const;

/** Duraciones canónicas en segundos */
export const dur = {
  micro: 0.12,
  fast:  0.2,
  base:  0.32,
  slow:  0.6,
  hero:  0.85,
} as const;

/** Hook que devuelve transition respetando prefers-reduced-motion */
export function useT(opts?: Partial<Transition>): Transition {
  const reduce = useReducedMotion();
  if (reduce) return { duration: 0 };
  return { duration: dur.base, ease: ease.out, ...opts };
}

export const fadeRise: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

export const stagger = (delay = 0.06): Transition => ({
  staggerChildren: delay,
});

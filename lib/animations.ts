/**
 * Variantes e presets de animação centralizados.
 *
 * Regras seguidas:
 *  - Duração 150-300ms para microinterações, 300-500ms para entrada de tela.
 *  - Só transform/opacity (GPU) — nunca width/height/top/left.
 *  - easing "easeOut" entrada, "easeIn" saída.
 *  - Honra prefers-reduced-motion (Framer Motion já faz isso automaticamente
 *    quando a media query casa; basta usar `useReducedMotion` se precisar).
 */
import type { Variants, Transition } from 'framer-motion';

const easeOut: number[] = [0.16, 1, 0.3, 1]; // expo-out, muito suave
const easeInOut: number[] = [0.65, 0, 0.35, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

/** Stagger parent — os children entram em cascata. */
export const staggerContainer = (stagger = 0.08, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

/** Transição padrão para hovers (botões, cards). */
export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.18, ease: easeOut } },
  whileTap: { y: 0, scale: 0.98, transition: { duration: 0.12, ease: easeInOut } },
};

export const tapScale = {
  whileTap: { scale: 0.97, transition: { duration: 0.12, ease: easeInOut } },
};

export const navItemTransition: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
};

export const easeInOutQuart: Transition = { duration: 0.3, ease: easeInOut };

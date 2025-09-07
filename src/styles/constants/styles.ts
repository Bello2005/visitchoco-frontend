export const gradients = {
  primary: "from-emerald-500 to-blue-500",
  hover: "from-blue-500 to-emerald-500",
  text: "from-emerald-400 to-blue-400",
} as const;

export const commonStyles = {
  glassmorphism: "backdrop-blur-2xl bg-white/20 border border-white/20",
  focusRing: "focus:ring-2 focus:ring-emerald-400/50",
  transition: "transition-all duration-200",
  roundedContainer: "rounded-2xl",
  roundedInput: "rounded-lg",
} as const;

export const formStyles = {
  container:
    "p-6 sm:p-8 md:p-10 shadow-2xl w-full max-w-md mx-auto lg:mx-0 my-8 sm:my-4 lg:my-0 focus-within:shadow-emerald-400/30 transition-shadow",
  input:
    "w-full px-4 py-3 bg-white/5 rounded-lg focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent focus:outline-none transition-all text-white placeholder-white/70",
  label: "block text-sm font-medium text-white/80 mb-2",
  button:
    "w-full flex items-center justify-between px-6 py-4 rounded-lg font-medium shadow-lg",
} as const;

export const animations = {
  wave: {
    duration: "20s",
    reverseDuration: "15s",
  },
  hover: {
    scale: 1.02,
    tap: 0.98,
  },
} as const;

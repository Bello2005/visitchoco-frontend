import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  const sizes = {
    sm: {
      container: "w-10 h-10",
      icon: "w-6 h-6",
      text: "text-2xl",
    },
    md: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
      text: "text-2xl",
    },
    lg: {
      container: "w-16 h-16",
      icon: "w-8 h-8",
      text: "text-3xl",
    },
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`${sizes[size].container} rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center`}
      >
        <svg
          className={`${sizes[size].icon} text-white`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <span
        className={`${sizes[size].text} font-light tracking-widest text-white`}
      >
        VISIT<span className="font-bold">CHOCÓ</span>
      </span>
    </div>
  );
};

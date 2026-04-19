import React from "react";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  current?: boolean;
  icon?: "home";
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav
      aria-label="Ruta de navegación"
      className={`flex items-center gap-1 text-[11px] text-gray-500 ${className}`}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const base =
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors duration-150";
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {item.onClick && !item.current ? (
              <button
                onClick={item.onClick}
                className={`${base} hover:bg-gray-100 hover:text-gray-700 font-medium`}
              >
                {item.icon === "home" && <Home size={11} strokeWidth={2} />}
                <span>{item.label}</span>
              </button>
            ) : (
              <span
                className={`${base} ${item.current ? "text-gray-800 font-semibold" : ""}`}
                aria-current={item.current ? "page" : undefined}
              >
                {item.icon === "home" && <Home size={11} strokeWidth={2} />}
                <span className="truncate max-w-[120px]">{item.label}</span>
              </span>
            )}
            {!isLast && (
              <ChevronRight size={11} className="text-gray-300 flex-shrink-0" strokeWidth={2} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

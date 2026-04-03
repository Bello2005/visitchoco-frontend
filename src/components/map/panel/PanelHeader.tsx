import React from "react";
import { Link } from "react-router-dom";

interface PanelHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onClose: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClose,
}) => {
  return (
    <div className="flex-none px-4 pt-4 pb-3">
      <div className="flex items-center gap-2">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">VC</span>
          </div>
        </Link>

        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar lugar..."
            className="w-full pl-8 pr-8 py-1.5 text-sm bg-gray-50/80 border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 placeholder-gray-400 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Login (oculto hasta activar auth)
        <Link
          to="/login"
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-150"
          aria-label="Iniciar sesión"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </Link>
        */}

        {/* Close panel */}
        <button
          onClick={onClose}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors duration-150"
          aria-label="Cerrar panel"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

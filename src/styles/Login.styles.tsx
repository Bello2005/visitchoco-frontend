import { createGlobalStyle } from "styled-components";

export const LoginStyles = createGlobalStyle`
  @keyframes wave {
    0% { background-position-x: 0; }
    100% { background-position-x: 1000px; }
  }

  @keyframes pulse {
    0% { opacity: 0.1; transform: scale(1); }
    100% { opacity: 0.05; transform: scale(1.5); }
  }

  /* Color de placeholder cuando el campo es autocompletado */
  input:-webkit-autofill::placeholder {
    color: #38bdf8 !important; /* azul-400 */
    opacity: 1 !important;
  }

  input:-webkit-autofill {
    -webkit-text-fill-color: #fff !important;
    transition: background-color 9999s ease-in-out 0s;
  }

  /* Checkbox fondo transparente cuando no está marcado */
  input[type="checkbox"] {
    background-color: transparent !important;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 1.5px solid #d1fae5; /* emerald-100 para borde sutil */
    border-radius: 0.375rem;
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
    box-shadow: none;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  input[type="checkbox"]:checked {
    background-color: #34d399 !important; /* emerald-400 */
    border-color: #34d399 !important;
  }

  input[type="checkbox"]:focus {
    box-shadow: 0 0 0 2px #6ee7b7;
    border-color: #34d399;
  }

  /* Quitar fondo blanco de Chrome/Edge */
  input[type="checkbox"]::-webkit-check-indeterminate,
  input[type="checkbox"]::-webkit-check-checked,
  input[type="checkbox"]::-webkit-check-unchecked {
    background: transparent !important;
  }

  /* Personalizar el check */
  input[type="checkbox"]:checked:after {
    content: '';
    display: block;
    width: 0.5rem;
    height: 0.9rem;
    border: solid #fff;
    border-width: 0 0.2rem 0.2rem 0;
    margin: 0.1rem 0 0 0.35rem;
    transform: rotate(45deg);
  }

  /* Estilos del scrollbar personalizado */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(52, 211, 153, 0.5);
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(52, 211, 153, 0.7);
  }
`;

export const formContainerStyle = {
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
};

// Constantes de estilo para colores y gradientes
export const colors = {
  primary: {
    emerald: "#34d399",
    blue: "#38bdf8",
  },
  background: {
    dark: "#001220",
    gradient: {
      from: "#002a4d",
      via: "#003c1f",
      to: "#0a3410",
    },
  },
  text: {
    white: "#ffffff",
    whiteTransparent: {
      "80": "rgba(255, 255, 255, 0.8)",
      "60": "rgba(255, 255, 255, 0.6)",
      "50": "rgba(255, 255, 255, 0.5)",
      "20": "rgba(255, 255, 255, 0.2)",
      "10": "rgba(255, 255, 255, 0.1)",
    },
  },
  border: {
    rose: "#fb7185",
    emerald: "#34d399",
  },
};

export const gradients = {
  primary: "from-emerald-500 to-blue-500",
  hover: "from-blue-500 to-emerald-500",
  text: "from-emerald-400 to-blue-400",
};

export const animations = {
  wave: {
    duration: "20s",
    reverseDuration: "15s",
  },
};

// Utilidades de estilo comunes
export const commonStyles = {
  glassmorphism: "backdrop-blur-2xl bg-white/20 border border-white/20",
  focusRing: "focus:ring-2 focus:ring-emerald-400/50",
  transition: "transition-all duration-200",
  roundedContainer: "rounded-2xl",
  roundedInput: "rounded-lg",
};

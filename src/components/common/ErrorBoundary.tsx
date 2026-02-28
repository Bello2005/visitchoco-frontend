import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#001220] text-white px-6">
          <div className="text-center max-w-md">
            <p className="text-6xl mb-4">🌊</p>
            <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
            <p className="text-white/70 mb-6 text-sm">
              Ocurrió un error inesperado. Por favor, recarga la página para continuar.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

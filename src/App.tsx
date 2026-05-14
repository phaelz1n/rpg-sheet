import React from 'react';
import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { router } from './routes';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SelectedItemProvider } from './context/SelectedItemContext';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Critical Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-zinc-900 border-2 border-red-900/60 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-400 mb-2">Ops! Algo deu errado</h1>
            <p className="text-zinc-500 text-sm mb-6">
              Ocorreu um erro inesperado na renderização da página. 
              Isso pode ser causado por dados corrompidos ou falha em um componente.
            </p>
            <div className="bg-black/60 rounded-lg p-3 mb-6 text-left overflow-auto max-h-32 border border-red-900/20">
              <code className="text-[10px] text-red-300 font-mono break-all">
                {this.state.error?.toString() || "Erro desconhecido"}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-900 hover:bg-red-800 text-red-100 rounded-xl font-bold transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <SelectedItemProvider>
      <UIProvider>
        <AuthProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </AuthProvider>
      </UIProvider>
    </SelectedItemProvider>
  );
}

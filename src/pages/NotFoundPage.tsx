import { Link } from 'react-router';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-red-900/60 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl text-red-400 mb-2">404</h1>
        <p className="text-zinc-400 mb-6">Página não encontrada</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-900 to-orange-900 border border-amber-700 rounded-lg text-amber-100 hover:from-amber-800 hover:to-orange-800 transition-colors"
        >
          <Home className="w-5 h-5" />
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { User, Lock, LogIn, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string) => void;
}

export function LoginModal({ isOpen, onLogin, onRegister }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Preencha todos os campos');
      return;
    }

    if (isRegistering) {
      onRegister(username, password);
    } else {
      onLogin(username, password);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-900/60 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl">

        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl text-amber-400 mb-2">The Dark Path v3.0</h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            {isRegistering ? 'Criar nova conta' : 'Entre para acessar sua ficha'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="Digite seu usuário"
              autoFocus
            />
          </div>

          <div>
            <label className="text-amber-400 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-800/50 rounded p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-900 to-orange-900 border border-amber-700 rounded-lg p-3 text-amber-100 hover:from-amber-800 hover:to-orange-800 transition-colors flex items-center justify-center gap-2"
          >
            {isRegistering ? (
              <>
                <UserPlus className="w-5 h-5" />
                Registrar
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="w-full text-amber-500 text-sm hover:text-amber-400 transition-colors"
          >
            {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Registre-se'}
          </button>
        </form>
      </div>
    </div>
  );
}

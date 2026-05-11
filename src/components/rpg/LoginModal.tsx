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

        <div className="text-center mb-6 relative">
          <h2 className="text-xl sm:text-2xl text-amber-400 mb-2">The Dark Path</h2>
          <p className="text-zinc-400 text-xs sm:text-sm">
            {isRegistering ? 'Criar nova conta' : 'Entre para acessar sua ficha'}
          </p>
          
          <a 
            href="https://discord.gg/URT9DFSrwX" 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute -top-2 -right-2 w-8 h-8 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 border border-[#5865F2]/40 rounded-full flex items-center justify-center transition-all group"
            title="Discord do Grupo"
          >
            <svg 
              viewBox="0 0 127.14 96.36" 
              className="w-4 h-4 fill-[#5865F2] group-hover:fill-white transition-colors"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.4,80.21a105.73,105.73,0,0,0,32.88,16.15,83,83,0,0,0,7.22-11.47,67.48,67.48,0,0,1-11.5-5.54c.97-.71,1.93-1.46,2.85-2.22a74.3,74.3,0,0,0,63.45,0c.93.76,1.89,1.51,2.86,2.22a67.4,67.4,0,0,1-11.5,5.54,82.84,82.84,0,0,0,7.22,11.47,105.47,105.47,0,0,0,32.91-16.15C130.3,50.8,123.63,27,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.08-12.69,11.41-12.69S54,46,53.86,53,48.83,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.08-12.69,11.44-12.69S96.23,46,96.12,53,91.09,65.69,84.69,65.69Z"/>
            </svg>
          </a>
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, Trash2, Plus, Edit, Shield, X, Key, Package } from 'lucide-react';
import { ttrpgApi } from '../../lib/ttrpg-api';

interface AdminPanelProps {
  onAccessCharacter: (username: string) => void;
  onLogout: () => void;
  onResetPassword: (username: string, newPassword: string) => void;
}

interface UserData {
  username: string;
  characterName: string;
}

export function AdminPanel({ onAccessCharacter, onLogout, onResetPassword }: AdminPanelProps) {
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userList, setUserList] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await ttrpgApi.getAllUsers();
      if (response.users) {
        setUserList(response.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createNewUser = async () => {
    const cleanUsername = newUsername.trim();
    const cleanPassword = newPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      alert('Preencha usuário e senha!');
      return;
    }

    try {
      const response = await ttrpgApi.createUser(cleanUsername, cleanPassword);

      if (response.error) {
        alert(response.error);
        return;
      }

      setNewUsername('');
      setNewPassword('');
      await loadUsers();
      alert(`Usuário "${cleanUsername}" criado com sucesso!`);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Erro ao criar usuário');
    }
  };

  const deleteUser = async (username: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${username}"?`)) {
      return;
    }

    try {
      const response = await ttrpgApi.deleteUser(username);

      if (response.error) {
        alert(response.error);
        return;
      }

      await loadUsers();
      alert(`Usuário "${username}" deletado com sucesso!`);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao deletar usuário');
    }
  };

  const resetPassword = async (username: string) => {
    const newPassword = prompt(`Digite a nova senha para o usuário "${username}":`);
    if (newPassword && newPassword.trim()) {
      try {
        const response = await ttrpgApi.resetPassword(username, newPassword.trim());

        if (response.error) {
          alert(response.error);
          return;
        }

        alert(`Senha alterada com sucesso para "${username}"!`);
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Erro ao resetar senha');
      }
    }
  };

  // v2.1 - Skills + Items Management + Routing
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-black p-4 sm:p-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-2 border-purple-700/60 rounded-xl p-4 sm:p-6 mb-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              <div>
                <h1 className="text-lg sm:text-2xl text-purple-300">Painel Administrativo</h1>
                <p className="text-purple-400/70 text-xs sm:text-sm">Gerenciamento completo: usuários, fichas e itens</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <button
                onClick={() => navigate('/admin/items')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-900/60 to-yellow-900/60 border-2 border-amber-600/70 rounded-lg text-amber-200 hover:from-amber-800/80 hover:to-yellow-800/80 transition-all shadow-lg text-sm font-semibold"
              >
                <Package className="w-5 h-5" />
                Gerenciar Itens
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-red-300 hover:bg-red-900/70 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Create New User */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 border-amber-900/60 rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Novo Usuário
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Nome de usuário"
              className="bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Senha"
              className="bg-black/40 border border-amber-900/40 rounded px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={createNewUser}
              className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-700/50 rounded-lg px-4 py-2 text-green-300 hover:from-green-900/70 hover:to-emerald-900/70 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Usuário
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-black/90 border-2 border-amber-900/60 rounded-xl p-6 shadow-xl">
          <h2 className="text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários Cadastrados ({userList.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-zinc-500">
              Carregando usuários...
            </div>
          ) : userList.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              Nenhum usuário cadastrado ainda
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userList.map((user) => (
                <div
                  key={user.username}
                  className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border-2 border-amber-800/50 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-amber-500" />
                      <h3 className="text-amber-300 font-bold">{user.username}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm">{user.characterName}</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onAccessCharacter(user.username)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-900/50 border border-blue-700/50 rounded-lg text-blue-300 hover:bg-blue-900/70 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Acessar Ficha
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => resetPassword(user.username)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-900/50 border border-orange-700/50 rounded-lg text-orange-300 hover:bg-orange-900/70 transition-colors text-sm"
                      >
                        <Key className="w-4 h-4" />
                        Senha
                      </button>
                      <button
                        onClick={() => deleteUser(user.username)}
                        className="flex items-center justify-center px-3 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-red-300 hover:bg-red-900/70 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

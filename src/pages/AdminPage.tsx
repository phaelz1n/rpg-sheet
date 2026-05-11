import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { AdminPanel } from '../components/rpg/AdminPanel';
import { ttrpgApi } from '../lib/ttrpg-api';

export function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleAccessCharacter = async (username: string) => {
    // Admin accessing a user's character sheet
    // We'll load that character's data but keep admin logged in
    navigate(`/character?admin-view=${username}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetPassword = async (username: string, newPassword: string) => {
    try {
      await ttrpgApi.resetPassword(username, newPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  return (
    <AdminPanel
      onAccessCharacter={handleAccessCharacter}
      onLogout={handleLogout}
      onResetPassword={handleResetPassword}
    />
  );
}

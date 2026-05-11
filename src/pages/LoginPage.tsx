import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { LoginModal } from '../components/rpg/LoginModal';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAdmin } = useAuth();
  const { showToast } = useUI();

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      // Redirect based on role
      if (username === 'admin') {
        navigate('/admin');
      } else {
        navigate('/character');
      }
    } catch (error) {
      showToast('Usuário ou senha incorretos!', 'error');
    }
  };

  const handleRegister = async (username: string, password: string) => {
    try {
      await register(username, password);
      navigate('/character');
    } catch (error) {
      showToast('Erro ao registrar usuário!', 'error');
    }
  };

  return (
    <LoginModal
      isOpen={true}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
}

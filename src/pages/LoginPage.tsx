import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from '../components/rpg/LoginModal';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isAdmin } = useAuth();

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
      alert('Usuário ou senha incorretos!');
    }
  };

  const handleRegister = async (username: string, password: string) => {
    try {
      await register(username, password);
      navigate('/character');
    } catch (error) {
      alert('Erro ao registrar usuário!');
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

import React from 'react';
import AuthForm from '../components/auth/AuthForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-love-darker p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-love-light mb-2">
          Bem-vindo(a) ao LoveMedia
        </h1>
        <p className="text-muted-foreground">
          Faça login ou crie uma conta para gerenciar suas bibliotecas compartilhadas.
        </p>
      </div>
      <AuthForm />
    </div>
  );
};

export default Login; 

import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail, signUpWithEmail } from '../services/firebaseAuthService';
import { handleAuthSuccess, formatAuthError } from '../utils/authUtils';
import AuthTabsContainer from './auth/AuthTabsContainer';
import { LoginFormData } from './auth/LoginForm';
import { SignUpFormData } from './auth/SignUpForm';

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const user = await loginWithEmail(data.email, data.password);
      console.log("Login bem-sucedido:", user);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!"
      });
      
      await handleAuthSuccess(user.uid);
    } catch (error: any) {
      console.error("Erro de autenticação:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: formatAuthError(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      console.log("Registrando usuário:", data.email);
      const user = await signUpWithEmail(data.email, data.password);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login."
      });
      
      setActiveTab("login");
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: formatAuthError(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-love-deeper rounded-xl shadow-lg border border-love-light/20">
      <AuthTabsContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoginSubmit={onLoginSubmit}
        onSignUpSubmit={onSignUpSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AuthForm;

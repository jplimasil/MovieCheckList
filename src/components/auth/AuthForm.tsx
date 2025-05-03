import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail, signUpWithEmail } from '../../services/firebaseAuthService';
import { setAuthenticated } from '../../services/authService';
import { LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuthSuccess = async (userId: string) => {
    // Salva o ID do usuário no localStorage para uso de fallback
    localStorage.setItem('currentUserId', userId);
    
    // Atualiza o estado de autenticação
    await setAuthenticated(true);
    console.log("Autenticação bem-sucedida, redirecionando...");
    
    // Dispara um evento customizado para notificar outras partes da aplicação
    window.dispatchEvent(new Event('authChange'));

    // Redireciona para a página inicial
    navigate('/');
  };

  const onLoginSubmit = async (data: { email: string, password: string }) => {
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
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpSubmit = async (data: { username: string, email: string, password: string }) => {
    setIsLoading(true);
    try {
      console.log("Registrando usuário:", data.email);
      const user = await signUpWithEmail(data.email, data.password, data.username);
      
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
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 bg-love-deeper rounded-xl shadow-lg border border-love-light/20">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Login
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Cadastro
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
          <div className="text-center mt-4">
            <Button
              variant="link"
              type="button"
              onClick={() => navigate('/password-reset')}
              className="text-love-light hover:text-love-DEFAULT"
            >
              Esqueceu sua senha?
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="signup">
          <SignUpForm onSubmit={onSignUpSubmit} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForm;

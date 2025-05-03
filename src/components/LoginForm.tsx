import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail } from '../services/firebaseAuthService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Email e senha são obrigatórios",
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-love-darker p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="p-6">
          <div className="text-center mb-6">
            <h1 className="romantic-text text-2xl md:text-3xl text-love-light mb-2">
              Login
            </h1>
            <p className="text-muted-foreground">
              Entre com seu email e senha
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-love-deeper border-love-dark"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="bg-love-deeper border-love-dark"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-love-DEFAULT to-love-dark hover:from-love-dark hover:to-love-darker"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center mt-4">
              <Button
                variant="link"
                onClick={() => navigate('/password-reset')}
                className="text-love-light hover:text-love-DEFAULT"
              >
                Esqueceu sua senha?
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm; 
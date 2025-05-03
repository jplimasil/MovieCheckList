import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { sendPasswordReset } from '../services/firebaseAuthService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

const PasswordReset = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O email é obrigatório",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-love-darker p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Button
          variant="ghost"
          onClick={() => navigate('/login')}
          className="mb-4 text-love-light hover:text-love-DEFAULT"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o login
        </Button>

        <Card className="p-6">
          <div className="text-center mb-6">
            <h1 className="romantic-text text-2xl md:text-3xl text-love-light mb-2">
              Recuperar Senha
            </h1>
            <p className="text-muted-foreground">
              Digite seu email para receber as instruções de recuperação
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
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-love-DEFAULT to-love-dark hover:from-love-dark hover:to-love-darker"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Email de Recuperação'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { createGroup, joinGroup, getUserGroups, switchActiveGroup } from '../services/groupService';
import { Group } from '../services/groupService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, BookOpen } from 'lucide-react';

const GroupSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  useEffect(() => {
    const loadUserGroups = async () => {
      try {
        const groups = await getUserGroups();
        setUserGroups(groups);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar bibliotecas",
          description: error.message,
        });
      } finally {
        setIsLoadingGroups(false);
      }
    };

    loadUserGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome do grupo é obrigatório",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createGroup(groupName);
      toast({
        title: "Biblioteca criada com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar biblioteca",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O código de convite é obrigatório",
      });
      return;
    }

    setIsLoading(true);
    try {
      await joinGroup(inviteCode.toUpperCase());
      toast({
        title: "Você entrou na biblioteca!",
        description: "Você será redirecionado para o dashboard.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar na biblioteca",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterGroup = async (groupId: string) => {
    try {
      await switchActiveGroup(groupId);
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar na biblioteca",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-love-darker p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="romantic-text text-3xl md:text-4xl text-love-light mb-2">
            Configuração da Biblioteca
          </h1>
          <p className="text-muted-foreground">
            Crie uma nova biblioteca ou entre em uma existente
          </p>
        </div>

        {isLoadingGroups ? (
          <div className="animate-pulse h-48 bg-love-deeper rounded-lg" />
        ) : userGroups.length > 0 ? (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-love-light mb-4">
              Suas Bibliotecas
            </h2>
            <div className="grid gap-4">
              {userGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 bg-love-deeper rounded-lg"
                >
                  <div>
                    <h3 className="text-lg font-medium text-love-light">
                      {group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Criado em {group.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleEnterGroup(group.id)}
                    className="bg-gradient-to-r from-love-DEFAULT to-love-dark hover:from-love-dark hover:to-love-darker"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova
            </TabsTrigger>
            <TabsTrigger value="join">
              <Users className="w-4 h-4 mr-2" />
              Entrar em uma
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="p-6">
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium mb-2">
                    Nome da Biblioteca
                  </label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ex: Nossa Lista de Filmes"
                    className="bg-love-deeper border-love-dark"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-love-DEFAULT to-love-dark hover:from-love-dark hover:to-love-darker"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando...' : 'Criar Biblioteca'}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card className="p-6">
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div>
                  <label htmlFor="inviteCode" className="block text-sm font-medium mb-2">
                    Código de Convite
                  </label>
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Digite o código de 6 letras"
                    className="bg-love-deeper border-love-dark"
                    maxLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-love-DEFAULT to-love-dark hover:from-love-dark hover:to-love-darker"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar na Biblioteca'}
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupSetup; 
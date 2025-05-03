import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { getUserGroups, switchActiveGroup, getActiveGroup, getGroupInviteCode, deleteGroup } from '../../services/groupService';
import { Group } from '../../services/groupService';
import AddMediaForm from '../AddMediaForm';
import RelationshipCounter from '../RelationshipCounter';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

interface DashboardHeaderProps {
  onMediaUpdate: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMediaUpdate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string>('');

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const userGroups = await getUserGroups();
        setGroups(userGroups);
        
        const currentGroup = await getActiveGroup();
        setActiveGroup(currentGroup);
        
        if (currentGroup) {
          const code = await getGroupInviteCode(currentGroup.id);
          setInviteCode(code);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar grupos",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, []);

  const handleGroupSwitch = async (groupId: string) => {
    try {
      await switchActiveGroup(groupId);
      const newActiveGroup = await getActiveGroup();
      setActiveGroup(newActiveGroup);
      
      if (newActiveGroup) {
        const code = await getGroupInviteCode(newActiveGroup.id);
        setInviteCode(code);
      }
      
      onMediaUpdate();
      
      toast({
        title: "Grupo alterado",
        description: "Você mudou para outra biblioteca.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao trocar de grupo",
        description: error.message,
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroup(groupId);
      const updatedGroups = groups.filter(group => group.id !== groupId);
      setGroups(updatedGroups);
      
      if (activeGroup?.id === groupId) {
        setActiveGroup(null);
        setInviteCode('');
      }
      
      toast({
        title: "Grupo excluído",
        description: "O grupo foi excluído com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir grupo",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-love-deeper rounded-lg" />;
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="romantic-text text-2xl text-love-light mb-4">
          Bem-vindo ao seu Catálogo de Amor!
        </h2>
        <p className="text-muted-foreground mb-6">
          Você ainda não tem nenhuma biblioteca. Crie uma para começar!
        </p>
        <Button 
          onClick={() => navigate('/group-setup')}
          className="bg-gradient-to-r from-love-DEFAULT to-love-dark hover:from-love-dark hover:to-love-darker"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeira Biblioteca
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="romantic-text text-2xl md:text-3xl text-love-light">
              {activeGroup?.name || 'Selecione uma Biblioteca'}
            </h2>
            {inviteCode && (
              <p className="text-muted-foreground mt-1">
                Código de convite: <span className="font-mono bg-love-deeper px-2 py-1 rounded">{inviteCode}</span>
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-love-deeper border-love-dark">
                Trocar Biblioteca <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-love-deeper border-love-dark">
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => handleGroupSwitch(group.id)}
                  className={activeGroup?.id === group.id ? 'bg-love-dark' : ''}
                >
                  {group.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => navigate('/group-setup')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Biblioteca
              </DropdownMenuItem>
              {activeGroup && (
                <DropdownMenuItem 
                  onClick={() => handleDeleteGroup(activeGroup.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Biblioteca Atual
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <AddMediaForm onAddSuccess={onMediaUpdate} />
      </div>
      
      <div>
        <RelationshipCounter />
      </div>
    </div>
  );
};

export default DashboardHeader;

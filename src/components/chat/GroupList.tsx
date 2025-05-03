import React, { useEffect, useState } from 'react';
import { getUserGroups, switchActiveGroup } from '../../services/groupService';
import { useAuth } from '../../contexts/AuthContext';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Group {
  id: string;
  name: string;
}

interface GroupListProps {
  onGroupSelect: (groupId: string) => void;
}

export const GroupList: React.FC<GroupListProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadGroups = async () => {
      if (user) {
        try {
          const userGroups = await getUserGroups();
          setGroups(userGroups);
        } catch (error) {
          console.error('Erro ao carregar grupos:', error);
        }
      }
    };

    loadGroups();
  }, [user]);

  const handleGroupSelect = async (groupId: string) => {
    console.log('GroupList - handleGroupSelect - groupId:', groupId);
    try {
      if (user) {
        console.log('GroupList - switchActiveGroup - groupId:', groupId);
        await switchActiveGroup(groupId);
        console.log('GroupList - onGroupSelect - groupId:', groupId);
        onGroupSelect(groupId);
      } else {
        console.log('GroupList - Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao selecionar grupo:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-love-light/20 flex items-center gap-2">
        <Users className="h-5 w-5 text-love-light" />
        <h2 className="text-lg font-semibold text-love-light">Grupos</h2>
      </div>
      {groups.length > 0 ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-love-light/20 scrollbar-track-transparent">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupSelect(group.id)}
              className="w-full p-4 text-left hover:bg-love-light/5 transition-colors"
            >
              <p className="text-love-light/80">{group.name}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Users className="h-10 w-10 text-love-light/40 mb-2" />
          <p className="text-love-light/60">Nenhum grupo encontrado</p>
        </div>
      )}
    </div>
  );
}; 
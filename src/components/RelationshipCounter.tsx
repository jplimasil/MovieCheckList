
import React, { useState, useEffect } from 'react';
import { getRelationshipStartDate, setRelationshipStartDate } from '../services/authService';
import { Heart, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const RelationshipCounter: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  const calculateDays = (start: Date): number => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const days = calculateDays(startDate);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const startDateStr = await getRelationshipStartDate();
        setStartDate(new Date(startDateStr));
        setEditValue(new Date(startDateStr).toISOString().split('T')[0]);
      } catch (error) {
        console.error("Erro ao carregar data inicial:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a data inicial."
        });
      }
    };
    
    loadData();
  }, []);
  
  // Format date as dd/mm/yyyy for Brazilian format
  const formattedDate = `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()}`;
  
  return (
    <div className="bg-love-deeper p-5 rounded-xl text-center shadow-lg transform hover:scale-105 transition-transform duration-300 border border-love-light/20">
      <div className="flex items-center justify-center mb-2">
        <Heart className="h-5 w-5 text-love-light mr-2 animate-pulse" fill="#4A148C" />
        <h3 className="romantic-text text-xl text-love-light">Nosso Tempo Juntos</h3>
      </div>
      
      <div className="relative">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2 mb-1">
            <Input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-40 text-center bg-love-deepest text-white border-love-light/30"
            />
            <Button
              size="sm"
              onClick={async () => {
                const newDate = new Date(editValue);
                if (!isNaN(newDate.getTime())) {
                  try {
                    await setRelationshipStartDate(newDate.toISOString());
                    setStartDate(newDate);
                    setIsEditing(false);
                    toast({
                      title: "Data atualizada",
                      description: `A data inicial foi atualizada com sucesso.`
                    });
                  } catch (error: any) {
                    toast({
                      variant: "destructive",
                      title: "Erro ao salvar",
                      description: error.message
                    });
                  }
                } else {
                  toast({
                    variant: "destructive",
                    title: "Data inválida",
                    description: "Por favor, selecione uma data válida.",
                  });
                }
              }}
              className="bg-love-light hover:bg-love-light/80"
            >
              Salvar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="text-love-light hover:text-love-light/80"
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 relative z-10">
            <div className="text-5xl font-bold text-white animate-float">{days}</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditValue(startDate.toISOString().split('T')[0]);
                setIsEditing(true);
              }}
              className="text-love-light hover:text-love-light/80"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none z-0">
          <Heart className="h-32 w-32 text-love-light" fill="currentColor" />
        </div>
      </div>
      
      <div className="text-sm text-gray-300 mt-2 bg-love-deepest/80 py-1 px-3 rounded-full inline-block">
        desde {formattedDate}
      </div>
    </div>
  );
};

export default RelationshipCounter;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { addCategory } from '@/services/categoryService';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded?: () => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, onOpenChange, onCategoryAdded }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSaveCategory = async () => {
    if (newCategoryName.trim()) {
      setLoading(true);
      try {
        await addCategory(newCategoryName.trim());
        
        toast({
          title: "Nova categoria adicionada",
          description: `A categoria "${newCategoryName}" foi criada com sucesso!`,
          duration: 3000,
        });
        
        setNewCategoryName('');
        onOpenChange(false);
        onCategoryAdded?.();
      } catch (error) {
        console.error("Error adding category:", error);
        toast({
          title: "Erro ao adicionar categoria",
          description: "Não foi possível adicionar a categoria. Tente novamente.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome válido para a categoria.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-love-deeper border-love-deepest text-foreground sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-love-light">Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar seus itens de mídia.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Nome
            </label>
            <Input
              id="name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="col-span-3 bg-love-deepest border-love-deepest focus-visible:ring-love-light"
              placeholder="Digite o nome da categoria"
              autoComplete="off"
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            type="button"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveCategory}
            type="button"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;

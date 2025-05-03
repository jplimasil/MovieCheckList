
import React, { useState, useEffect } from 'react';
import { MediaType, ProgressStatus, addMedia } from '../services/mediaService';
import { getCategories, Category } from '../services/categoryService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface AddMediaFormProps {
  onAddSuccess: () => void;
}

const AddMediaForm: React.FC<AddMediaFormProps> = ({ onAddSuccess }) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie' as MediaType,
    progress: 'toWatch' as ProgressStatus,
    description: '',
    categoryId: '',
  });

  useEffect(() => {
    if (open) {
      const loadCategories = async () => {
        try {
          const fetchedCategories = await getCategories();
          setCategories(fetchedCategories);
        } catch (error) {
          console.error("Error loading categories:", error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar categorias",
            description: "Não foi possível carregar as categorias.",
          });
        }
      };
      loadCategories();
    }
  }, [open]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as MediaType }));
  };
  
  const handleProgressChange = (value: string) => {
    setFormData((prev) => ({ ...prev, progress: value as ProgressStatus }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O título é obrigatório.",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await addMedia({
        ...formData,
        title: formData.title.trim(),
      });
      
      toast({
        title: "Item adicionado",
        description: `"${formData.title}" foi adicionado com sucesso!`,
      });
      
      setFormData({
        title: '',
        type: 'movie',
        progress: 'toWatch',
        description: '',
        categoryId: '',
      });
      
      setOpen(false);
      onAddSuccess();
    } catch (error) {
      console.error("Error adding media:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar item",
        description: "Não foi possível adicionar o item. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-love-DEFAULT to-love-dark hover:from-love-dark hover:to-love-darker"
        >
          Adicionar Novo
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-love-dark">
        <DialogHeader>
          <DialogTitle className="romantic-text text-2xl text-love-light">Adicionar Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título do item"
              className="bg-muted"
              disabled={loading}
            />
          </div>
          
          <div>
            <Label>Tipo</Label>
            <RadioGroup 
              value={formData.type} 
              onValueChange={handleTypeChange}
              className="flex space-x-4 mt-2"
              disabled={loading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="movie" id="type-movie" />
                <Label htmlFor="type-movie">Filme</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="series" id="type-series" />
                <Label htmlFor="type-series">Série</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="book" id="type-book" />
                <Label htmlFor="type-book">Livro</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label>Status</Label>
            <RadioGroup 
              value={formData.progress} 
              onValueChange={handleProgressChange}
              className="flex space-x-4 mt-2"
              disabled={loading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="toWatch" id="status-towatch" />
                <Label htmlFor="status-towatch">Para ver</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="watching" id="status-watching" />
                <Label htmlFor="status-watching">Assistindo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="status-completed" />
                <Label htmlFor="status-completed">Concluído</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Adicione uma descrição ou notas..."
              className="bg-muted"
              disabled={loading}
            />
          </div>
          
          <div>
            <Label>Categoria</Label>
            <Select value={formData.categoryId} onValueChange={handleCategoryChange} disabled={loading}>
              <SelectTrigger className="bg-muted">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-category">Sem categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-love-dark text-love-light"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-love-DEFAULT to-love-dark hover:from-love-dark hover:to-love-darker"
              disabled={loading}
            >
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMediaForm;

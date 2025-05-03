import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where 
} from "firebase/firestore";
import { db } from "./firebaseService";
import { getCurrentUser } from "./firebaseAuthService";
import { getActiveGroup } from "./groupService";

const CATEGORIES_COLLECTION = 'categories';

export interface Category {
  id: string;
  name: string;
  groupId: string;
  userId: string;
  createdAt: Date;
}

// Obter todas as categorias do grupo atual
export const getCategories = async (): Promise<Category[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const categoriesQuery = query(
    collection(db, CATEGORIES_COLLECTION),
    where('groupId', '==', activeGroup.id)
  );

  const categoriesSnap = await getDocs(categoriesQuery);
  return categoriesSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  })) as Category[];
};

// Adicionar nova categoria
export const addCategory = async (name: string): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const categoryRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
    name,
    groupId: activeGroup.id,
    userId: user.uid,
    createdAt: new Date()
  });

  return categoryRef.id;
};

// Atualizar categoria
export const updateCategory = async (categoryId: string, name: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  const categoryDoc = await getDoc(categoryRef);

  if (!categoryDoc.exists()) {
    throw new Error('Categoria não encontrada');
  }

  const categoryData = categoryDoc.data() as Category;
  if (categoryData.groupId !== activeGroup.id) {
    throw new Error('Você não tem permissão para modificar esta categoria');
  }

  await updateDoc(categoryRef, { name });
};

// Excluir categoria
export const deleteCategory = async (categoryId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  const categoryDoc = await getDoc(categoryRef);

  if (!categoryDoc.exists()) {
    throw new Error('Categoria não encontrada');
  }

  const categoryData = categoryDoc.data() as Category;
  if (categoryData.groupId !== activeGroup.id) {
    throw new Error('Você não tem permissão para excluir esta categoria');
  }

  await deleteDoc(categoryRef);
};

// Obter contagem de mídia por categoria
export const getCategoryMediaCounts = async (): Promise<Record<string, number>> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const categories = await getCategories();
  const counts: Record<string, number> = {};

  for (const category of categories) {
    const mediaQuery = query(
      collection(db, 'media'),
      where('groupId', '==', activeGroup.id),
      where('categoryId', '==', category.id)
    );

    const mediaSnap = await getDocs(mediaQuery);
    counts[category.id] = mediaSnap.size;
  }

  return counts;
};

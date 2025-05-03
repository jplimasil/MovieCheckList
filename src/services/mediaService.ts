import { collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "./firebaseService";
import { getCurrentUser } from "./firebaseAuthService";
import { getActiveGroup } from "./groupService";

export type MediaType = 'movie' | 'series' | 'book';

export type ProgressStatus = 'toWatch' | 'watching' | 'completed';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  imageUrl?: string;
  description?: string;
  progress: ProgressStatus;
  addedDate: string;
  completedDate?: string;
  rating?: number;
  notes?: string;
  categoryId?: string;
  groupId: string;
  userId: string;
}

const MEDIA_COLLECTION = 'media';

// Função auxiliar para obter o ID do usuário atual
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    return user?.uid || null;
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    return null;
  }
};

// Obter todos os itens de mídia do grupo atual
export const getAllMedia = async (): Promise<MediaItem[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const mediaQuery = query(
    collection(db, 'media'),
    where('groupId', '==', activeGroup.id)
  );

  const mediaSnap = await getDocs(mediaQuery);
  return mediaSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as MediaItem[];
};

// Obter mídia por tipo
export const getMediaByType = async (type: MediaType): Promise<MediaItem[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const mediaQuery = query(
    collection(db, 'media'),
    where('groupId', '==', activeGroup.id),
    where('type', '==', type)
  );

  const mediaSnap = await getDocs(mediaQuery);
  return mediaSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as MediaItem[];
};

// Obter mídia por status de progresso
export const getMediaByProgress = async (progress: ProgressStatus): Promise<MediaItem[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const mediaQuery = query(
    collection(db, 'media'),
    where('groupId', '==', activeGroup.id),
    where('progress', '==', progress)
  );

  const mediaSnap = await getDocs(mediaQuery);
  return mediaSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as MediaItem[];
};

// Obter mídia por categoria para o usuário atual
export const getMediaByCategory = async (categoryId: string): Promise<MediaItem[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("Nenhum usuário logado para buscar mídia por categoria");
      return [];
    }
    
    const mediaQuery = query(
      collection(db, MEDIA_COLLECTION), 
      where("categoryId", "==", categoryId),
      where("userId", "==", userId)
    );
    
    const mediaSnapshot = await getDocs(mediaQuery);
    const mediaItems: MediaItem[] = [];
    
    mediaSnapshot.forEach((doc) => {
      mediaItems.push({
        id: doc.id,
        ...doc.data()
      } as MediaItem);
    });
    
    return mediaItems;
  } catch (error) {
    console.error("Erro ao obter mídia por categoria:", error);
    // Fallback para localStorage
    const storedMedia = localStorage.getItem('loveMediaList');
    const allMedia = storedMedia ? JSON.parse(storedMedia) : [];
    
    // Filtrar por usuário atual e categoria apenas no fallback
    const userId = localStorage.getItem('currentUserId');
    return allMedia.filter((item: MediaItem) => item.categoryId === categoryId && item.userId === userId);
  }
};

// Adicionar novo item de mídia
export const addMedia = async (data: Omit<MediaItem, 'id' | 'addedDate' | 'userId' | 'groupId'>): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const mediaRef = await addDoc(collection(db, 'media'), {
    ...data,
    addedDate: new Date().toISOString(),
    userId: user.uid,
    groupId: activeGroup.id
  });

  return mediaRef.id;
};

// Atualizar mídia (verificando a propriedade do usuário)
export const updateMedia = async (id: string, updates: Partial<MediaItem>): Promise<MediaItem | null> => {
  try {
    // Tratar "no-category"
    if (updates.categoryId === 'no-category') {
      updates.categoryId = undefined;
    }
    
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("Nenhum usuário logado para atualizar mídia");
    }
    
    const mediaDocRef = doc(db, MEDIA_COLLECTION, id);
    const mediaDoc = await getDoc(mediaDocRef);
    
    if (!mediaDoc.exists()) {
      return null;
    }
    
    const currentData = mediaDoc.data() as MediaItem;
    
    // Verificar se o item pertence ao usuário atual
    if (currentData.userId !== userId) {
      console.error("Tentativa de atualizar mídia que não pertence ao usuário atual");
      return null;
    }
    
    const updatedItem = { ...currentData, ...updates };
    
    await updateDoc(mediaDocRef, updatedItem);
    
    return {
      id,
      ...updatedItem
    } as MediaItem;
  } catch (error) {
    console.error("Erro ao atualizar mídia:", error);
    // Fallback para localStorage
    const storedMedia = localStorage.getItem('loveMediaList');
    const media = storedMedia ? JSON.parse(storedMedia) : [];
    
    // Obter ID do usuário atual para verificação
    const userId = localStorage.getItem('currentUserId');
    
    const index = media.findIndex((item: MediaItem) => item.id === id && item.userId === userId);
    
    if (index === -1) return null;
    
    if (updates.categoryId === 'no-category') {
      updates.categoryId = undefined;
    }
    
    const updatedItem = { ...media[index], ...updates };
    media[index] = updatedItem;
    
    localStorage.setItem('loveMediaList', JSON.stringify(media));
    
    return updatedItem;
  }
};

// Marcar item como concluído
export const markAsCompleted = async (mediaId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const mediaRef = doc(db, 'media', mediaId);
  const mediaDoc = await getDoc(mediaRef);

  if (!mediaDoc.exists()) {
    throw new Error('Item não encontrado');
  }

  const mediaData = mediaDoc.data() as MediaItem;
  if (mediaData.groupId !== activeGroup.id) {
    throw new Error('Você não tem permissão para modificar este item');
  }

  await updateDoc(mediaRef, {
    progress: 'completed',
    completedDate: new Date().toISOString()
  });
};

// Excluir item de mídia
export const deleteMedia = async (mediaId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const activeGroup = await getActiveGroup();
  if (!activeGroup) throw new Error('Nenhum grupo selecionado');

  const mediaRef = doc(db, 'media', mediaId);
  const mediaDoc = await getDoc(mediaRef);

  if (!mediaDoc.exists()) {
    throw new Error('Item não encontrado');
  }

  const mediaData = mediaDoc.data() as MediaItem;
  if (mediaData.groupId !== activeGroup.id) {
    throw new Error('Você não tem permissão para excluir este item');
  }

  await deleteDoc(mediaRef);
};

// Obter contagens para o grupo atual
export const getMediaCounts = async () => {
  try {
    const media = await getAllMedia();
    
    return {
      total: media.length,
      byType: {
        movie: media.filter(item => item.type === 'movie').length,
        series: media.filter(item => item.type === 'series').length,
        book: media.filter(item => item.type === 'book').length,
      },
      byProgress: {
        toWatch: media.filter(item => item.progress === 'toWatch').length,
        watching: media.filter(item => item.progress === 'watching').length,
        completed: media.filter(item => item.progress === 'completed').length,
      }
    };
  } catch (error) {
    console.error("Erro ao obter contagens de mídia:", error);
    return {
      total: 0,
      byType: { movie: 0, series: 0, book: 0 },
      byProgress: { toWatch: 0, watching: 0, completed: 0 }
    };
  }
};

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  arrayUnion,
  serverTimestamp,
  setDoc,
  deleteDoc,
  arrayRemove
} from "firebase/firestore";
import { db } from "./firebaseService";
import { getCurrentUser } from "./firebaseAuthService";

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  members: {
    [userId: string]: {
      role: 'admin' | 'member';
      joinedAt: Date;
    };
  };
  inviteCode: string;
}

// Função para gerar código de convite único
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Função para garantir que o documento do usuário existe
const ensureUserDoc = async (userId: string): Promise<void> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', userId), {
      groupIds: [],
      activeGroupId: null,
      createdAt: serverTimestamp()
    });
  }
};

// Criar um novo grupo
export const createGroup = async (name: string): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Garante que o documento do usuário existe
  await ensureUserDoc(user.uid);

  const groupRef = await addDoc(collection(db, 'groups'), {
    name,
    createdAt: serverTimestamp(),
    createdBy: user.uid,
    members: {
      [user.uid]: {
        role: 'admin',
        joinedAt: serverTimestamp()
      }
    },
    inviteCode: generateInviteCode()
  });

  // Tenta atualizar o documento do usuário com retry
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        groupIds: arrayUnion(groupRef.id),
        activeGroupId: groupRef.id
      });
      break;
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        throw new Error('Não foi possível atualizar o documento do usuário após várias tentativas');
      }
      // Espera um curto período antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 500));
      // Tenta garantir novamente que o documento existe
      await ensureUserDoc(user.uid);
    }
  }

  return groupRef.id;
};

// Entrar em um grupo existente
export const joinGroup = async (inviteCode: string): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Garante que o documento do usuário existe
  await ensureUserDoc(user.uid);

  // Busca o grupo pelo código de convite
  const groupQuery = query(
    collection(db, 'groups'),
    where('inviteCode', '==', inviteCode)
  );
  const groupSnap = await getDocs(groupQuery);
  
  if (groupSnap.empty) {
    throw new Error('Código de convite inválido');
  }

  const groupDoc = groupSnap.docs[0];
  const groupId = groupDoc.id;

  // Verifica se o usuário já é membro
  const groupData = groupDoc.data();
  if (groupData.members[user.uid]) {
    throw new Error('Você já é membro deste grupo');
  }

  // Adiciona o usuário ao grupo
  await updateDoc(doc(db, 'groups', groupId), {
    [`members.${user.uid}`]: {
      role: 'member',
      joinedAt: serverTimestamp()
    }
  });

  // Adiciona o groupId ao usuário
  await updateDoc(doc(db, 'users', user.uid), {
    groupIds: arrayUnion(groupId),
    activeGroupId: groupId
  });

  return groupId;
};

// Obter grupos do usuário
export const getUserGroups = async (): Promise<Group[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const groupIds = userDoc.data()?.groupIds || [];

  if (groupIds.length === 0) {
    return [];
  }

  const groups: Group[] = [];
  for (const groupId of groupIds) {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      groups.push({
        id: groupDoc.id,
        ...groupDoc.data(),
        createdAt: groupDoc.data().createdAt?.toDate(),
      } as Group);
    }
  }

  return groups;
};

// Trocar grupo ativo
export const switchActiveGroup = async (groupId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Verifica se o usuário pertence ao grupo
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const groupIds = userDoc.data()?.groupIds || [];

  if (!groupIds.includes(groupId)) {
    throw new Error('Você não pertence a este grupo');
  }

  // Atualiza o grupo ativo
  await updateDoc(doc(db, 'users', user.uid), {
    activeGroupId: groupId
  });
};

// Obter grupo ativo
export const getActiveGroup = async (): Promise<Group | null> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const activeGroupId = userDoc.data()?.activeGroupId;

  if (!activeGroupId) {
    return null;
  }

  const groupDoc = await getDoc(doc(db, 'groups', activeGroupId));
  if (!groupDoc.exists()) {
    return null;
  }

  return {
    id: groupDoc.id,
    ...groupDoc.data(),
    createdAt: groupDoc.data().createdAt?.toDate(),
  } as Group;
};

// Obter código de convite do grupo
export const getGroupInviteCode = async (groupId: string): Promise<string> => {
  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  if (!groupDoc.exists()) {
    throw new Error('Grupo não encontrado');
  }
  return groupDoc.data().inviteCode;
};

// Excluir um grupo
export const deleteGroup = async (groupId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const groupDoc = await getDoc(doc(db, 'groups', groupId));
  if (!groupDoc.exists()) {
    throw new Error('Grupo não encontrado');
  }

  const groupData = groupDoc.data();
  if (groupData.members[user.uid]?.role !== 'admin') {
    throw new Error('Apenas administradores podem excluir o grupo');
  }

  // Remove o grupo do usuário
  await updateDoc(doc(db, 'users', user.uid), {
    groupIds: arrayRemove(groupId),
    activeGroupId: null
  });

  // Exclui o grupo
  await deleteDoc(doc(db, 'groups', groupId));
}; 
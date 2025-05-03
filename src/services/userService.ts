import { doc, getDoc, setDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseService";
import { getCurrentUser } from "./firebaseAuthService";

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  groupIds: string[];
  activeGroupId: string | null;
  createdAt: Date;
}

// Função para criar ou atualizar o perfil do usuário
export const createUserProfile = async (
  userId: string,
  data: { username: string; email: string }
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  await setDoc(userRef, {
    uid: userId,
    username: data.username,
    email: data.email,
    groupIds: [],
    activeGroupId: null,
    createdAt: new Date()
  }, { merge: true });
};

// Função para verificar se um nome de usuário já existe
export const checkUsernameExists = async (username: string): Promise<boolean> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Função para buscar um usuário pelo nome de usuário ou email
export const getUserByUsernameOrEmail = async (identifier: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, 'users');
  // Primeiro tenta buscar por nome de usuário
  let q = query(usersRef, where('username', '==', identifier));
  let querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    // Se não encontrou por username, tenta por email
    q = query(usersRef, where('email', '==', identifier));
    querySnapshot = await getDocs(q);
  }
  
  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return {
    ...userDoc.data(),
    uid: userDoc.id
  } as UserProfile;
};

// Função para buscar um usuário pelo ID
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (!userDoc.exists()) {
    return null;
  }

  return {
    ...userDoc.data(),
    uid: userDoc.id
  } as UserProfile;
};

// Função para atualizar o perfil do usuário
export const updateUserProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, data, { merge: true });
};

// Função para garantir que o documento do usuário existe
export const ensureUserDoc = async (
  userId: string,
  data?: { username?: string; email?: string }
): Promise<void> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      username: data?.username || '',
      email: data?.email || '',
      groupIds: [],
      activeGroupId: null,
      createdAt: new Date()
    });
  }
};

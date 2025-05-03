import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  sendPasswordResetEmail
} from "firebase/auth";
import { app } from "./firebaseService";
import { createUserProfile, getUserByUsernameOrEmail } from "./userService";

const auth = getAuth(app);

export const loginWithEmail = async (identifier: string, password: string) => {
  try {
    // Primeiro, verifica se o identificador é um nome de usuário
    const userProfile = await getUserByUsernameOrEmail(identifier);
    if (!userProfile) {
      throw new Error('Usuário não encontrado');
    }

    // Usa o email do perfil para fazer login
    const userCredential = await signInWithEmailAndPassword(auth, userProfile.email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

export const signUpWithEmail = async (email: string, password: string, username: string) => {
  try {
    // Cria o usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Cria o perfil do usuário no Firestore
    await createUserProfile(userCredential.user.uid, {
      username,
      email
    });

    return userCredential.user;
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      }, (error) => {
        console.error("Erro ao verificar estado de autenticação:", error);
        reject(error);
      });
    } catch (error) {
      console.error("Erro ao iniciar verificação de autenticação:", error);
      reject(error);
    }
  });
};

// Enviar email de recuperação de senha
export const sendPasswordReset = async (identifier: string): Promise<void> => {
  try {
    // Primeiro, verifica se o identificador é um nome de usuário
    const userProfile = await getUserByUsernameOrEmail(identifier);
    if (!userProfile) {
      throw new Error('Usuário não encontrado');
    }

    // Usa o email do perfil para enviar o reset de senha
    await sendPasswordResetEmail(auth, userProfile.email);
  } catch (error: any) {
    console.error('Erro ao enviar email de recuperação:', error);
    switch (error.code) {
      case 'auth/invalid-email':
        throw new Error('Email inválido');
      case 'auth/user-not-found':
        throw new Error('Não existe uma conta com este email');
      case 'auth/missing-android-pkg-name':
      case 'auth/missing-continue-uri':
      case 'auth/missing-ios-bundle-id':
      case 'auth/invalid-continue-uri':
      case 'auth/unauthorized-continue-uri':
        throw new Error('Erro de configuração do Firebase. Contate o administrador.');
      default:
        throw new Error('Erro ao enviar email de recuperação. Tente novamente mais tarde.');
    }
  }
};

const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/user-disabled':
      return 'Usuário desativado';
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/email-already-in-use':
      return 'Email já está em uso';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
};

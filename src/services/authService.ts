import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseService";
import { getCurrentUser } from "./firebaseAuthService";

// Constantes para coleções e documentos
const AUTH_COLLECTION = 'authentication';
const PIN_DOC = 'pin';
const AUTH_STATUS_DOC = 'status';
const RELATIONSHIP_DOC = 'relationshipData';

// Check if PIN is stored, if not, create a default one
const initializePin = async () => {
  try {
    const pinDocRef = doc(db, AUTH_COLLECTION, PIN_DOC);
    const pinDocSnap = await getDoc(pinDocRef);
    
    if (!pinDocSnap.exists()) {
      await setDoc(pinDocRef, { value: '0715' }); // Default PIN
    }
  } catch (error) {
    console.error("Error initializing PIN:", error);
    // Fallback to localStorage if Firestore fails
    const storedPin = localStorage.getItem('lovePin');
    if (!storedPin) {
      localStorage.setItem('lovePin', '0715');
    }
  }
};

// Verify PIN
export const verifyPin = async (pin: string): Promise<boolean> => {
  try {
    await initializePin();
    const pinDocRef = doc(db, AUTH_COLLECTION, PIN_DOC);
    const pinDocSnap = await getDoc(pinDocRef);
    
    if (pinDocSnap.exists()) {
      return pin === pinDocSnap.data().value;
    }
    // Fallback to localStorage
    return pin === localStorage.getItem('lovePin');
  } catch (error) {
    console.error("Error verifying PIN:", error);
    // Fallback to localStorage
    return pin === localStorage.getItem('lovePin');
  }
};

// Set PIN
export const setPin = async (pin: string): Promise<void> => {
  try {
    await setDoc(doc(db, AUTH_COLLECTION, PIN_DOC), { value: pin });
  } catch (error) {
    console.error("Error setting PIN:", error);
    // Fallback to localStorage
    localStorage.setItem('lovePin', pin);
  }
};

// Check if authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// Set authenticated state
export const setAuthenticated = async (value: boolean): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (user) {
      await setDoc(doc(db, AUTH_COLLECTION, AUTH_STATUS_DOC), { 
        authenticated: value,
        userId: user.uid 
      });
    }
  } catch (error) {
    console.error("Error setting authentication:", error);
    localStorage.setItem('loveAuthenticated', value.toString());
  }
};

// Save all app data to Firestore
export const saveAppData = async (data: any): Promise<void> => {
  try {
    await setDoc(doc(db, AUTH_COLLECTION, 'appData'), { data });
  } catch (error) {
    console.error("Error saving app data:", error);
    // Fallback to localStorage
    localStorage.setItem('loveAppData', JSON.stringify(data));
  }
};

// Get all app data from Firestore
export const getAppData = async (): Promise<any> => {
  try {
    const appDataRef = doc(db, AUTH_COLLECTION, 'appData');
    const appDataSnap = await getDoc(appDataRef);
    
    if (appDataSnap.exists()) {
      return appDataSnap.data().data;
    }
    return null;
  } catch (error) {
    console.error("Error getting app data:", error);
    // Fallback to localStorage
    const data = localStorage.getItem('loveAppData');
    return data ? JSON.parse(data) : null;
  }
};

// Salvar a data de início do relacionamento
export const setRelationshipStartDate = async (date: string): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    await setDoc(doc(db, AUTH_COLLECTION, RELATIONSHIP_DOC), {
      startDate: date,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao salvar data do relacionamento:', error);
    throw new Error('Não foi possível salvar a data do relacionamento');
  }
};

// Obter a data de início do relacionamento
export const getRelationshipStartDate = async (): Promise<string> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Usuário não autenticado');

    const docRef = doc(db, AUTH_COLLECTION, RELATIONSHIP_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().startDate;
    } else {
      const defaultDate = new Date().toISOString();
      await setRelationshipStartDate(defaultDate);
      return defaultDate;
    }
  } catch (error) {
    console.error('Erro ao obter data do relacionamento:', error);
    throw new Error('Não foi possível obter a data do relacionamento');
  }
};

// Calcular dias de relacionamento
export const getRelationshipDays = async (): Promise<number> => {
  try {
    const startDateStr = await getRelationshipStartDate();
    const startDate = new Date(startDateStr);
    const today = new Date();
    
    // Handle the case where the start date is in the future
    if (startDate > today) {
      return 0;
    }
    
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error("Error calculating relationship days:", error);
    return 0;
  }
};

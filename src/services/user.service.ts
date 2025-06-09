import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, updateDoc, getDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  // altri campi custom che vuoi salvare
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: Firestore) {}

  // Crea o aggiorna profilo utente in Firestore
  async saveUserProfile(user: User, extraData?: Partial<UserProfile>) {
    const userRef = doc(this.firestore, `users/${user.uid}`);

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      ...extraData
    };

    // Usa setDoc con {merge:true} per creare o aggiornare senza sovrascrivere tutto
    await setDoc(userRef, userProfile, { merge: true });
  }

  // Recupera il profilo utente da Firestore
  async getUserProfile(uid: string): Promise<UserProfile | undefined> {
    const userRef = doc(this.firestore, `users/${uid}`);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return undefined;
  }

  // Aggiorna alcune info utente
  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await updateDoc(userRef, data);
  }
}

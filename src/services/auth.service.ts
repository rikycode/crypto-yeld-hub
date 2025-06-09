import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  authState,
} from '@angular/fire/auth';

import { UserService } from './user.service';  // importa UserService
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
   currentUser: User | null = null;
  user$: Observable<User | null>;

  constructor(private auth: Auth, private userService: UserService) {
    setPersistence(this.auth, browserLocalPersistence);

    // user$ è un Observable che emette lo stato utente Firebase aggiornato
    this.user$ = authState(this.auth);

    // Aggiorno currentUser a ogni cambiamento di stato
    this.user$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }
  async signUp(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    this.currentUser = userCredential.user;

    // Salva o aggiorna profilo utente su Firestore
    await this.userService.saveUserProfile(this.currentUser!);

    return this.currentUser!;
  }

  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    this.currentUser = userCredential.user;

    // Non obbligatorio, ma puoi aggiornare lastLogin o simili
    // await this.userService.saveUserProfile(this.currentUser!);

    return this.currentUser!;
  }

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);
    this.currentUser = userCredential.user;

    // Salva o aggiorna profilo utente su Firestore
    await this.userService.saveUserProfile(this.currentUser!);

    return this.currentUser!;
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUser = null;
  }

  getUser(): User | null {
    return this.auth.currentUser;
  }
}

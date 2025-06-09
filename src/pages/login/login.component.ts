import { Component } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports:[FormsModule, CommonModule, RouterModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private auth: AuthService, private router: Router) {
    
  }

  async loginEmail() {
    this.errorMessage = '';
    this.isLoading = true;
    try {
      await this.auth.signIn(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Errore durante il login';
    } finally {
      this.isLoading = false;
    }
  }

  async loginGoogle() {
    this.errorMessage = '';
    this.isLoading = true;
    try {
      await this.auth.signInWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Errore durante il login con Google';
    } finally {
      this.isLoading = false;
    }
  }

  async resetPassword() {
    if (!this.email) {
      this.errorMessage = 'Inserisci la tua email per il recupero password';
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    try {
      await this.auth.resetPassword(this.email);
      alert('Email per il recupero password inviata!');
    } catch (error: any) {
      this.errorMessage = error.message || 'Errore durante il recupero password';
    } finally {
      this.isLoading = false;
    }
  }
}

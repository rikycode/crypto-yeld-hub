import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignupComponent {
  error = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  
  constructor(private auth: AuthService, private router:Router) {
    
  }

  async signup() {
    try {
      await this.auth.signUp(this.email, this.password);
    } catch (err: any) {
      this.error = err.message;
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
}
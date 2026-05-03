import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router'; // <-- NOVO AQUI

// Importação ajustada para o novo nome de arquivo
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });

  mensagemErro = '';
  carregando = false;

  async entrar() {
    if (this.loginForm.valid) {
      this.carregando = true;
      this.mensagemErro = '';
      
      const { email, senha } = this.loginForm.value;
      
      try {
        await this.authService.login(email!, senha!);
      } catch (error: any) {
        this.mensagemErro = error.message;
      } finally {
        this.carregando = false;
      }
    }
  }
}
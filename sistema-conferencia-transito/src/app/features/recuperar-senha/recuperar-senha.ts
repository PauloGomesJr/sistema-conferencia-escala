import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth'; // Verifique se o caminho está correto

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule
  ],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.scss',
  // Se quiser, pode criar um recuperar-senha.scss copiando o estilo do login.scss
})
export class RecuperarSenhaComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  recuperarForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  mensagem = '';
  erro = false;
  carregando = false;

  async enviarLink() {
    if (this.recuperarForm.valid) {
      this.carregando = true;
      this.mensagem = '';
      this.erro = false;
      
      const email = this.recuperarForm.value.email;
      
      try {
        await this.authService.recuperarSenha(email!);
        this.mensagem = 'Pronto! Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha em instantes.';
        this.erro = false;
        this.recuperarForm.reset();
      } catch (error: any) {
        this.mensagem = error.message;
        this.erro = true;
      } finally {
        this.carregando = false;
      }
    }
  }
}
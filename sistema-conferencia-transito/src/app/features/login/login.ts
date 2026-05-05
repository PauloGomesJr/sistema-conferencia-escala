
import { Component, inject, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs'; // <-- NOVO


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
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variável para guardar a inscrição e não vazar memória
  private authSub?: Subscription; 

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });

  mensagemErro = '';
  carregando = false;

  // === CÓDIGO NOVO: Assim que a tela carregar, verifica se já tem usuário ===
  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(usuario => {
      if (usuario) {
        // O Firebase confirmou que o agente tem uma sessão ativa!
        // Redireciona imediatamente para a tela de registro
        this.router.navigate(['/registro']);
      }
    });
  }

  // Desliga a escuta quando o componente for destruído
  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
  // =========================================================================

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
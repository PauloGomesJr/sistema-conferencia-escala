import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // 'currentUser$' é um observável que fica vigiando se tem alguém logado
  currentUser$ = user(this.auth);

  async login(email: string, senha: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, senha);
      // Se a senha estiver certa, mandamos o agente para a tela de registro
      this.router.navigate(['/registro']);
    } catch (error) {
      console.error('Erro no login', error);
      throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}
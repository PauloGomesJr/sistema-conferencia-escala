import { Routes } from '@angular/router';
import { RegistroFormComponent } from './features/registro-form/registro-form';
import { RegistroListaComponent } from './features/registro-lista/registro-lista'; 
import { ConfiguracoesComponent } from './features/configuracoes/configuracoes';
import { LoginComponent } from './features/login/login';

// === NOVO: Importando o componente de recuperação ===
import { RecuperarSenhaComponent } from './features/recuperar-senha/recuperar-senha';

import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent }, 
  
  // === NOVO: Rota pública para quem esqueceu a senha (sem authGuard) ===
  { path: 'recuperar-senha', component: RecuperarSenhaComponent },

  // Rotas Privadas (protegidas pelo authGuard)
  { path: 'registro', component: RegistroFormComponent, canActivate: [authGuard] },
  { path: 'registro/:id', component: RegistroFormComponent, canActivate: [authGuard] },
  { path: 'lista', component: RegistroListaComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: ConfiguracoesComponent, canActivate: [authGuard] }
];

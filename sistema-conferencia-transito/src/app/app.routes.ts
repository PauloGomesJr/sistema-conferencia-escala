import { Routes } from '@angular/router';
import { RegistroFormComponent } from './features/registro-form/registro-form';
import { RegistroListaComponent } from './features/registro-lista/registro-lista'; // <- Adicione isso
import { ConfiguracoesComponent } from './features/configuracoes/configuracoes';
import { LoginComponent } from './features/login/login';

import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
 { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent }, 

  { path: 'registro', component: RegistroFormComponent, canActivate: [authGuard] },
  { path: 'lista', component: RegistroListaComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: ConfiguracoesComponent, canActivate: [authGuard] }
];

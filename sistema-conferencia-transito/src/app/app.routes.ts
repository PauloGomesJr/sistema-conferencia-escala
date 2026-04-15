import { Routes } from '@angular/router';
import { RegistroFormComponent } from './features/registro-form/registro-form';

export const routes: Routes = [
  { path: '', component: RegistroFormComponent }, // Rota padrão (vazia) redireciona para o form
  { path: 'registro', component: RegistroFormComponent }
];

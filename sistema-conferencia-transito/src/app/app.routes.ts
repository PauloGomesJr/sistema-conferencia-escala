import { Routes } from '@angular/router';
import { RegistroFormComponent } from './features/registro-form/registro-form';
import { RegistroListaComponent } from './features/registro-lista/registro-lista'; // <- Adicione isso

export const routes: Routes = [
  { path: '', redirectTo: 'registro', pathMatch: 'full' },
  { path: 'registro', component: RegistroFormComponent },
  { path: 'lista', component: RegistroListaComponent }
];
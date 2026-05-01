import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // O segurança olha para o Firebase e verifica se há um usuário ativo
  return authState(auth).pipe(
    map(usuarioLogado => {
      if (usuarioLogado) {
        return true; // Tem crachá, porta liberada!
      } else {
        // Não tem crachá, chuta para a tela de login
        router.navigate(['/login']); 
        return false;
      }
    })
  );
};
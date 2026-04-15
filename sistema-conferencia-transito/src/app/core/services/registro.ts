import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private readonly STORAGE_KEY = 'registros_transito_v1';

  salvar(novoRegistro: any): void {
    const registros = this.listar();
    registros.push(novoRegistro);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registros));
  }

  listar(): any[] {
    const dados = localStorage.getItem(this.STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  }
}

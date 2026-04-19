import { Injectable } from '@angular/core';
import { RegistroServico } from '../../models/registro-servico.model'; // Importe a interface

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private readonly STORAGE_KEY = 'registros_transito_v1';

  // Substitua 'any' por 'RegistroServico'
  salvar(novoRegistro: RegistroServico): void {
    const registros = this.listar();
    registros.push(novoRegistro);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registros));
  }

  // O retorno agora é um array tipado
  listar(): RegistroServico[] {
    const dados = localStorage.getItem(this.STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  }
}

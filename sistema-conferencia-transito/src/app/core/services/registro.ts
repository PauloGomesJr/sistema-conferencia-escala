import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { RegistroServico } from '../../models/registro-servico.model';

// 1. Criamos a classe do nosso Banco de Dados Local
export class AppDB extends Dexie {
  servicos!: Table<RegistroServico, string>;

  constructor() {
    super('TransitoDB');
    // Definimos a estrutura da tabela (id é a chave primária, mesAno é o índice de busca rápida)
    this.version(1).stores({
      servicos: 'id, mesAno' 
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  private db = new AppDB();

  constructor() { }

  // Agora salvar é assíncrono. Geramos um ID único e o mesAno se não existirem
  async salvar(novoRegistro: RegistroServico): Promise<void> {
    if (!novoRegistro.id) {
      novoRegistro.id = crypto.randomUUID(); // Gera um ID único e forte nativo do navegador
    }
    
    // Calcula o mesAno baseado na data (Ex: "04-2026")
    const dataObj = new Date(novoRegistro.data);
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();
    novoRegistro.mesAno = `${mes}-${ano}`;

    await this.db.servicos.put(novoRegistro);
  }

  // Lista todos os registros, já ordenados (assíncrono)
  async listar(): Promise<RegistroServico[]> {
    return await this.db.servicos.toArray();
  }

  // NOVO: Uma função preparada para buscar apenas os de um mês específico
  async listarPorMes(mesAno: string): Promise<RegistroServico[]> {
    return await this.db.servicos.where('mesAno').equals(mesAno).toArray();
  }
}
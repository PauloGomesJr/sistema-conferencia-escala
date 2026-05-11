import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router'; 
// NOVO: Importando FormsModule para ligar o seletor de meses
import { FormsModule } from '@angular/forms'; 

import { RegistroService } from '../../core/services/registro';
import { RegistroServico } from '../../models/registro-servico.model'; 

@Component({
  selector: 'app-registro-lista',
  standalone: true,
  // NOVO: Adicione o FormsModule nos imports
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, FormsModule],
  templateUrl: './registro-lista.html',
  styleUrl: './registro-lista.scss'
})
export class RegistroListaComponent implements OnInit {
  private registroService = inject(RegistroService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router); 

  servicos: RegistroServico[] = []; 
  totalHorasMes = 0;
  totalAdicionalNoturno = 0;

  // === NOVO: Variáveis para o seletor de meses ===
  mesSelecionado: string = '';
  mesesDisponiveis: { valor: string, rotulo: string }[] = [];

  ngOnInit() {
    this.gerarMesesDisponiveis();
    this.carregarDados();
  }

  // === NOVO: Gera a lista dos últimos 12 meses ===
  gerarMesesDisponiveis() {
    const dataAtual = new Date();
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    for (let i = 0; i < 12; i++) {
      const d = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      // Cria o formato MM-YYYY exigido pelo nosso banco de dados
      const mesNum = (d.getMonth() + 1).toString().padStart(2, '0');
      const ano = d.getFullYear();

      this.mesesDisponiveis.push({
        valor: `${mesNum}-${ano}`,
        rotulo: `${nomesMeses[d.getMonth()]} ${ano}`
      });
    }

    // Define o mês atual como o selecionado por padrão na abertura da tela
    this.mesSelecionado = this.mesesDisponiveis[0].valor;
  }

  // === NOVO: Atualizado para buscar apenas o mês selecionado ===
  async carregarDados() {
    try {
      // Agora chamamos o listarPorMes passando o mês do seletor
      const dadosBrutos = await this.registroService.listarPorMes(this.mesSelecionado);

      this.servicos = dadosBrutos.sort((a, b) => {
        const dataA = new Date(a.data).getTime();
        const dataB = new Date(b.data).getTime();
        return dataB - dataA; 
      });

      this.totalHorasMes = this.servicos.reduce((acc, curr) => acc + (curr.totalHoras || 0), 0);
      this.totalAdicionalNoturno = this.servicos.reduce((acc, curr) => acc + (curr.adicionalNoturno || 0), 0);
      
      this.cdr.detectChanges();
    } catch (erro) {
      console.error('ERRO GRAVE ao listar dados:', erro);
    }
  }

  // === NOVO: Recarrega a lista quando o agente muda o mês no menu ===
  aoMudarMes() {
    this.carregarDados();
  }

  imprimirCupom() {
    window.print(); 
  }

  editarServico(id: string) {
    this.router.navigate(['/registro', id]);
  }
}
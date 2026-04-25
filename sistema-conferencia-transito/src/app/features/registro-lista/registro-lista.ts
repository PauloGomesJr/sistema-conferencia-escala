import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';
import { RegistroService } from '../../core/services/registro';
import { RegistroServico } from '../../models/registro-servico.model'; // Importação

@Component({
  selector: 'app-registro-lista',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './registro-lista.html',
  styleUrl: './registro-lista.scss'
})
export class RegistroListaComponent implements OnInit {
  private registroService = inject(RegistroService);
  
  // Tipando o array
  servicos: RegistroServico[] = []; 
  totalHorasMes = 0;
  totalAdicionalNoturno = 0;

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    // 1. Busca os dados
    const dadosBrutos = this.registroService.listar();
    
    // 2. Ordena as datas: do mais recente (maior) para o mais antigo (menor)
    this.servicos = dadosBrutos.sort((a, b) => {
      const dataA = new Date(a.data).getTime();
      const dataB = new Date(b.data).getTime();
      return dataB - dataA; 
    });
    
    // 3. Calcula os totais financeiros com base na lista já carregada
    this.totalHorasMes = this.servicos.reduce((acc, curr) => acc + (curr.totalHoras || 0), 0);
    this.totalAdicionalNoturno = this.servicos.reduce((acc, curr) => acc + (curr.adicionalNoturno || 0), 0);
  }

  imprimirCupom() {
    window.print(); // Chama a tela de impressão nativa do celular/computador
  }
}

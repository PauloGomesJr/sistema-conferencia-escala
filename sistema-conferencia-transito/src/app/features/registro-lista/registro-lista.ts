import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';
// NOVO: Importação do Router para fazer o redirecionamento
import { Router } from '@angular/router'; 

import { RegistroService } from '../../core/services/registro';
import { RegistroServico } from '../../models/registro-servico.model'; 

@Component({
  selector: 'app-registro-lista',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './registro-lista.html',
  styleUrl: './registro-lista.scss'
})
export class RegistroListaComponent implements OnInit {
  private registroService = inject(RegistroService);
  private cdr = inject(ChangeDetectorRef);
  // NOVO: Injetando o Router
  private router = inject(Router); 

  // Tipando o array
  servicos: RegistroServico[] = []; 
  totalHorasMes = 0;
  totalAdicionalNoturno = 0;

  ngOnInit() {
    this.carregarDados();
  }

  async carregarDados() {
    try {
      const dadosBrutos = await this.registroService.listar();

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

  imprimirCupom() {
    window.print(); // Chama a tela de impressão nativa do celular/computador
  }

  // === NOVO: FUNÇÃO DE EDIÇÃO ===
  editarServico(id: string) {
    // Redireciona para o formulário passando o ID do serviço na URL
    this.router.navigate(['/registro', id]);
  }
}
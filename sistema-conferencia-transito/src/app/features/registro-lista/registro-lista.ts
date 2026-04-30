import { Component, OnInit, inject,ChangeDetectorRef } from '@angular/core';
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
  

  private cdr = inject(ChangeDetectorRef);
  // Tipando o array
  servicos: RegistroServico[] = []; 
  totalHorasMes = 0;
  totalAdicionalNoturno = 0;

  ngOnInit() {
    this.carregarDados();
  }

  // Adicionamos o "async" aqui
  async carregarDados() {
    try {
      console.log('1. Lista pediu os dados para o banco...');
      
      const dadosBrutos = await this.registroService.listar();
      console.log('2. O banco respondeu com:', dadosBrutos);

      this.servicos = dadosBrutos.sort((a, b) => {
        const dataA = new Date(a.data).getTime();
        const dataB = new Date(b.data).getTime();
        return dataB - dataA; 
      });

      this.totalHorasMes = this.servicos.reduce((acc, curr) => acc + (curr.totalHoras || 0), 0);
      this.totalAdicionalNoturno = this.servicos.reduce((acc, curr) => acc + (curr.adicionalNoturno || 0), 0);
      
      console.log('3. Tela pronta para renderizar os cards!');
      this.cdr.detectChanges();
    } catch (erro) {
      console.error('ERRO GRAVE ao listar dados:', erro);
    }
  }

  imprimirCupom() {
    window.print(); // Chama a tela de impressão nativa do celular/computador
  }
}

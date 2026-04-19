import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RegistroService } from '../../core/services/registro';
import { RegistroServico } from '../../models/registro-servico.model'; // Importação

@Component({
  selector: 'app-registro-lista',
  standalone: true,
  imports: [CommonModule, MatCardModule],
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
    this.servicos = this.registroService.listar();
    
    this.totalHorasMes = this.servicos.reduce((acc, curr) => acc + (curr.totalHoras || 0), 0);
    this.totalAdicionalNoturno = this.servicos.reduce((acc, curr) => acc + (curr.adicionalNoturno || 0), 0);
  }
}

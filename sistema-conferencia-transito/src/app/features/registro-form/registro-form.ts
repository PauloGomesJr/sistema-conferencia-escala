import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// === Importando o SnackBar para mensagens elegantes ===
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { RegistroServico } from '../../models/registro-servico.model';
import { CalculoHorasService } from '../../core/services/calculo-horas';
import { RegistroService } from '../../core/services/registro';

@Component({
  selector: 'app-registro-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatDatepickerModule,
    MatIconModule,     
    MatTooltipModule,   
    MatSelectModule,
    MatSnackBarModule // <-- Adicionado aos imports do componente
  ],
  templateUrl: './registro-form.html',
  styleUrl: './registro-form.scss'
})
export class RegistroFormComponent implements OnInit {
  
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private calculoService = inject(CalculoHorasService);
  private registroService = inject(RegistroService);
  private route = inject(ActivatedRoute); 
  
  // === Injetando o serviço de notificações ===
  private snackBar = inject(MatSnackBar);
  
  idEdicao: string | null = null; 

  dataMaxima = new Date();

  registroForm = this.fb.group({
    data: [new Date(), Validators.required],
    horaInicio: ['', Validators.required],
    horaFim: ['', Validators.required],
    codigoServico: ['', Validators.required],
    parceiros: this.fb.array([
      this.fb.control('') 
    ]),
    descricao: ['', Validators.required],
    observacao: ['']
  });

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.idEdicao = id;
        await this.carregarParaEdicao(id);
      }
    });
  }

  // === Função auxiliar para disparar os SnackBars ===
  private mostrarNotificacao(mensagem: string) {
    this.snackBar.open(mensagem, 'OK', {
      duration: 4000, // Desaparece sozinho após 4 segundos
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  get parceiros(): FormArray {
    return this.registroForm.get('parceiros') as FormArray;
  }

  adicionarParceiro() {
    this.parceiros.push(this.fb.control(''));
  }

  removerParceiro(index: number) {
    if (this.parceiros.length > 1) {
      this.parceiros.removeAt(index);
    }
  }

  async carregarParaEdicao(id: string) {
    try {
      const todos = await this.registroService.listar();
      const registro = todos.find(r => r.id === id);

      if (registro) {
        let parceirosParaCarregar: string[] = [];

        if (registro.parceiros && Array.isArray(registro.parceiros) && registro.parceiros.length > 0) {
          parceirosParaCarregar = registro.parceiros;
        } else if (typeof registro.parceiros === 'string') {
          parceirosParaCarregar = (registro.parceiros as string).split(',').map(p => p.trim());
        }

        if (parceirosParaCarregar.length === 0) {
          parceirosParaCarregar = ['']; 
        }

        while (this.parceiros.length < parceirosParaCarregar.length) {
          this.parceiros.push(this.fb.control(''));
        }
        while (this.parceiros.length > parceirosParaCarregar.length) {
          this.parceiros.removeAt(this.parceiros.length - 1);
        }

        this.parceiros.patchValue(parceirosParaCarregar);

        this.registroForm.patchValue({
          data: new Date(registro.data),
          horaInicio: registro.horaInicio,
          horaFim: registro.horaFim,
          codigoServico: registro.codigoServico,
          descricao: registro.descricao,
          observacao: registro.observacao
        });
      }
    } catch (error) {
      console.error('Erro ao carregar edição:', error);
      this.mostrarNotificacao('Não foi possível carregar os dados deste serviço.');
    }
  }

  async reaproveitarUltimaEscala() {
    try {
      const todosRegistros = await this.registroService.listar();
      
      if (todosRegistros.length === 0) {
        this.mostrarNotificacao('Nenhuma escala anterior encontrada para reaproveitar.');
        return;
      }

      const ultimo = todosRegistros[todosRegistros.length - 1];

      let parceirosParaCarregar: string[] = [''];
      if (ultimo.parceiros && Array.isArray(ultimo.parceiros) && ultimo.parceiros.length > 0) {
        parceirosParaCarregar = ultimo.parceiros;
      }

      while (this.parceiros.length < parceirosParaCarregar.length) {
        this.parceiros.push(this.fb.control(''));
      }
      while (this.parceiros.length > parceirosParaCarregar.length) {
        this.parceiros.removeAt(this.parceiros.length - 1);
      }

      this.parceiros.patchValue(parceirosParaCarregar);

      this.registroForm.patchValue({
        horaInicio: ultimo.horaInicio,
        horaFim: ultimo.horaFim,
        codigoServico: ultimo.codigoServico,
        descricao: ultimo.descricao,
        observacao: ultimo.observacao
      });

      this.mostrarNotificacao('Dados da última escala preenchidos!');

    } catch (error) {
      console.error('Erro ao buscar última escala:', error);
      this.mostrarNotificacao('Erro ao tentar recuperar os dados da escala anterior.');
    }
  }

  // === Suas descrições novas e atualizadas ===
  modelosDescricao = [
    'Controlar acesso e saída de veículos em bloqueios viários de eventos',
    'Organizar o trânsito e a travessia de pedestres na saída de escolas',
    'Realizar blitz de fiscalização de trânsito',
    'Executar patrulhamento viário com motocicleta',
    'Atuar como batedor em cortejos e escoltas',
    'Organizar o trânsito em eventos',
    'Fiscalizar estacionamentos e coibir retenções indevidas na via',
    'Fiscalizar o estacionamento rotativo',
    'Realizar fiscalização por videomonitoramento'
  ];

  preencherDescricao(modeloSelecionado: string) {
    this.registroForm.patchValue({ descricao: modeloSelecionado });
  }

  async salvar() {
    if (this.registroForm.valid) {
      const val = this.registroForm.value;
      
      const horasTotais = this.calculoService.calcularTotalHoras(
        val.data!, val.horaInicio!, val.horaFim!
      );
      const horasNoturnas = this.calculoService.calcularAdicionalNoturno(
        val.data!, val.horaInicio!, val.horaFim!
      );

      const listaParceiros = (val.parceiros as string[])
        .map(p => p ? p.trim() : '')
        .filter(p => p !== ''); 

      const novoRegistro: RegistroServico = {
        id: this.idEdicao ? this.idEdicao : crypto.randomUUID(),
        data: val.data!,
        horaInicio: val.horaInicio!,
        horaFim: val.horaFim!,
        codigoServico: val.codigoServico!,
        descricao: val.descricao!,
        observacao: val.observacao || '',
        parceiros: listaParceiros,
        totalHoras: horasTotais,
        adicionalNoturno: horasNoturnas
      };

      await this.registroService.salvar(novoRegistro);
      
      if (this.idEdicao) {
        this.mostrarNotificacao('Serviço atualizado com sucesso!');
        this.idEdicao = null;
        this.router.navigate(['/lista']); 
      } else {
        this.mostrarNotificacao('Serviço registrado com sucesso!');
        
        this.registroForm.reset({ data: new Date() });
        
        while (this.parceiros.length !== 0) {
          this.parceiros.removeAt(0);
        }
        this.parceiros.push(this.fb.control(''));

        Object.keys(this.registroForm.controls).forEach(key => {
          const control = this.registroForm.get(key);
          control?.setErrors(null);
          control?.markAsUntouched();
          control?.markAsPristine();
        });
      }
    }
  }
}
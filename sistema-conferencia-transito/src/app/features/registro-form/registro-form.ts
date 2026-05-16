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
    MatSelectModule
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

  // === CARREGAMENTO PARA EDIÇÃO (CORREÇÃO DEFINITIVA) ===
  async carregarParaEdicao(id: string) {
    try {
      const todos = await this.registroService.listar();
      const registro = todos.find(r => r.id === id);

      if (registro) {
        // 1. Extrai a lista de parceiros do banco com segurança
        let parceirosParaCarregar: string[] = [];

        if (registro.parceiros && Array.isArray(registro.parceiros) && registro.parceiros.length > 0) {
          parceirosParaCarregar = registro.parceiros;
        } else if (typeof registro.parceiros === 'string') {
          parceirosParaCarregar = (registro.parceiros as string).split(',').map(p => p.trim());
        }

        // Garante que se vier vazio, tenha pelo menos um campo em branco
        if (parceirosParaCarregar.length === 0) {
          parceirosParaCarregar = ['']; 
        }

        // 2. Ajusta a quantidade exata de caixinhas na tela
        while (this.parceiros.length < parceirosParaCarregar.length) {
          this.parceiros.push(this.fb.control(''));
        }
        while (this.parceiros.length > parceirosParaCarregar.length) {
          this.parceiros.removeAt(this.parceiros.length - 1);
        }

        // 3. INJETA os valores na marra. Isso obriga a tela e a memória a ficarem idênticas!
        this.parceiros.patchValue(parceirosParaCarregar);

        // 4. Injeta os demais dados
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
      alert('Não foi possível carregar os dados deste serviço.');
    }
  }

  // === REAPROVEITAR ÚLTIMA ESCALA (CORREÇÃO DEFINITIVA) ===
  async reaproveitarUltimaEscala() {
    try {
      const todosRegistros = await this.registroService.listar();
      
      if (todosRegistros.length === 0) {
        alert('Nenhuma escala anterior encontrada para reaproveitar.');
        return;
      }

      const ultimo = todosRegistros[todosRegistros.length - 1];

      // 1. Extrai os parceiros
      let parceirosParaCarregar: string[] = [''];
      if (ultimo.parceiros && Array.isArray(ultimo.parceiros) && ultimo.parceiros.length > 0) {
        parceirosParaCarregar = ultimo.parceiros;
      }

      // 2. Ajusta a quantidade exata de caixinhas
      while (this.parceiros.length < parceirosParaCarregar.length) {
        this.parceiros.push(this.fb.control(''));
      }
      while (this.parceiros.length > parceirosParaCarregar.length) {
        this.parceiros.removeAt(this.parceiros.length - 1);
      }

      // 3. Sincroniza visual e memória
      this.parceiros.patchValue(parceirosParaCarregar);

      // 4. Injeta os demais dados
      this.registroForm.patchValue({
        horaInicio: ultimo.horaInicio,
        horaFim: ultimo.horaFim,
        codigoServico: ultimo.codigoServico,
        descricao: ultimo.descricao,
        observacao: ultimo.observacao
      });

    } catch (error) {
      console.error('Erro ao buscar última escala:', error);
      alert('Erro ao tentar recuperar os dados da escala anterior.');
    }
  }

  modelosDescricao = [
    'Controlar a entrada e saída de veículos em bloqueio viário de evento',
    'Ordenamento do trânsito e de pedestres na saída de escolares',
    'Blitz',
    'Realizar o patrulhamento viário por meio de motocicleta',
    'Ordenamento do trânsito em evento',
    'Fiscalizar os estacionamentos e impedir retenção de veículos na via',
    'Fiscalização do estacionamento rotativo de veículos',
    'Fiscalização por videomonitoramento'
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

      console.log('Salvo com sucesso!', novoRegistro);
      
      if (this.idEdicao) {
        alert('Serviço atualizado com sucesso!');
        this.idEdicao = null;
        this.router.navigate(['/lista']); 
      }else {
        alert('Serviço registrado com sucesso!');
        
        this.registroForm.reset({ data: new Date() });
        
        // CORREÇÃO NO RESET DO SALVAMENTO: Limpa com segurança e deixa 1 vazia
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
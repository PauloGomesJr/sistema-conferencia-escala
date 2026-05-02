import { Component, inject } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
// NOVO: Importando FormArray
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

// NOVO: Importações para os botões de + e - no HTML
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
    MatIconModule,     // <-- NOVO
    MatTooltipModule,   // <-- NOVO
    MatSelectModule
  ],
  templateUrl: './registro-form.html',
  styleUrl: './registro-form.scss'
})
export class RegistroFormComponent {
  private fb = inject(FormBuilder);
  
  private calculoService = inject(CalculoHorasService);
  private registroService = inject(RegistroService);

  registroForm = this.fb.group({
    data: [new Date(), Validators.required],
    horaInicio: ['', Validators.required],
    horaFim: ['', Validators.required],
    codigoServico: ['', Validators.required],
    // NOVO: Trocamos o parceirosRaw por um FormArray
    parceiros: this.fb.array([
      this.fb.control('') // Inicia com o primeiro campo vazio
    ]),
    descricao: ['', Validators.required],
    observacao: ['']
  });

  // === MÉTODOS DE CONTROLE DO FORMARRAY ===
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
  // ========================================
  // === MODELOS DE DESCRIÇÃO ===
  modelosDescricao = [
    'Atuar no ordenamento de trânsito.(informar evento)',
    'Controlar a entrada e saída de veículos em bloqueio viário (informar evento)',
    'Blitz',
    'Atuar no ordenamento do trânsito e de pedestres na saída de escolares (Escola)',
    'Fiscalizar o estacionamento e impedir retenção de veículos na via (informar)',
    'Fiscalização do estacionamento rotativo de veículos',
    'Fiscalização por videomonitoramento'
  ];

  preencherDescricao(modeloSelecionado: string) {
    // Pega o texto selecionado no menu e injeta dentro do campo 'descricao'
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

      // NOVO: Trata o array de parceiros removendo espaços vazios
      const listaParceiros = (val.parceiros as string[])
        .map(p => p ? p.trim() : '')
        .filter(p => p !== ''); // Remove campos que ficaram em branco

      const novoRegistro: RegistroServico = {
        id: crypto.randomUUID(),
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
      
      // Limpa o formulário e reseta a lista de parceiros para ter apenas 1 novamente
      this.registroForm.reset({ data: new Date() });
      this.parceiros.clear();
      this.adicionarParceiro();

      alert('Serviço registrado com sucesso!');
    }
  }

  // === NOVO: REAPROVEITAR ÚLTIMA ESCALA ===
  async reaproveitarUltimaEscala() {
    try {
      // 1. Busca todos os registros salvos
      const todosRegistros = await this.registroService.listar();
      
      if (todosRegistros.length === 0) {
        alert('Nenhuma escala anterior encontrada para reaproveitar.');
        return;
      }

      // 2. Pega o último registro da lista (o mais recente adicionado)
      const ultimo = todosRegistros[todosRegistros.length - 1];

      // 3. Preenche os campos simples do formulário (mantendo a data atual)
      this.registroForm.patchValue({
        horaInicio: ultimo.horaInicio,
        horaFim: ultimo.horaFim,
        codigoServico: ultimo.codigoServico,
        descricao: ultimo.descricao,
        observacao: ultimo.observacao
      });

      // 4. Limpa os parceiros atuais e preenche com os parceiros do último serviço
      this.parceiros.clear();
      
      if (ultimo.parceiros && ultimo.parceiros.length > 0) {
        ultimo.parceiros.forEach((parceiro: string) => {
          this.parceiros.push(this.fb.control(parceiro));
        });
      } else {
        // Se o anterior não tinha parceiro, deixa um campo vazio por padrão
        this.parceiros.push(this.fb.control('')); 
      }

    } catch (error) {
      console.error('Erro ao buscar última escala:', error);
      alert('Erro ao tentar recuperar os dados da escala anterior.');
    }
  }

}
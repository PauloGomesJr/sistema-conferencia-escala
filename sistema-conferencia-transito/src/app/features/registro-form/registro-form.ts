
import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
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
export class RegistroFormComponent implements OnInit {
  
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  private calculoService = inject(CalculoHorasService);
  private registroService = inject(RegistroService);

  private route = inject(ActivatedRoute); // NOVO
  
  idEdicao: string | null = null; // Guarda o ID se estivermos editando

  ngOnInit() {
    // Fica de olho na URL para ver se chegou um ID
    this.route.paramMap.subscribe(async (params) => {
      const id = params.get('id');
      if (id) {
        this.idEdicao = id;
        await this.carregarParaEdicao(id);
      }
    });
  }
  async carregarParaEdicao(id: string) {
    try {
      const todos = await this.registroService.listar();
      const registro = todos.find(r => r.id === id);

      if (registro) {
        // 1. Preenche os campos simples
        this.registroForm.patchValue({
          data: new Date(registro.data),
          horaInicio: registro.horaInicio,
          horaFim: registro.horaFim,
          codigoServico: registro.codigoServico,
          descricao: registro.descricao,
          observacao: registro.observacao
        });

        // 2. Limpa os campos de parceiros vazios que o Angular cria por padrão
        this.parceiros.clear();

        // 3. Monta a lista de parceiros garantindo compatibilidade com registros antigos
        let parceirosParaCarregar: string[] = [];

        if (registro.parceiros && Array.isArray(registro.parceiros) && registro.parceiros.length > 0) {
          // Se for um registro novo (já em formato de lista)
          parceirosParaCarregar = registro.parceiros;
        } else if ((registro as any).parceirosRaw) {
          // Se for um registro muito antigo (salvo com vírgulas)
          parceirosParaCarregar = (registro as any).parceirosRaw.split(',').map((p: string) => p.trim());
        }

        // 4. Injeta os parceiros recuperados no formulário
        if (parceirosParaCarregar.length > 0) {
          parceirosParaCarregar.forEach(parceiro => {
            if (parceiro) {
              this.parceiros.push(this.fb.control(parceiro));
            }
          });
        } else {
          // Se realmente não tiver parceiro nenhum, deixa 1 campo em branco para ele digitar
          this.parceiros.push(this.fb.control(''));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar edição:', error);
      alert('Não foi possível carregar os dados deste serviço.');
    }
  }

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
    'Controlar a entrada e saída de veículos em bloqueio viário (informar evento)',
    'Blitz',
    'Ordenamento do trânsito e de pedestres na saída de escolares (Escola)',
    'Ordenamento do trânsito no evento.(informar evento)',
    'Fiscalizar os estacionamentos e impedir retenção de veículos na via',
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
      
      // === NOVO: FLUXO DE NAVEGAÇÃO E LIMPEZA ===
      if (this.idEdicao) {
        // Se era EDIÇÃO: Avisa e manda o usuário de volta para a lista
        alert('Serviço atualizado com sucesso!');
        this.idEdicao = null;
        
        // Substitua '/' pela rota da sua lista, se for diferente (ex: '/lista' ou '/historico')
        this.router.navigate(['/']); 
      } else {
        // Se era um NOVO registro: Avisa, limpa o formulário e fica na página
        alert('Serviço registrado com sucesso!');
        
        // 1. Reseta os valores
        this.registroForm.reset({ data: new Date() });
        this.parceiros.clear();
        this.adicionarParceiro();

        // 2. Remove o "vermelho" forçando a limpeza de erros do Angular Material
        Object.keys(this.registroForm.controls).forEach(key => {
          const control = this.registroForm.get(key);
          control?.setErrors(null);
          control?.markAsUntouched();
          control?.markAsPristine();
        });
      }
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
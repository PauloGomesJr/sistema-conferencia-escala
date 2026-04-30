import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { RegistroServico } from '../../models/registro-servico.model';

// Importe os serviços que criamos/vamos criar
// Remova o '.service' e deixe apenas o nome do arquivo conforme está na pasta
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
    MatDatepickerModule
  ],
  templateUrl: './registro-form.html',
  styleUrl: './registro-form.scss'
})
export class RegistroFormComponent {
  private fb = inject(FormBuilder);
  
  // Injetando os serviços de lógica e persistência
  private calculoService = inject(CalculoHorasService);
  private registroService = inject(RegistroService);

  registroForm = this.fb.group({
    data: [new Date(), Validators.required],
    horaInicio: ['', Validators.required],
    horaFim: ['', Validators.required],
    codigoServico: ['', Validators.required],
    parceirosRaw: [''],
    descricao: ['', Validators.required],
    observacao: ['']
  });

  async salvar() {
    if (this.registroForm.valid) {
      // 1. Recupera os valores do formulário (O 'val' que estava faltando!)
      const val = this.registroForm.value;
      
      // 2. Refaz os cálculos que haviam sido apagados
      const horasTotais = this.calculoService.calcularTotalHoras(
        val.data!, val.horaInicio!, val.horaFim!
      );
      const horasNoturnas = this.calculoService.calcularAdicionalNoturno(
        val.data!, val.horaInicio!, val.horaFim!
      );

      // 3. Monta o objeto com a tipagem forte
      const novoRegistro: RegistroServico = {
        id: crypto.randomUUID(),
        data: val.data!,
        horaInicio: val.horaInicio!,
        horaFim: val.horaFim!,
        codigoServico: val.codigoServico!,
        descricao: val.descricao!,
        observacao: val.observacao || '',
        parceiros: val.parceirosRaw ? val.parceirosRaw.split(',').map(n => n.trim()) : [],
        totalHoras: horasTotais,
        adicionalNoturno: horasNoturnas
      };

      // 4. Salva e limpa
     await this.registroService.salvar(novoRegistro);

      console.log('Salvo com sucesso!', novoRegistro);
      this.registroForm.reset({ data: new Date() });
      alert('Serviço registrado com sucesso!');
    }
  }
}
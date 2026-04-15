import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

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

  salvar() {
    if (this.registroForm.valid) {
      const val = this.registroForm.value;
      
      // 1. Cálculos Automáticos usando o Service
      const horasTotais = this.calculoService.calcularTotalHoras(
        val.data!, val.horaInicio!, val.horaFim!
      );
      const horasNoturnas = this.calculoService.calcularAdicionalNoturno(
        val.data!, val.horaInicio!, val.horaFim!
      );

      // 2. Montagem do Objeto Final
      const novoRegistro = {
        ...val,
        id: crypto.randomUUID(), // Gera um ID único simples
        parceiros: val.parceirosRaw ? val.parceirosRaw.split(',').map(n => n.trim()) : [],
        totalHoras: horasTotais,
        adicionalNoturno: horasNoturnas
      };

      // 3. Persistência no LocalStorage (via Service)
      this.registroService.salvar(novoRegistro);

      console.log('Salvo com sucesso!', novoRegistro);
      
      // 4. Limpar o formulário para o próximo uso
      this.registroForm.reset({ data: new Date() });
      alert('Serviço registrado com sucesso!');
    }
  }
}
import { Injectable } from '@angular/core';

const FATOR_HORA_REDUZIDA = 1.142857;

@Injectable({ providedIn: 'root' })
export class CalculoHorasService {

  // Calcula total de horas entre duas strings "HH:mm"
  calcularTotalHoras(data: Date, inicio: string, fim: string): number {
    const start = this.gerarData(data, inicio);
    let end = this.gerarData(data, fim);

    if (end < start) {
      end.setDate(end.getDate() + 1); // Tratamento para virada de dia
    }

    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  // Calcula Adicional Noturno (22:00 às 05:00)
  calcularAdicionalNoturno(data: Date, inicio: string, fim: string): number {
  const start = this.gerarData(data, inicio);
  let end = this.gerarData(data, fim);

  if (end < start) end.setDate(end.getDate() + 1);

  let minutosNoturnosReais = 0;
  let temp = new Date(start);

  while (temp < end) {
    const hora = temp.getHours();
    // Faixa noturna: 22h às 05h
    if (hora >= 22 || hora < 5) {
      minutosNoturnosReais++;
    }
    temp.setMinutes(temp.getMinutes() + 1);
  }

  // Aqui aplicamos a redução contábil
  const horasNoturnasReais = minutosNoturnosReais / 60;
  return horasNoturnasReais * FATOR_HORA_REDUZIDA;
}

  private gerarData(base: Date, hora: string): Date {
    const [h, m] = hora.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
  }
}
import { Injectable } from '@angular/core';

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

    let minutosNoturnos = 0;
    let temp = new Date(start);

    // Percorre minuto a minuto (abordagem simples e precisa)
    while (temp < end) {
      const hora = temp.getHours();
      if (hora >= 22 || hora < 5) {
        minutosNoturnos++;
      }
      temp.setMinutes(temp.getMinutes() + 1);
    }

    return minutosNoturnos / 60;
  }

  private gerarData(base: Date, hora: string): Date {
    const [h, m] = hora.split(':').map(Number);
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
  }
}
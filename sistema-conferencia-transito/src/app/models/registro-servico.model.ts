export interface RegistroServico {
  id?: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  codigoServico: string;
  parceiros: string[]; // Mudança aqui: de parceiro para parceiros (array)
  descricao: string;
  observacao?: string;
  totalHoras?: number;
  adicionalNoturno?: number;
}
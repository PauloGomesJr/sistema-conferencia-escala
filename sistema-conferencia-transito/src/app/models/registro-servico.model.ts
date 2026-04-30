export interface RegistroServico {
  id?: string;
  data: Date | string; // Permitiremos string também, pois o formulário às vezes envia string
  horaInicio: string;
  horaFim: string;
  codigoServico: string;
  parceiros: string[]; 
  descricao: string;
  observacao?: string;
  totalHoras?: number;
  adicionalNoturno?: number;
  mesAno?: string; // NOVO: Campo para agrupar e buscar as escalas do mês facilmente
}
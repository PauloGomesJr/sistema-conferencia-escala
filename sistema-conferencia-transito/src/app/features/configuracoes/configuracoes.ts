import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RegistroService } from '../../core/services/registro';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss'
})
export class ConfiguracoesComponent {
  private registroService = inject(RegistroService);

  // === EXPORTAR DADOS ===
  async exportarBackup() {
    try {
      const todosRegistros = await this.registroService.listar();
      
      // 1. Transforma os dados em uma string JSON formatada
      const dataStr = JSON.stringify(todosRegistros, null, 2);
      
      // 2. Cria um "arquivo virtual" no navegador
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 3. Simula um clique para forçar o download
      const a = document.createElement('a');
      a.href = url;
      
      // O nome do arquivo terá a data atual para organização
      const dataHoje = new Date().toISOString().split('T')[0];
      a.download = `backup_escala_${dataHoje}.json`;
      
      a.click();
      URL.revokeObjectURL(url); // Limpa a memória
      alert('Backup exportado com sucesso! Guarde este arquivo em segurança.');
    } catch (error) {
      console.error('Erro ao exportar', error);
      alert('Erro ao gerar o arquivo de backup.');
    }
  }

  // === IMPORTAR DADOS ===
  importarBackup(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    // O que acontece quando o arquivo terminar de ser lido
    reader.onload = async (e) => {
      try {
        const conteudo = e.target?.result as string;
        const dadosRestaurados = JSON.parse(conteudo);
        
        if (!Array.isArray(dadosRestaurados)) {
          throw new Error('Formato de arquivo inválido.');
        }

        // Confirmação dupla para não sobrescrever sem querer
        if (confirm(`Encontrados ${dadosRestaurados.length} registros no backup. Deseja restaurar? Isso NÃO apagará os atuais, apenas adicionará.`)) {
          
          for (const servico of dadosRestaurados) {
            // Re-salva cada serviço (se o ID já existir, o Dexie atualiza; se não, ele cria)
            await this.registroService.salvar(servico);
          }
          
          alert('Backup restaurado com sucesso!');
        }
      } catch (error) {
        console.error('Erro na leitura', error);
        alert('O arquivo selecionado não é um backup válido.');
      }
    };

    // Inicia a leitura do arquivo
    reader.readAsText(file);
  }
}

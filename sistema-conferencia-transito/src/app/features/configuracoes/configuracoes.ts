import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RegistroService } from '../../core/services/registro';
// NOVO: Importando o serviço de autenticação
import { AuthService } from '../../core/services/auth'; 

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss'
})
export class ConfiguracoesComponent {
  private registroService = inject(RegistroService);
  // NOVO: Injetando o AuthService
  private authService = inject(AuthService); 

  // === EXPORTAR DADOS === (Mantido intacto)
  async exportarBackup() {
    try {
      const todosRegistros = await this.registroService.listar();
      
      const dataStr = JSON.stringify(todosRegistros, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      
      const dataHoje = new Date().toISOString().split('T')[0];
      a.download = `backup_escala_${dataHoje}.json`;
      
      a.click();
      URL.revokeObjectURL(url); 
      alert('Backup exportado com sucesso! Guarde este arquivo em segurança.');
    } catch (error) {
      console.error('Erro ao exportar', error);
      alert('Erro ao gerar o arquivo de backup.');
    }
  }

  // === IMPORTAR DADOS === (Mantido intacto)
  importarBackup(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const conteudo = e.target?.result as string;
        const dadosRestaurados = JSON.parse(conteudo);
        
        if (!Array.isArray(dadosRestaurados)) {
          throw new Error('Formato de arquivo inválido.');
        }

        if (confirm(`Encontrados ${dadosRestaurados.length} registros no backup. Deseja restaurar? Isso NÃO apagará os atuais, apenas adicionará.`)) {
          
          for (const servico of dadosRestaurados) {
            await this.registroService.salvar(servico);
          }
          
          alert('Backup restaurado com sucesso!');
        }
      } catch (error) {
        console.error('Erro na leitura', error);
        alert('O arquivo selecionado não é um backup válido.');
      }
    };

    reader.readAsText(file);
  }

  // === NOVO: SAIR DO SISTEMA ===
  async sairDoSistema() {
    try {
      await this.authService.logout();
      // O logout() do serviço já redireciona para a tela de login
    } catch (error) {
      console.error('Erro ao sair:', error);
      alert('Erro ao tentar sair do sistema.');
    }
  }
}
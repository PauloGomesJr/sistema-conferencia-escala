<div align="center">

# 🚦 Sistema de Conferência de Escala — Trânsito

**Aplicação web progressiva (PWA) para registro, controle e conferência de escalas de serviço de agentes de trânsito.**

[![Angular](https://img.shields.io/badge/Angular-21.x-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-21.x-009688?style=for-the-badge&logo=material-design&logoColor=white)](https://material.angular.io)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## 📋 Sobre o Projeto

O **Sistema de Conferência de Escala** é uma aplicação web voltada para **Agentes de Gestão de Trânsito (AGTs)**, desenvolvida para eliminar o uso de planilhas manuais e cadernos no controle de jornadas de trabalho.

A aplicação permite que o agente registre cada serviço prestado — com data, horários, código de serviço, parceiros e descrição da atividade — e obtém automaticamente o **total de horas trabalhadas** e o **adicional noturno** conforme a legislação trabalhista vigente. Ao final do mês, o relatório completo pode ser visualizado, impresso e exportado.

Por funcionar como um **PWA**, o sistema pode ser instalado diretamente no celular do agente (Android/iOS) e opera sem depender de acesso à internet para as funcionalidades principais.

---

## ✨ Funcionalidades

### 📝 Registro de Serviços
- Cadastro completo de cada escala: data, hora de início, hora de fim, código do serviço, parceiro(s) e descrição.
- Seleção de **descrições pré-definidas** por modelo para agilizar o preenchimento.
- Suporte a **horas excedentes/excepcionais** com período separado (início e fim).
- Reaproveitar dados da **última escala** com um clique, acelerando registros repetitivos.
- Edição de registros existentes diretamente pela lista.

### 📊 Cálculo Automático de Horas
- Cálculo preciso de **total de horas** entre horário de início e fim, com suporte a **virada de dia** (ex: 23h às 06h).
- Cálculo do **Adicional Noturno** (faixa das 22h às 05h) com aplicação do fator de hora reduzida (`1,142857`), conforme norma CLT.
- Os mesmos cálculos são aplicados às horas excedentes de forma independente.

### 📅 Visualização por Mês
- Listagem de todos os registros **filtrada por mês**, com seletor dos últimos 12 meses.
- **Totalização automática** de horas regulares e adicional noturno por período.
- Opção de **incluir ou excluir horas excedentes** da soma mensal, a critério do agente.
- Ordenação cronológica decrescente para rápida consulta dos serviços mais recentes.

### 🖨️ Impressão de Relatório
- Geração de **relatório imprimível** diretamente pelo navegador com layout otimizado para impressão (cupom/folha A4).

### 💾 Backup e Restauração
- **Exportação** de todos os dados em arquivo JSON, com nome contendo a data do backup.
- **Importação** de backups anteriores sem apagar os registros existentes.

### 🔐 Autenticação Segura
- Login com **e-mail e senha** via Firebase Authentication.
- **Recuperação de senha** por e-mail, integrada em português (pt-BR).
- Todas as rotas do sistema são protegidas por `authGuard`, bloqueando acesso não autenticado.
- Suporte a **logout** com redirecionamento imediato para a tela de login.

### 📱 Progressive Web App (PWA)
- **Instalável** no dispositivo móvel ou desktop como aplicativo nativo.
- Funciona com recursos de **Service Worker** para melhor performance e disponibilidade offline.

---

## 🏗️ Arquitetura e Tecnologias

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth-guard.ts          # Proteção de rotas autenticadas
│   │   └── services/
│   │       ├── auth.ts                # Autenticação via Firebase
│   │       ├── calculo-horas.ts       # Regras de negócio: horas e adicional noturno
│   │       └── registro.ts            # CRUD local via Dexie (IndexedDB)
│   ├── features/
│   │   ├── login/                     # Tela de autenticação
│   │   ├── recuperar-senha/           # Fluxo de recuperação de acesso
│   │   ├── registro-form/             # Formulário de cadastro/edição de escala
│   │   ├── registro-lista/            # Listagem, totalização e impressão
│   │   └── configuracoes/             # Backup, restauração e logout
│   └── models/
│       └── registro-servico.model.ts  # Interface principal de dados
└── environments/
    └── environment.ts                 # Configuração do Firebase
```

### Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Angular 21 (Standalone Components) |
| UI | Angular Material 21 + Angular CDK |
| Autenticação | Firebase Authentication via AngularFire 20 |
| Persistência local | Dexie 4 (IndexedDB) |
| Testes | Vitest 4 |
| Estilização | SCSS + Prettier |
| Implantação | Vercel / qualquer host estático |

### Decisões de Arquitetura

- **IndexedDB com Dexie**: Todos os registros de serviço ficam armazenados localmente no dispositivo do usuário, garantindo privacidade, velocidade e funcionamento sem internet. O campo `mesAno` é indexado para filtros mensais performáticos.
- **Firebase apenas para autenticação**: A camada de auth é centralizada e segura, sem custo de banco de dados em nuvem.
- **Standalone Components**: Adota o modelo moderno do Angular 17+, sem `NgModule`, com injeção de dependência via `inject()`.
- **Cálculo noturno minuto a minuto**: O `CalculoHorasService` itera minuto a minuto para identificar com precisão o período noturno (22h–05h) e aplica o fator de redução contábil da legislação trabalhista.

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20 ou superior
- [npm](https://www.npmjs.com/) v11 ou superior
- Angular CLI (`npm install -g @angular/cli`)
- Projeto configurado no [Firebase Console](https://console.firebase.google.com/) com **Authentication** habilitado (método e-mail/senha)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/PauloGomesJr/sistema-conferencia-escala.git
cd sistema-conferencia-escala/sistema-conferencia-transito

# 2. Instale as dependências
npm install

# 3. Configure o Firebase
# Edite o arquivo src/environments/environment.ts com as credenciais do seu projeto Firebase:
# apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId

# 4. Inicie o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:4200`.

### Scripts Disponíveis

```bash
npm start          # Servidor de desenvolvimento
npm run build      # Build de produção
npm run watch      # Build em modo watch (desenvolvimento)
npm test           # Executa os testes com Vitest
```

---

## ☁️ Deploy

O projeto inclui um arquivo `vercel.json` pré-configurado para implantação no [Vercel](https://vercel.com).

```bash
# Build de produção
npm run build

# Os arquivos gerados em dist/ podem ser publicados em qualquer
# servidor de arquivos estáticos: Vercel, Netlify, Firebase Hosting, etc.
```

> **Importante**: em produção, substitua o arquivo `environment.ts` pelas variáveis de ambiente correspondentes ao projeto Firebase de produção.

---

## 🧪 Testes

O projeto utiliza **Vitest** como test runner. Todos os serviços e guards principais possuem arquivos de spec correspondentes.

```bash
npm test
```

Cobertura atual dos testes:

- `AuthService` — fluxo de login, logout e recuperação de senha
- `CalculoHorasService` — cálculo de horas totais e adicional noturno
- `RegistroService` — CRUD no banco local IndexedDB
- `authGuard` — proteção de rotas autenticadas

---

## 📸 Fluxo da Aplicação

```
[Login] ──── autenticado ───▶ [Registro de Serviço] ──▶ [Lista Mensal]
   │                                  ▲                       │
   │                                  └─── reaproveitar ──────┘
   └─ não autenticado ◀── authGuard ◀── qualquer rota privada

[Configurações] → Exportar backup / Importar backup / Sair
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para propor melhorias:

1. Faça um fork do repositório
2. Crie uma branch com a sua feature: `git checkout -b feature/minha-melhoria`
3. Faça commit das alterações: `git commit -m 'feat: adiciona minha melhoria'`
4. Envie para o repositório remoto: `git push origin feature/minha-melhoria`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é de uso privado, desenvolvido para atender às necessidades operacionais de Agentes de Gestão de Trânsito. Para uso ou adaptação, entre em contato com o autor.

---

<div align="center">

Desenvolvido com ❤️ por **Paulo Gomes Jr.**

</div>

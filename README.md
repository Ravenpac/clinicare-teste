# CliniCare Pro — Sistema de Gestão de Consultório Médico

Aplicação web de alta performance e acessibilidade para recepção e gestão operacional de consultórios médicos com múltiplos profissionais, desenvolvida em **React 18 + TypeScript + Bootstrap 5**.

---

## 🚀 Como Executar o Projeto

O projeto está pronto para ser executado com os comandos padrão:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm start
# ou
npm run dev
```

Acesse a aplicação em `http://localhost:3000`.

---

## 🏥 Funcionalidades Principais (100% em pt-BR)

### 1. Área de Trabalho (Dashboard Gerencial)

- **Indicadores Chave do Dia (StatCards)**:
  - Total de agendamentos com contagem de pacientes em espera.
  - Taxa de atendimento (% de conclusão em tempo real).
  - Faturamento do dia discriminado (recebido vs pendente).
  - Profissionais ativos e taxa de ocupação da clínica.
- **Agenda do Dia**: Lista cronológica de atendimentos de hoje com ações rápidas de recepção: **Check-in**, **Chamar para Atendimento**, **Concluir** e **Ver Detalhes**.
- **Quadro de Avisos & Lembretes**: Avisos da clínica classificados por prioridade (_Urgente_, _Importante_, _Informativo_) com formulário para cadastro de novos comunicados.

### 2. Agendamento de Consultas (Agenda Inteligente)

- **Visualizações Flexíveis**:
  - **Visão Diária**: Grade horária de 30 em 30 minutos (08:00 às 18:30) com múltiplos médicos lado a lado e clique direto em horários vagos.
  - **Visão Semanal**: Visão panorâmica dos dias da semana (Segunda a Sábado) com contadores de consultas.
  - **Visão em Lista / Timeline**: Visualização adaptada para telas móveis e tablets.
- **Prevenção de Conflitos (Anti Double-Booking)**: Algoritmo de verificação de sobreposição de horário por médico e validação contra bloqueios de agenda em tempo real.
- **Assistente de Agendamento em 3 Etapas**:
  1. _Consulta_: Médico, data, horário e tipo de consulta.
  2. _Paciente_: Busca rápida de paciente cadastrado ou novo cadastro com **validação matemática de CPF (Módulo 11)**, cálculo automático de idade e endereço completo.
  3. _Pagamento_: Valor da consulta em R$, forma de pagamento (PIX, Cartão, Dinheiro, Convênio) e status (Pago, Pendente, Faturado).
- **Transferência de Consulta**: Reatribuição de profissional, data e horário com revalidação de conflitos.
- **Bloqueio de Horário**: Bloqueio de intervalos de médicos (Almoço, Congresso, Cirurgia, etc.).

### 3. Consulta & Histórico de Agendamentos (Lookup & Financeiro)

- **Barra de Busca Global**: Busca instantânea por Nome do Paciente, CPF, Telefone ou Médico.
- **Filtros Avançados**: Período (Hoje, Semana, Mês, Intervalo personalizado de datas), Status da Consulta, Status do Pagamento e Médico.
- **Tabela de Dados Acessível**: Ordenação por colunas (Data, Paciente, Médico, Valor, Status) e paginação.
- **Ficha do Paciente / Detalhes 360°**: Modal com histórico clínico, dados de contato com link direto para WhatsApp, recibo e comprovante financeiro.
- **Edição de Faturamento**: Quitação de consultas pendentes e emissão simulada de recibos.
- **Cancelamento Seguro**: Modal de confirmação com justificativa obrigatória para auditoria.

### 4. Diretório de Pacientes

- Busca por nome, CPF e telefone.
- Cadastro e edição de pacientes com validações completas brasileiras.

### 5. Tema Claro / Escuro

- **Alternância instantânea**: botão de sol/lua no cabeçalho (desktop) e no menu gaveta (mobile).
- **Detecção automática**: na primeira visita, o tema segue a preferência do sistema (`prefers-color-scheme`).
- **Persistência**: a escolha fica salva em `localStorage` (chave `clinicare_theme`) e é aplicada antes da primeira pintura via script inline no `index.html` — sem "flash" de tema errado.
- **Paleta neutra estilo Discord**: superfícies e fundos em cinzas neutros (`#313338`, `#383a40`, `#2b2d31`, `#1e1f22`) com `color-scheme: dark` para controles nativos (scrollbars, selects, checkboxes), acentos sutis no lugar dos tons de azul-escuro.
- Implementação via `data-bs-theme="dark"` (dark mode nativo do Bootstrap 5.3) + variáveis CSS customizadas em `src/styles/dark-mode.css` e contexto `ThemeContext` (`src/context/ThemeContext.tsx`).

---

## ♿ Acessibilidade (WCAG 2.1 AA)

- **Semântica HTML5**: Uso estrito de `<main id="main-content">`, `<header>`, `<nav>`, `<aside>`, `<section>`, `<button>` e `<th scope="col">`.
- **Link de Salto (_Skip Link_)**: Permite que usuários de teclado pulem diretamente para o conteúdo principal.
- **Focus Management & Focus Trapping**: Modais e drawers aprisionam o foco durante a navegação via `Tab`/`Shift+Tab`, fecham com tecla `Escape` e devolvem o foco ao elemento disparador ao fechar.
- **Formulários e ARIA**: Todos os inputs conectados a `<label htmlFor="...">`, atributos `aria-required`, `aria-invalid` e mensagens de erro vinculadas via `aria-describedby` e lidas pelo leitor de tela.
- **Regiões Vivas (ARIA Live Regions)**: Notificações (Toasts) utilizam `aria-live="polite"` e `aria-live="assertive"`.
- **Contraste de Cores**: Relação de contraste de texto e componentes acima de 4.5:1, sem depender exclusivamente da cor para expressar status (combinação de ícone + texto explícito + cor).

---

## 📱 Estratégia de Responsividade

| Dispositivo | Largura        | Adaptação na Interface                                                                                                                                                                         |
| ----------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Desktop** | ≥ 1200px       | Sidebar persistente, grid de 4 colunas de métricas, agenda com médicos lado a lado e tabela de dados completa.                                                                                 |
| **Tablet**  | 768px a 1199px | Sidebar colapsada, dashboard em grid de 2 colunas, agenda com rolagem horizontal suave e tabela prioritária.                                                                                   |
| **Mobile**  | < 768px        | Menu gaveta (_Offcanvas_ acessível), dashboard em coluna única, agenda convertida automaticamente em timeline vertical e tabela refatorada em cards responsivos com botões de toque adequados. |

---

## 💡 Sugestões de Melhorias de Negócio (Roadmap)

1. **Lembretes e Confirmações Automáticas via WhatsApp/SMS**: Integração com API (ex: Z-API / Twilio) para envio automático 24h e 2h antes da consulta com botões de resposta "Confirmar" ou "Remarcar", reduzindo o índice de no-show em até 35%.
2. **Lista de Espera Inteligente (Encaixes)**: Em caso de cancelamento de uma consulta, o sistema sugere instantaneamente pacientes da lista de espera com o mesmo perfil/médico para preencher a vaga ociosa.
3. **Prontuário Eletrônico & Prescrição Digital**: Conexão do agendamento com histórico de anamnese, evolução médica, atestados e receitas médicas com assinatura digital certificada ICP-Brasil.
4. **Suporte a Múltiplas Unidades / Salas**: Gestão compartilhada de salas de atendimento entre filiais da clínica.
5. **Painel de Chamada em TV / Totem de Autoatendimento**: Painel de chamada visual e sonoro para a sala de espera integrado ao fluxo de check-in da recepção.

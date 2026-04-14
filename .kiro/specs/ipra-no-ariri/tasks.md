# Plano de Implementação: IPRA no Ariri

## Visão Geral

Implementação incremental do app IPRA no Ariri — uma SPA offline-first com backend Flask + SQLite e frontend HTML/CSS/JS vanilla. As tarefas seguem a ordem: estrutura base → backend (modelos e rotas) → frontend (roteamento, páginas, IndexedDB, sincronização) → integração final. O usuário já possui um MVP visual e fornecerá screenshots para reprodução fiel do design.

## Tarefas

- [x] 1. Estrutura do projeto e configuração do backend
  - [x] 1.1 Criar estrutura de diretórios e arquivos base
    - Criar `ariri-app/backend/`, `ariri-app/frontend/`, `ariri-app/frontend/css/`, `ariri-app/frontend/js/`, `ariri-app/frontend/js/pages/`, `ariri-app/frontend/assets/`, `ariri-app/backend/routes/`, `ariri-app/backend/uploads/`
    - Criar `ariri-app/requirements.txt` com Flask, Flask-CORS, Flask-SQLAlchemy
    - _Requisitos: 16.1, 16.2, 16.3_

  - [x] 1.2 Implementar `app.py` — aplicação Flask principal
    - Inicializar Flask, configurar SQLAlchemy com SQLite, habilitar CORS
    - Registrar blueprints de rotas (forms, posts, volunteers, sync, schedule, receipts, ping)
    - Configurar Flask para servir arquivos estáticos do frontend
    - Definir rota catch-all que retorna `index.html` para suportar SPA
    - _Requisitos: 16.1, 16.2, 16.3_

  - [x] 1.3 Implementar `models.py` — modelos SQLAlchemy
    - Criar modelos `Form`, `Post`, `Receipt` e `Volunteer` conforme especificado no design
    - Incluir campos JSON para `actions` no modelo `Form`
    - Garantir que IDs de Form, Post e Receipt são String(36) para UUIDs
    - _Requisitos: 5.5, 7.4, 8.5, 9.5_

- [x] 2. Rotas da API REST (Backend)
  - [x] 2.1 Implementar rota `/api/ping` (GET)
    - Retornar `{ "status": "ok" }` para health check
    - _Requisitos: 12.4_

  - [x] 2.2 Implementar rotas `/api/forms` (POST e GET)
    - POST: receber formulário com campos (volunteer_name, actions, full_name, age, locality, description, image) e salvar no banco
    - GET: listar todos os formulários ordenados por created_at
    - Tratar upload de imagem salvando em `uploads/`
    - _Requisitos: 5.4, 5.5_

  - [x] 2.3 Implementar rotas `/api/posts` (POST e GET)
    - POST: receber postagem com campos (volunteer_name, title, description, image) e salvar
    - GET: listar postagens ordenadas por created_at decrescente
    - _Requisitos: 7.3, 7.4_

  - [x] 2.4 Implementar rotas `/api/receipts` (POST e GET)
    - POST: receber comprovante com campos (title, description, image) e salvar
    - GET: listar comprovantes
    - _Requisitos: 8.4, 8.5_

  - [x] 2.5 Implementar rotas `/api/volunteers` (GET) e `/api/volunteers/<id>` (GET)
    - GET lista: retornar lista de voluntários com nome e foto de perfil
    - GET perfil: retornar perfil completo com todos os campos
    - _Requisitos: 9.3, 9.4, 9.5_

  - [x] 2.6 Implementar rota `/api/schedule` (GET)
    - Ler e retornar dados do `schedule_data.json`
    - Tratar caso de arquivo ausente retornando JSON vazio com aviso
    - _Requisitos: 4.3, 4.4_

  - [x] 2.7 Implementar rota `/api/sync` (POST) — sincronização em lote
    - Receber array de itens com campos (id, type, data, created_at)
    - Processar cada item conforme seu type (form, post, receipt)
    - Retornar lista de IDs sincronizados e erros
    - Tratar IDs duplicados (itens já existentes) sem erro
    - _Requisitos: 12.5_

  - [x] 2.8 Criar `schedule_data.json` com dados de exemplo
    - Estrutura com 4 dias (Sábado a Terça), cada um com cronograma, cardápio e materiais
    - _Requisitos: 4.3_

  - [ ]* 2.9 Escrever testes unitários do backend (pytest)
    - Testar cada endpoint (POST/GET) com dados válidos e inválidos
    - Testar endpoint `/api/sync` com batch de itens
    - Testar tratamento de erros (400, 404, 500)
    - Testar servir arquivos estáticos e rota catch-all
    - _Requisitos: 5.5, 7.4, 8.5, 9.5, 12.4, 12.5_

- [x] 3. Checkpoint — Verificar backend
  - Garantir que todos os testes passam e que o servidor Flask inicia corretamente. Perguntar ao usuário se há dúvidas.

- [ ] 4. Frontend — Estrutura base e roteamento SPA
  - [x] 4.1 Criar `index.html` com estrutura base
    - Incluir meta viewport para mobile-first
    - Incluir link para `css/style.css` e scripts JS
    - Criar container principal `<div id="app">` e Bottom Navigation Bar com 4 ícones (Informações, Formulários, Diário, Menu)
    - Todos os recursos (fontes, ícones) devem ser locais (sem CDN)
    - _Requisitos: 3.1, 14.1, 14.2, 14.3, 15.1, 15.2, 16.2_

  - [x] 4.2 Criar `css/style.css` com estilos base
    - Paleta de cores: verde escuro (#1a4731) e creme (#faf6ee)
    - Tipografia sans-serif, design minimalista mobile-first (390px)
    - Estilos da Bottom Navigation Bar com destaque do ícone ativo
    - Estilos do indicador de conectividade (online/pendente/offline)
    - _Requisitos: 3.3, 14.1, 14.2, 14.3, 15.1_

  - [x] 4.3 Implementar `js/app.js` — roteador SPA
    - Hash-based routing com mapeamento de rotas para funções de renderização
    - Gerenciar destaque do ícone ativo na Bottom Navigation Bar
    - Suportar rotas com parâmetros (`:day`, `:id`)
    - Listener em `hashchange` para navegação sem reload
    - _Requisitos: 3.2, 3.3, 15.2_

- [ ] 5. Frontend — IndexedDB e Sincronização
  - [~] 5.1 Implementar `js/db.js` — helper IndexedDB
    - Criar/abrir banco com 3 stores: `pending_forms`, `pending_posts`, `pending_receipts`
    - Implementar métodos: `init()`, `addPending(store, item)`, `getPending(store)`, `markSynced(store, id)`, `clearSynced(store)`
    - Cada registro deve conter: id (UUID), type, data, created_at (ISO 8601), synced (false)
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

  - [~] 5.2 Implementar `js/sync.js` — lógica de sincronização
    - Polling a cada 30 segundos via `GET /api/ping`
    - Ao detectar servidor acessível, buscar itens pendentes e enviar em ordem cronológica (created_at)
    - Marcar itens como `synced=true` após envio bem-sucedido
    - Gerenciar URL base do servidor (localStorage `server_url`)
    - Atualizar indicador visual de conectividade (online/pendente/offline)
    - _Requisitos: 12.1, 12.2, 12.3, 17.1_

  - [ ]* 5.3 Escrever teste de propriedade — Persistência offline no IndexedDB
    - **Propriedade 10: Persistência offline no IndexedDB**
    - Para qualquer item válido (formulário, postagem ou comprovante), ao salvar em modo offline, o registro no IndexedDB deve conter: id (UUID v4 válido), type correspondente, data com todos os campos, created_at como ISO 8601, e synced=false
    - **Valida: Requisitos 11.1, 11.2, 11.3**

  - [ ]* 5.4 Escrever teste de propriedade — Sincronização em ordem cronológica
    - **Propriedade 11: Sincronização em ordem cronológica**
    - Para qualquer conjunto de itens pendentes com timestamps variados, a ordem de envio deve ser crescente por created_at
    - **Valida: Requisitos 12.2**

  - [ ]* 5.5 Escrever teste de propriedade — Marcação de synced após envio
    - **Propriedade 12: Marcação de synced após envio bem-sucedido**
    - Para qualquer item pendente, após sincronização bem-sucedida, o campo synced deve ser atualizado para true
    - **Valida: Requisitos 12.3**

- [ ] 6. Frontend — Splash Screen e Identificação do Voluntário
  - [~] 6.1 Implementar `js/pages/splash.js` — Splash Screen
    - Exibir logo "IPRA no Ariri" centralizado sobre fundo creme (#faf6ee) com elementos em verde escuro (#1a4731)
    - Exibir versículo "Ide ao mundo, pregai o evangelho a toda criatura." — Marcos 16:15
    - Ao tocar/clicar em qualquer área, navegar para `#/info`
    - _Requisitos: 1.1, 1.2, 1.3_

  - [~] 6.2 Implementar tela de identificação do voluntário
    - Se não há `volunteer_name` no localStorage, exibir tela de seleção/digitação de nome
    - Salvar nome no localStorage ao confirmar
    - _Requisitos: 2.1, 2.2_

  - [ ]* 6.3 Escrever teste de propriedade — Round-trip de localStorage
    - **Propriedade 1: Round-trip de localStorage**
    - Para qualquer string de nome válida e URL de servidor válida, salvar e ler de volta deve retornar exatamente o mesmo valor
    - **Valida: Requisitos 2.2, 17.1**

  - [ ]* 6.4 Escrever teste de propriedade — Nome do autor injetado
    - **Propriedade 2: Nome do autor injetado em submissões**
    - Para qualquer nome salvo no localStorage, ao criar formulário ou postagem, o campo volunteer_name deve conter exatamente o nome salvo
    - **Valida: Requisitos 2.3, 7.3**

- [ ] 7. Frontend — Página de Informações e Cronograma
  - [~] 7.1 Implementar `js/pages/info.js` — lista de dias
    - Exibir 4 cards clicáveis (Sábado, Domingo, Segunda, Terça)
    - Ao tocar em um card, navegar para `#/info/:day`
    - _Requisitos: 4.1, 4.2_

  - [~] 7.2 Implementar `js/pages/day-detail.js` — detalhe do dia
    - Carregar dados do `/api/schedule` (ou cache local)
    - Renderizar seções: Cronograma (horários e atividades), Cardápio (café, almoço, jantar) e Materiais
    - Tratar erro de carregamento exibindo "Dados não disponíveis"
    - _Requisitos: 4.2, 4.3_

  - [ ]* 7.3 Escrever teste de propriedade — Renderização fiel dos dados do cronograma
    - **Propriedade 4: Renderização fiel dos dados do cronograma**
    - Para qualquer estrutura válida de schedule_data.json, a renderização deve conter todas as atividades, itens de cardápio e materiais presentes nos dados
    - **Valida: Requisitos 4.3**

- [ ] 8. Frontend — Página de Formulários e Dashboard
  - [~] 8.1 Implementar `js/pages/forms.js` — lista de formulários e dashboard
    - Exibir botão "+ Novo formulário" no topo
    - Exibir Dashboard com gráfico de barras (quantidade por ação) e gráfico de pizza (distribuição percentual) quando dados sincronizados existem
    - Ocultar Dashboard quando não há dados sincronizados
    - _Requisitos: 5.1, 6.1, 6.2, 6.3, 6.4_

  - [~] 8.2 Implementar `js/pages/form-new.js` — novo formulário
    - Campos: Ação realizada (checkboxes múltiplos com 12 opções), Nome completo, Idade, Localidade, Descrição, Imagem (upload)
    - Validar que ao menos uma ação está selecionada antes de enviar
    - Salvar no IndexedDB se offline, enviar ao servidor se online
    - Associar automaticamente o volunteer_name do localStorage
    - _Requisitos: 5.2, 5.3, 5.4, 2.3_

  - [ ]* 8.3 Escrever teste de propriedade — Validação de ações do formulário
    - **Propriedade 5: Validação de ações do formulário**
    - Para qualquer subconjunto das ações disponíveis, a validação deve aceitar se e somente se ao menos uma ação está selecionada
    - **Valida: Requisitos 5.4**

  - [ ]* 8.4 Escrever teste de propriedade — Agregação correta dos dados do dashboard
    - **Propriedade 6: Agregação correta dos dados do dashboard**
    - Para qualquer conjunto de formulários, a contagem por ação deve corresponder exatamente ao número de formulários que contêm cada ação, e os percentuais devem somar 100% (±1%)
    - **Valida: Requisitos 6.2, 6.3**

- [ ] 9. Frontend — Diário de Bordo
  - [~] 9.1 Implementar `js/pages/diary.js` — feed de postagens
    - Exibir feed ordenado por data decrescente (mais recente primeiro)
    - Cada postagem com: avatar/inicial do autor, nome, data, imagem, título e descrição
    - Botão "+ Nova postagem"
    - _Requisitos: 7.1, 7.2_

  - [~] 9.2 Implementar `js/pages/post-new.js` — nova postagem
    - Campos: Título, Descrição, Imagem (upload), botão "Publicar"
    - Associar automaticamente o volunteer_name do localStorage
    - Salvar no IndexedDB se offline, enviar ao servidor se online
    - _Requisitos: 7.2, 7.3_

  - [ ]* 9.3 Escrever teste de propriedade — Ordenação do feed
    - **Propriedade 7: Ordenação do feed do Diário de Bordo**
    - Para qualquer conjunto de postagens com datas variadas, o feed deve estar ordenado por data decrescente
    - **Valida: Requisitos 7.1**

- [~] 10. Checkpoint — Verificar frontend principal
  - Garantir que todas as páginas renderizam corretamente, navegação SPA funciona, e dados são salvos no IndexedDB. Perguntar ao usuário se há dúvidas.

- [ ] 11. Frontend — Menu, Prestação de Contas e Dados da Equipe
  - [~] 11.1 Implementar `js/pages/menu.js` — menu principal
    - Exibir lista com dois itens: "Prestação de contas" e "Dados da equipe"
    - Navegar para `#/menu/accounts` e `#/menu/team` respectivamente
    - _Requisitos: 10.1, 10.2, 10.3_

  - [~] 11.2 Implementar `js/pages/accounts.js` — prestação de contas
    - Solicitar PIN de 4 dígitos antes de exibir conteúdo
    - Exibir mensagem de erro se PIN incorreto
    - Após validação, exibir lista de comprovantes (título, data, imagem, descrição) e botão "+ Adicionar comprovante"
    - _Requisitos: 8.1, 8.2, 8.3_

  - [~] 11.3 Implementar `js/pages/receipt-new.js` — novo comprovante
    - Campos: Título, Descrição, Imagem do comprovante (upload), botão "Enviar"
    - Salvar no IndexedDB se offline, enviar ao servidor se online
    - _Requisitos: 8.4_

  - [~] 11.4 Implementar `js/pages/team.js` — dados da equipe
    - Solicitar PIN antes de exibir conteúdo
    - Exibir lista de voluntários com nome e foto/avatar
    - Ao tocar em um nome, navegar para `#/menu/team/:id`
    - _Requisitos: 9.1, 9.2, 9.3_

  - [~] 11.5 Implementar `js/pages/volunteer-profile.js` — perfil do voluntário
    - Exibir perfil completo: foto, nome, RG, CPF, data de nascimento, sexo, profissão, e-mail, telefone, endereço, termos e dados médicos
    - _Requisitos: 9.4_

  - [ ]* 11.6 Escrever teste de propriedade — Validação de PIN
    - **Propriedade 8: Validação de PIN**
    - Para qualquer PIN de 4 dígitos, a validação deve conceder acesso se e somente se o PIN corresponde exatamente ao configurado
    - **Valida: Requisitos 8.2, 9.2**

  - [ ]* 11.7 Escrever teste de propriedade — Renderização do perfil do voluntário
    - **Propriedade 9: Renderização completa do perfil do voluntário**
    - Para qualquer voluntário com dados completos, o perfil deve conter todos os campos obrigatórios
    - **Valida: Requisitos 9.4**

- [ ] 12. Frontend — Redimensionamento de Imagens
  - [~] 12.1 Implementar utilitário de redimensionamento de imagem
    - Usar Canvas API para redimensionar (max 1200px na maior dimensão, manter proporção)
    - Comprimir como JPEG com qualidade 80%
    - Não ampliar imagens já menores que 1200px
    - Integrar nos formulários de upload (form-new, post-new, receipt-new)
    - _Requisitos: 13.1, 13.2_

  - [ ]* 12.2 Escrever teste de propriedade — Redimensionamento de imagem
    - **Propriedade 13: Redimensionamento de imagem preserva proporção e respeita limite**
    - Para qualquer imagem, o redimensionamento deve: (a) não exceder 1200px, (b) manter proporção (±1px), (c) não ampliar imagens menores
    - **Valida: Requisitos 13.1**

- [ ] 13. Frontend — Navegação SPA (teste de propriedade)
  - [ ]* 13.1 Escrever teste de propriedade — Navegação SPA e ícone ativo
    - **Propriedade 3: Navegação SPA e destaque do ícone ativo**
    - Para qualquer rota válida, navegar deve atualizar o conteúdo sem reload e destacar o ícone correto na Bottom Navigation Bar
    - **Valida: Requisitos 3.2, 3.3**

- [ ] 14. Integração final e ajustes
  - [~] 14.1 Conectar todos os componentes
    - Garantir que `app.js` importa e registra todas as páginas
    - Garantir que `sync.js` é iniciado ao carregar o app
    - Garantir que o indicador de conectividade é atualizado em tempo real
    - Verificar que todos os formulários salvam offline e sincronizam corretamente
    - _Requisitos: 3.1, 3.2, 12.1, 12.2, 12.3_

  - [~] 14.2 Configuração da URL do servidor
    - Implementar campo de configuração ou constante para URL base do servidor (ex: `http://192.168.1.100:5000`)
    - Salvar no localStorage (`server_url`)
    - _Requisitos: 17.1_

  - [ ]* 14.3 Escrever testes de integração
    - Fluxo: criar formulário offline → sincronizar → verificar no servidor
    - Fluxo de autenticação por PIN
    - Carregamento de dados do schedule_data.json
    - _Requisitos: 5.4, 8.2, 12.2, 4.3_

- [~] 15. Checkpoint final
  - Garantir que todos os testes passam, que o app funciona end-to-end (offline e online), e que a identidade visual está consistente. Perguntar ao usuário se há dúvidas.

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude
- O usuário fornecerá screenshots do MVP existente durante a implementação para reprodução fiel do design visual

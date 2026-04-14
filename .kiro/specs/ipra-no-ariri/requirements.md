# Documento de Requisitos — IPRA no Ariri

## Introdução

O "IPRA no Ariri" é um aplicativo web progressivo (PWA) desenvolvido para apoiar uma missão social cristã de 4 dias (sábado a terça-feira) em uma localidade com acesso limitado ou inexistente à internet. O app será utilizado por 12 a 15 voluntários e funcionará em uma rede Wi-Fi local, onde um computador rodando Flask atua como servidor central. O app deve operar offline, sincronizando dados automaticamente quando o servidor estiver acessível.

## Glossário

- **App**: O aplicativo web progressivo IPRA no Ariri
- **Servidor_Local**: Computador na rede da missão que executa o backend Flask e serve os arquivos estáticos do frontend
- **Voluntário**: Membro da equipe de missão que utiliza o App em seu dispositivo móvel
- **IndexedDB**: Banco de dados local do navegador utilizado para persistência offline
- **Fila_de_Sincronização**: Conjunto de registros armazenados no IndexedDB aguardando envio ao Servidor_Local
- **Bottom_Navigation_Bar**: Barra de navegação fixa na parte inferior da tela com 4 ícones de acesso às seções principais
- **SPA**: Single Page Application — aplicação de página única que não recarrega a página inteira ao navegar
- **Splash_Screen**: Tela de abertura exibida ao iniciar o App
- **Página_Informações**: Seção do App que exibe cronograma, cardápio e materiais dos dias da missão
- **Página_Formulários**: Seção do App para registro de ações realizadas e pessoas atendidas
- **Diário_de_Bordo**: Seção do App estilo blog para postagens da equipe
- **Menu**: Seção do App com acesso a Prestação de Contas e Dados da Equipe
- **Prestação_de_Contas**: Subseção protegida por PIN para registro de comprovantes financeiros
- **Dados_da_Equipe**: Subseção protegida por PIN para consulta de informações dos voluntários
- **PIN**: Número de identificação pessoal (senha numérica de 4 dígitos) configurável no Servidor_Local
- **Dashboard**: Painel com gráficos estatísticos gerados a partir dos dados sincronizados de formulários
- **Arquivo_de_Configuração**: Arquivo JSON ou Python no Servidor_Local contendo dados fixos de cronograma, cardápio e materiais

## Requisitos

### Requisito 1: Splash Screen

**User Story:** Como Voluntário, quero ver uma tela de abertura ao iniciar o App, para que eu tenha uma experiência visual acolhedora e identifique a missão.

#### Critérios de Aceitação

1. WHEN o App é iniciado, THE Splash_Screen SHALL exibir o logo "IPRA no Ariri" centralizado sobre fundo creme (#faf6ee) com elementos em verde escuro (#1a4731).
2. WHEN o App é iniciado, THE Splash_Screen SHALL exibir o versículo "Ide ao mundo, pregai o evangelho a toda criatura." — Marcos 16:15.
3. WHEN o Voluntário toca ou clica em qualquer área da Splash_Screen, THE App SHALL navegar para a Página_Informações.

---

### Requisito 2: Identificação do Voluntário

**User Story:** Como Voluntário, quero me identificar ao abrir o App pela primeira vez no meu dispositivo, para que minhas postagens e formulários sejam associados ao meu nome.

#### Critérios de Aceitação

1. WHEN o App é aberto pela primeira vez em um dispositivo sem identificação salva, THE App SHALL exibir uma tela de seleção de nome do Voluntário (lista de nomes ou campo de digitação).
2. WHEN o Voluntário seleciona ou digita seu nome, THE App SHALL salvar o nome no localStorage do navegador.
3. WHILE o nome do Voluntário está salvo no localStorage, THE App SHALL utilizar esse nome como autor em todos os formulários e postagens do Diário_de_Bordo.

---

### Requisito 3: Navegação Principal (Bottom Navigation Bar)

**User Story:** Como Voluntário, quero navegar entre as seções do App por uma barra inferior fixa, para que eu acesse rapidamente qualquer funcionalidade.

#### Critérios de Aceitação

1. THE Bottom_Navigation_Bar SHALL exibir 4 ícones fixos na parte inferior da tela: Informações, Formulários, Diário_de_Bordo e Menu.
2. WHEN o Voluntário toca em um ícone da Bottom_Navigation_Bar, THE App SHALL exibir a página correspondente sem recarregar a página inteira (comportamento SPA).
3. THE Bottom_Navigation_Bar SHALL destacar visualmente o ícone da página ativa.

---

### Requisito 4: Página de Informações

**User Story:** Como Voluntário, quero consultar o cronograma, cardápio e materiais de cada dia da missão, para que eu me organize adequadamente.

#### Critérios de Aceitação

1. THE Página_Informações SHALL exibir uma lista de 4 cards clicáveis representando os dias da missão: Sábado, Domingo, Segunda e Terça.
2. WHEN o Voluntário toca em um card de dia, THE App SHALL exibir a página de detalhe do dia contendo as seções Cronograma, Cardápio e Materiais.
3. THE Página_Informações SHALL carregar os dados de cronograma, cardápio e materiais a partir do Arquivo_de_Configuração (schedule_data.json ou schedule_data.py) definido no Servidor_Local.
4. THE Servidor_Local SHALL disponibilizar um endpoint GET /api/schedule que retorna os dados do Arquivo_de_Configuração.

---

### Requisito 5: Formulário de Ação e Pessoa Atendida

**User Story:** Como Voluntário, quero registrar as ações realizadas e os dados das pessoas atendidas, para que a equipe tenha um registro completo das atividades da missão.

#### Critérios de Aceitação

1. WHEN o Voluntário acessa a Página_Formulários, THE App SHALL exibir um botão "+ Novo formulário" no topo da página.
2. WHEN o Voluntário toca em "+ Novo formulário", THE App SHALL exibir um formulário com os campos: Ação realizada (checkboxes de múltipla seleção), Nome completo, Idade, Localidade/comunidade, Descrição (texto livre) e Imagem (upload de foto).
3. THE App SHALL oferecer as seguintes opções de Ação realizada: Evangelismo, Visitação, Oração, Aconselhamento, Infantil, Manutenção, Auxílio ao MEAP, Cozinha, Educação, Odontologia, P. Socorros e Outros.
4. WHEN o Voluntário preenche o formulário e toca em "Enviar", THE App SHALL validar que ao menos uma Ação realizada foi selecionada antes de submeter.
5. THE Servidor_Local SHALL disponibilizar um endpoint POST /api/forms para receber formulários e um endpoint GET /api/forms para listar formulários salvos.

---

### Requisito 6: Dashboard de Formulários

**User Story:** Como Voluntário, quero visualizar gráficos estatísticos das ações realizadas, para que a equipe acompanhe o progresso da missão.

#### Critérios de Aceitação

1. WHEN a Página_Formulários é acessada e dados sincronizados existem, THE App SHALL exibir um Dashboard abaixo do botão "+ Novo formulário".
2. THE Dashboard SHALL exibir um gráfico de barras com a quantidade de registros por tipo de Ação realizada.
3. THE Dashboard SHALL exibir um gráfico de pizza com a distribuição percentual das ações realizadas.
4. WHILE nenhum dado sincronizado existir no Servidor_Local, THE App SHALL ocultar o Dashboard.

---

### Requisito 7: Diário de Bordo

**User Story:** Como Voluntário, quero publicar e visualizar postagens da equipe em formato de blog, para que tenhamos um registro colaborativo da experiência da missão.

#### Critérios de Aceitação

1. WHEN o Voluntário acessa o Diário_de_Bordo, THE App SHALL exibir um feed de postagens ordenadas por data (mais recente primeiro), cada uma contendo: avatar/inicial do autor, nome do autor, data, imagem, título e descrição.
2. WHEN o Voluntário toca em "+ Nova postagem", THE App SHALL exibir um formulário com os campos: Título, Descrição (texto livre), Imagem (upload) e botão "Publicar".
3. WHEN o Voluntário publica uma postagem, THE App SHALL associar automaticamente o nome do Voluntário salvo no localStorage como autor da postagem.
4. THE Servidor_Local SHALL disponibilizar um endpoint POST /api/posts para receber postagens e um endpoint GET /api/posts para listar postagens.

---

### Requisito 8: Prestação de Contas

**User Story:** Como líder da missão, quero registrar e consultar comprovantes financeiros em uma área protegida por senha, para que a prestação de contas seja organizada e segura.

#### Critérios de Aceitação

1. WHEN o Voluntário acessa a Prestação_de_Contas, THE App SHALL solicitar um PIN numérico de 4 dígitos antes de exibir o conteúdo.
2. IF o PIN informado não corresponde ao PIN configurado no Servidor_Local, THEN THE App SHALL exibir uma mensagem de erro e impedir o acesso.
3. WHEN o PIN é validado com sucesso, THE App SHALL exibir uma lista de comprovantes contendo: título, data, imagem e descrição, e um botão "+ Adicionar comprovante".
4. WHEN o Voluntário toca em "+ Adicionar comprovante", THE App SHALL exibir um formulário com os campos: Título, Descrição, Imagem do comprovante (upload) e botão "Enviar".
5. THE Servidor_Local SHALL disponibilizar um endpoint POST /api/receipts para receber comprovantes e um endpoint GET /api/receipts para listar comprovantes.

---

### Requisito 9: Dados da Equipe

**User Story:** Como líder da missão, quero consultar os dados pessoais dos voluntários em uma área protegida por senha, para que eu tenha acesso rápido às informações da equipe.

#### Critérios de Aceitação

1. WHEN o Voluntário acessa os Dados_da_Equipe, THE App SHALL solicitar um PIN numérico antes de exibir o conteúdo.
2. IF o PIN informado não corresponde ao PIN configurado no Servidor_Local, THEN THE App SHALL exibir uma mensagem de erro e impedir o acesso.
3. WHEN o PIN é validado com sucesso, THE App SHALL exibir uma lista de voluntários cadastrados com nome e foto de perfil (ou avatar com inicial).
4. WHEN o Voluntário toca em um nome da lista, THE App SHALL exibir o perfil completo contendo: foto de perfil, nome completo, RG, CPF, data de nascimento, sexo, profissão, e-mail, telefone, endereço, termos assinados (imagem/PDF) e dados médicos (imagem/PDF).
5. THE Servidor_Local SHALL disponibilizar um endpoint GET /api/volunteers para listar voluntários e um endpoint GET /api/volunteers/<id> para retornar o perfil completo.

---

### Requisito 10: Menu Principal

**User Story:** Como Voluntário, quero acessar funcionalidades adicionais pelo menu, para que eu navegue para Prestação de Contas e Dados da Equipe.

#### Critérios de Aceitação

1. WHEN o Voluntário acessa o Menu, THE App SHALL exibir uma lista com dois itens: "Prestação de contas" e "Dados da equipe".
2. WHEN o Voluntário toca em "Prestação de contas", THE App SHALL navegar para a Prestação_de_Contas.
3. WHEN o Voluntário toca em "Dados da equipe", THE App SHALL navegar para os Dados_da_Equipe.

---

### Requisito 11: Persistência Offline com IndexedDB

**User Story:** Como Voluntário, quero que meus dados sejam salvos localmente quando o servidor não estiver acessível, para que eu não perca registros por falta de conexão.

#### Critérios de Aceitação

1. IF o Servidor_Local não está acessível no momento do envio de um formulário, THEN THE App SHALL salvar o formulário na Fila_de_Sincronização do IndexedDB com os campos: id (UUID), type, data, created_at e synced (false).
2. IF o Servidor_Local não está acessível no momento da publicação de uma postagem, THEN THE App SHALL salvar a postagem na Fila_de_Sincronização do IndexedDB.
3. IF o Servidor_Local não está acessível no momento do envio de um comprovante, THEN THE App SHALL salvar o comprovante na Fila_de_Sincronização do IndexedDB.
4. THE App SHALL manter três stores no IndexedDB: pending_forms, pending_posts e pending_receipts.

---

### Requisito 12: Sincronização Automática com o Servidor

**User Story:** Como Voluntário, quero que os dados pendentes sejam enviados automaticamente ao servidor quando a conexão for restabelecida, para que eu não precise me preocupar com sincronização manual.

#### Critérios de Aceitação

1. THE App SHALL executar uma verificação de conectividade com o Servidor_Local via GET /api/ping a cada 30 segundos.
2. WHEN o App detecta que o Servidor_Local está acessível e existem itens na Fila_de_Sincronização, THE App SHALL enviar os itens pendentes em ordem cronológica (created_at).
3. WHEN um item da Fila_de_Sincronização é enviado com sucesso ao Servidor_Local, THE App SHALL marcar o campo synced como true no IndexedDB.
4. THE Servidor_Local SHALL disponibilizar um endpoint GET /api/ping que retorna { "status": "ok" }.
5. THE Servidor_Local SHALL disponibilizar um endpoint POST /api/sync para receber dados em lote (batch) da Fila_de_Sincronização.

---

### Requisito 13: Redimensionamento de Imagens no Frontend

**User Story:** Como Voluntário, quero que as imagens enviadas sejam otimizadas automaticamente, para que o armazenamento no servidor seja economizado.

#### Critérios de Aceitação

1. WHEN o Voluntário seleciona uma imagem para upload (câmera ou galeria), THE App SHALL redimensionar a imagem para no máximo 1200 pixels na maior dimensão, mantendo a proporção original.
2. WHEN o App redimensiona uma imagem, THE App SHALL comprimir a imagem com qualidade de 80%.

---

### Requisito 14: Identidade Visual

**User Story:** Como Voluntário, quero que o App tenha uma identidade visual consistente e acolhedora, para que a experiência de uso seja agradável.

#### Critérios de Aceitação

1. THE App SHALL utilizar a paleta de cores verde escuro (#1a4731) e creme/off-white (#faf6ee) em todas as telas.
2. THE App SHALL utilizar tipografia sem serifa (sans-serif) em todos os textos.
3. THE App SHALL seguir um estilo visual minimalista e leve.

---

### Requisito 15: Responsividade e Design Mobile-First

**User Story:** Como Voluntário, quero usar o App confortavelmente no meu celular, para que a navegação seja intuitiva em telas pequenas.

#### Critérios de Aceitação

1. THE App SHALL ser responsivo com design mobile-first, otimizado para telas de aproximadamente 390 pixels de largura.
2. THE App SHALL funcionar como SPA, navegando entre páginas sem recarregar a página inteira.

---

### Requisito 16: Servidor Flask e Arquivos Estáticos

**User Story:** Como administrador da missão, quero que o servidor Flask sirva tanto a API quanto os arquivos do frontend, para que não seja necessário um servidor separado.

#### Critérios de Aceitação

1. THE Servidor_Local SHALL servir os arquivos estáticos do frontend (HTML, CSS, JavaScript, imagens) diretamente pelo Flask.
2. THE Servidor_Local SHALL operar sem dependência de internet externa — todos os recursos devem estar disponíveis localmente.
3. THE Servidor_Local SHALL utilizar SQLite como banco de dados em ambiente de desenvolvimento.

---

### Requisito 17: Configuração da URL do Servidor

**User Story:** Como administrador da missão, quero configurar o endereço IP do servidor, para que os dispositivos dos voluntários se conectem corretamente à rede local.

#### Critérios de Aceitação

1. THE App SHALL permitir a configuração da URL base do Servidor_Local (ex: 192.168.1.x:5000) como constante no código JavaScript ou via campo de configuração acessível nas settings.

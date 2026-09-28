# Feature Specification: Dockerização do Projeto

**Feature Branch**: `001-dockerizacao`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Dockeriza o projeto."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subir o ambiente completo com um único comando (Priority: P1)

Uma pessoa desenvolvedora clona o repositório em uma máquina que possui apenas o runtime de containers instalado e, com um único comando, obtém a interface web, a API e o banco de dados em execução e integrados. Ela consegue abrir a aplicação no navegador, autenticar-se e navegar pelo sistema sem executar instalações manuais de dependências.

**Why this priority**: É o valor central da funcionalidade — eliminar o setup manual e garantir que qualquer pessoa consiga rodar o sistema rapidamente.

**Independent Test**: Em uma máquina limpa (apenas runtime de containers), clonar o repositório, executar o comando único de inicialização e verificar que a aplicação abre no navegador e o login funciona com um usuário de exemplo.

**Acceptance Scenarios**:

1. **Given** uma máquina com o runtime de containers instalado e o repositório clonado, **When** a pessoa executa o comando único de inicialização, **Then** os três componentes (interface, API e banco) sobem sem passos manuais adicionais.
2. **Given** o ambiente em execução, **When** a pessoa acessa a interface web no navegador, **Then** a aplicação carrega e permite autenticação com um usuário de exemplo.
3. **Given** o ambiente em execução, **When** a pessoa consulta o diagnóstico de saúde da API, **Then** a resposta indica serviço operacional e banco conectado.

---

### User Story 2 - Banco de dados pronto para uso na primeira execução (Priority: P2)

Na primeira subida do ambiente, o banco de dados é criado e preparado automaticamente com a estrutura atual do sistema, incluindo dados de exemplo suficientes para testar as principais telas. Em subidas seguintes, os dados existentes são preservados.

**Why this priority**: Sem banco preparado a aplicação não é utilizável, mas esta história depende da subida do ambiente (P1) para ter valor.

**Independent Test**: Subir o ambiente com armazenamento de dados vazio e verificar que a estrutura e os dados de exemplo existem; reiniciar o ambiente e verificar que os dados permanecem.

**Acceptance Scenarios**:

1. **Given** um ambiente novo (sem dados anteriores), **When** o banco inicia pela primeira vez, **Then** a estrutura atual do sistema é aplicada automaticamente e os dados de exemplo ficam disponíveis.
2. **Given** um ambiente já utilizado, **When** o ambiente é reiniciado, **Then** os dados existentes são preservados.
3. **Given** um ambiente em uso, **When** a pessoa executa o comando de limpeza, **Then** todos os dados locais são removidos e uma nova subida recria o banco do zero.

---

### User Story 3 - Empacotar a aplicação para produção (Priority: P2)

Quem opera o sistema constrói imagens otimizadas da interface e da API — sem dependências de desenvolvimento e com a interface entregue como conteúdo estático de alto desempenho — e as executa em um ambiente cuja configuração é fornecida por variáveis de ambiente, sem alterar as imagens.

**Why this priority**: O sistema precisa ser publicável em um ambiente real; a base é compartilhada com o ambiente de desenvolvimento, mas produção é um fluxo independente e testável.

**Independent Test**: Construir as imagens de produção a partir de um clone limpo, subir com uma configuração mínima e verificar que a aplicação responde e autentica; inspecionar as imagens para confirmar que não contêm dependências de desenvolvimento nem credenciais.

**Acceptance Scenarios**:

1. **Given** o repositório clonado e uma configuração de ambiente válida, **When** as imagens de produção são construídas e executadas, **Then** interface e API ficam disponíveis e integradas.
2. **Given** as imagens de produção em execução, **When** a pessoa acessa a interface, **Then** a aplicação carrega sem depender de servidor de desenvolvimento ou recarga automática.
3. **Given** as imagens de produção, **When** elas são inspecionadas, **Then** não contêm dependências de desenvolvimento, código desnecessário nem credenciais embutidas.

---

### User Story 4 - Desenvolver com recarga automática (Priority: P3)

Uma pessoa desenvolvedora altera o código do frontend ou do backend e vê a mudança refletida automaticamente, sem precisar reconstruir imagens ou reiniciar serviços manualmente.

**Why this priority**: Melhora o dia a dia de desenvolvimento, mas o ambiente já entrega valor sem isso (P1/P2).

**Independent Test**: Com o ambiente em execução, alterar um texto exibido na interface e uma mensagem da API; verificar que ambas as mudanças aparecem sem ação manual de rebuild.

**Acceptance Scenarios**:

1. **Given** o ambiente em execução, **When** um arquivo do frontend é alterado, **Then** a interface reflete a alteração automaticamente.
2. **Given** o ambiente em execução, **When** um arquivo do backend é alterado, **Then** a API passa a responder com o comportamento atualizado automaticamente.

### Edge Cases

- O que acontece quando uma das portas padrão já está em uso na máquina? O ambiente deve permitir trocar as portas sem editar arquivos versionados.
- O que acontece se a API iniciar antes de o banco estar pronto? A API não deve encerrar; deve aguardar/conectar quando o banco estiver disponível e refletir o estado no diagnóstico de saúde.
- O que acontece se o arquivo de configuração de ambiente não existir? A inicialização deve falhar com mensagem clara indicando o que configurar, ou usar padrões seguros para desenvolvimento.
- O que acontece quando há dados de uma versão anterior da estrutura no armazenamento local? Deve existir um caminho documentado de reinicialização limpa.
- O que acontece sem chave de serviço de e-mail válida? A aplicação deve continuar operacional; funcionalidades de envio de e-mail podem ficar indisponíveis sem derrubar o ambiente.
- O que acontece quando a interface de produção é acessada e a API está indisponível? A aplicação deve exibir uma mensagem de erro compreensível em vez de uma tela em branco.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O projeto MUST ser iniciável por um único comando em uma máquina que tenha apenas o runtime de containers instalado.
- **FR-002**: O ambiente MUST incluir a interface web, a API e o banco de dados do sistema.
- **FR-003**: A interface web MUST conseguir chamar a API a partir do navegador da pessoa usuária.
- **FR-004**: A API MUST conseguir se conectar ao banco de dados do ambiente.
- **FR-005**: O banco de dados MUST ser inicializado automaticamente com a estrutura atual do sistema na primeira execução.
- **FR-006**: O banco de dados MUST conter dados de exemplo prontos para teste na primeira execução.
- **FR-007**: Os dados do banco MUST persistir entre reinícios do ambiente, exceto quando a remoção for solicitada explicitamente.
- **FR-008**: O ambiente MUST oferecer modo de desenvolvimento com recarga automática para frontend e backend.
- **FR-009**: Configurações sensíveis (credenciais de banco, segredo de autenticação, chaves de serviços externos) MUST ser fornecidas via variáveis de ambiente e não devem estar embutidas em imagens ou versionadas.
- **FR-010**: As portas expostas ao host MUST ser configuráveis para evitar conflitos.
- **FR-011**: A API MUST aguardar ou tolerar a indisponibilidade temporária do banco durante a inicialização.
- **FR-012**: Deve MUST existir comando documentado para encerrar o ambiente.
- **FR-013**: Deve MUST existir comando documentado para encerrar o ambiente removendo os dados locais.
- **FR-014**: Instruções de uso do ambiente MUST estar documentadas no repositório.
- **FR-015**: O diagnóstico de saúde da API MUST indicar o estado da conexão com o banco.
- **FR-016**: O projeto MUST permitir construir imagens otimizadas de produção para interface e API.
- **FR-017**: A interface em produção MUST ser entregue como conteúdo estático otimizado, sem servidor de desenvolvimento.
- **FR-018**: As imagens de produção MUST excluir dependências de desenvolvimento.
- **FR-019**: O ambiente de produção MUST ser configurável apenas por variáveis de ambiente, sem reconstruir as imagens.
- **FR-020**: O endereço da API utilizado pela interface MUST ser configurável por ambiente.

### Key Entities *(include if feature involves data)*

- **Interface Web**: aplicação acessada pelo navegador; consome a API e é o ponto de entrada da pessoa usuária.
- **API**: serviço que atende a interface web e acessa o banco de dados.
- **Banco de Dados**: armazena os dados operacionais do sistema (usuários, mercadorias, vendas, lojas).
- **Dados de Exemplo**: conjunto de registros fictícios usados para testar as principais telas.
- **Armazenamento Persistente**: guarda os dados do banco entre reinícios do ambiente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa consegue sair de um clone do repositório até a aplicação em execução em menos de 10 minutos, sem instalar dependências manualmente.
- **SC-002**: Pelo menos 2 novos integrantes conseguem subir o ambiente seguindo apenas a documentação, sem ajuda de outra pessoa.
- **SC-003**: O ambiente completo fica operacional em menos de 5 minutos após o primeiro comando de inicialização, desconsiderando o download inicial das imagens.
- **SC-004**: Alterações de código no frontend e no backend aparecem na aplicação em até 5 segundos, sem ação manual de rebuild.
- **SC-005**: Nenhuma credencial sensível é encontrada nas imagens geradas nem no controle de versão.
- **SC-006**: Nenhuma perda de dados é observada após 10 reinícios consecutivos do ambiente.
- **SC-007**: Pelo menos 90% das tentativas de subir o ambiente por uma pessoa nova têm sucesso na primeira execução.
- **SC-008**: As imagens de produção são construídas a partir de um clone limpo em menos de 10 minutos, sem passos manuais além do comando documentado.

## Assumptions

- **Escopo**: duas modalidades — (1) ambiente de desenvolvimento local com recarga automática e dados de exemplo, e (2) imagens otimizadas para produção, configuráveis por ambiente.
- O runtime de containers e o orquestrador local estão instalados na máquina da pessoa desenvolvedora.
- O banco de dados continua sendo o PostgreSQL, já utilizado pelo projeto.
- Os dados de exemplo presentes no repositório são suficientes para testar as principais telas.
- Serviços externos de e-mail podem operar de forma degradada sem chave válida; configurá-los não faz parte desta funcionalidade.
- A pessoa acessa a interface web e a API a partir do próprio navegador no host local.


# Requisitos do Projeto Pegasis

Este documento detalha os requisitos funcionais e não funcionais para o projeto Pegasis.

## Requisitos Funcionais

### RF01: Gestão de Utilizadores
- O sistema deve permitir que os utilizadores criem uma conta.
- O sistema deve permitir que os utilizadores façam login e logout.

### RF02: Dashboard
- O dashboard deve exibir um resumo do progresso do utilizador, incluindo pontos de experiência (XP), nível e emblemas conquistados.
- O dashboard deve apresentar estatísticas e gráficos sobre as metas ou dados financeiros do utilizador.

### RF03: Gestão de Metas (CRUD)
- Os utilizadores devem poder criar, visualizar, atualizar e apagar as suas metas ou objetivos.
- Os utilizadores devem poder marcar metas como concluídas.

### RF04: Gamificação
- O sistema deve atribuir XP aos utilizadores pela conclusão de ações (ex: criar uma meta, completar uma meta).
- Os utilizadores devem poder subir de nível após acumularem uma certa quantidade de XP.
- O sistema deve atribuir emblemas pela conquista de marcos específicos.

### RF05: Mercado
- A aplicação deve exibir dados de uma API pública externa (ex: cotações de ações, taxas de criptomoedas).

### RF06: Carteira
- A aplicação deve permitir que os utilizadores acompanhem os seus ativos financeiros (ex: portfólio simulado, participações em criptomoedas).

### RF07: Assistente Virtual (Bónus)
- Um bot interativo deve fornecer dicas, motivação ou orientação ao utilizador.

## Requisitos Não Funcionais

### RNF01: Desempenho
- A aplicação deve carregar rapidamente no navegador.
- As interações da interface do utilizador devem ser fluidas e responsivas, sem atrasos percetíveis.

### RNF02: Usabilidade e Acessibilidade
- A interface deve ser intuitiva, clara e fácil de navegar.
- A aplicação deve ser responsiva e adaptar-se a diferentes tamanhos de ecrã (desktop, tablet, telemóvel).
- A aplicação deve seguir as diretrizes básicas de acessibilidade web (WCAG).

### RNF03: Segurança
- Os dados do utilizador devem ser tratados de forma segura.
- A comunicação com a API externa deve ser feita de forma segura (HTTPS).

### RNF04: Manutenibilidade
- O código-fonte deve ser bem estruturado, organizado em módulos e seguir as convenções do Vue.js.
- O código deve ser claro e comentado quando necessário para facilitar futuras manutenções.

### RNF05: Testabilidade
- A aplicação deve ter uma cobertura de testes unitários de, no mínimo, 6 testes, utilizando Vitest.

### RNF06: Tecnologia
- O projeto deve ser desenvolvido utilizando Vue 3 e Vite.
- A gestão de estado global deve ser implementada com Pinia.
- As rotas da aplicação devem ser geridas pelo Vue Router.
- Um mock server (json-server) deve ser utilizado para a persistência de dados iniciais.

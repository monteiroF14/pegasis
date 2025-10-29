## Execução

É utilizado bun mas pode ser qualquer runtime de JavaScript (npm e deno)

#### 1. Instalar dependências 

```bash
bun install
```

#### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

#### 3. Levantar a db e correr o projeto 

```bash
bun db:serve
bun dev
```

## Engenharia de requisitos

### Requisitos técnicos
- **Vue 3 + Vite** como base do projeto
- **Vue Router** com mínimo de 4 rotas distintas
- **Pinia** para gestão de estado global
- **Mock server (json-server)** para persistência de dados
- Integração com **1 API pública** externa relevante ao tema
- Sistema de **gamificação** funcional (XP, níveis, badges, etc.)
- Testes com **Vitest** (mínimo 6 testes unitários)
- Bónus: **Assistente Virtual/Bot** - Componente interativo extra que oferece dicas, motivação ou orientação ao utilizador

### Calendarização

| Componente | Data |
| --- | --- |
| Definição de Grupos (máx. 3 alunos por grupo) | 16-10-2025 |
| Escolha do tema | 20-10-2025 |
| Partilha de link de repositório de código público | 23-10-2025 |
| 1º Sprint | 24/27-11-2025 |
| 2º Sprint | 15/18-12-2025 |
| Entrega e apresentação final | 26-01-2026 |

### Plano de Entregas

#### Sprint 1 - Fundamentos - Base funcional da app com CRUD e gamificação inicial

- Estrutura base do projeto configurada
- Mock server configurado e integrado
- CRUD funcional de objetivos/metas
- Sistema de registo de ações do utilizador
- Lógica de gamificação inicial implementada
- Dashboard com progresso e estatísticas básicas
- Mínimo 3 testes implementados

#### Sprint 2 - Integração - Completar a experiência e consolidar boas práticas

- Integração com API externa funcional
- Sistema de gamificação completo 
- Interface polida, responsiva e acessível
- Testes completos (mínimo 6)
- Documentação (README.md)
- (Bónus) Assistente virtual/Bot com funcionalidades básicas


# CI/CD Pipeline - GitHub Pages

Este documento descreve o pipeline de CI/CD completo implementado para o Seller Console, seguindo as melhores práticas internacionais para projetos React/TypeScript.

## 📋 Visão Geral

O pipeline implementa uma estratégia de múltiplos ambientes com qualidade de código rigorosa e deploy automatizado para GitHub Pages.

### Ambientes

- **Development** (`dev` branch): Ambiente de desenvolvimento local
- **Staging** (`staging` branch): Ambiente de homologação/teste
- **Production** (`main` branch): Ambiente de produção

## 🚀 Workflows Implementados

### 1. CI Pipeline (`ci.yml`)

Pipeline principal de integração contínua que executa para todos os pushes e pull requests.

#### Etapas de Qualidade

```yaml
Jobs executados em paralelo:
├── setup (cache de dependências)
├── lint (ESLint)
├── typecheck (TypeScript)
├── format-check (Prettier)
├── unit-tests (Vitest + Coverage)
├── e2e-tests (Playwright)
├── build (Compilação)
├── security-audit (npm audit)
└── quality-gate (verificação final)
```

#### Comandos Executados

- `npm run lint` - Verificação de linting
- `npm run typecheck` - Verificação de tipos TypeScript
- `npx prettier --check` - Verificação de formatação
- `npm run test` - Testes unitários
- `npm run test:coverage` - Cobertura de testes
- `npm run test:e2e` - Testes end-to-end
- `npm run build` - Build de produção
- `npm audit` - Auditoria de segurança

### 2. Deploy Pipeline (`deploy.yml`)

Pipeline de deploy automatizado para GitHub Pages com suporte a múltiplos ambientes.

#### Estratégia de Deploy

| Branch    | Ambiente   | URL Base                                    | Trigger          |
|-----------|------------|---------------------------------------------|------------------|
| `main`    | Production | `/seller-console/`                     | Push automático  |
| `staging` | Staging    | `/seller-console/staging/`             | Push automático  |
| Manual    | Escolha    | Configurável                                | Workflow dispatch|

#### Funcionalidades

- ✅ Deploy automático baseado em branch
- ✅ Deploy manual com seleção de ambiente
- ✅ Configuração automática de base path
- ✅ Verificações de qualidade antes do deploy
- ✅ Notificações de status
- ✅ Configuração automática do GitHub Pages

### 3. Security Workflows

#### CodeQL Analysis (`codeql.yml`)
- Análise de segurança automatizada
- Execução semanal e em pushes importantes
- Detecção de vulnerabilidades e problemas de qualidade

#### Dependabot (`dependabot.yml`)
- Atualizações automáticas de dependências
- Agrupamento inteligente de updates relacionados
- Configuração para npm e GitHub Actions
- Execução semanal com limites controlados

#### Auto Update (`auto-update.yml`)
- Verificação semanal de dependências desatualizadas
- Relatórios de segurança
- Limpeza automática de artifacts antigos

## 🛠️ Configuração do Projeto

### Variáveis de Ambiente

```bash
# Arquivo .env.example fornecido como template
VITE_APP_ENV=development|staging|production
VITE_BASE_PATH=/caminho/personalizado/  # Opcional
```

### Scripts Package.json

Todos os scripts de qualidade estão configurados:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## 📊 Métricas e Qualidade

### Coverage Thresholds
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### Ferramentas de Qualidade
- **ESLint**: Análise de código e boas práticas
- **TypeScript**: Verificação de tipos
- **Prettier**: Formatação consistente
- **Vitest**: Testes unitários com coverage
- **Playwright**: Testes end-to-end
- **Husky + lint-staged**: Pre-commit hooks

## 🚀 Como Fazer Deploy

### Deploy Automático

1. **Para Staging**:
   ```bash
   git checkout staging
   git merge dev
   git push origin staging
   ```

2. **Para Production**:
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

### Deploy Manual

1. Acesse GitHub Actions no repositório
2. Selecione "Deploy to GitHub Pages"
3. Clique em "Run workflow"
4. Escolha o ambiente desejado
5. Clique em "Run workflow"

## 🔧 Configuração Inicial

### 1. Configurar GitHub Pages

1. Vá para Settings > Pages no repositório GitHub
2. Selecione "GitHub Actions" como source
3. Salve as configurações

### 2. Configurar Secrets (Opcional)

Para recursos adicionais, configure os seguintes secrets:

```bash
# Para Codecov (opcional)
CODECOV_TOKEN=seu_token_codecov
```

### 3. Configurar Branch Protection

Configure branch protection rules para `main`:

1. Settings > Branches
2. Add rule para `main`
3. Marque "Require status checks to pass"
4. Selecione os checks do CI/CD
5. Marque "Require up-to-date branches"

## 🐛 Troubleshooting

### Deploy Falha

1. Verifique se todos os testes passaram
2. Confirme que o build está funcionando localmente
3. Verifique os logs do GitHub Actions
4. Confirme configurações do GitHub Pages

### Testes Falhando

1. Execute localmente: `npm run test:all`
2. Verifique se todas as dependências estão atualizadas
3. Limpe cache: `rm -rf node_modules package-lock.json && npm install`

### Problemas de Base Path

1. Confirme o nome do repositório no `vite.config.ts`
2. Verifique se as variáveis de ambiente estão corretas
3. Teste localmente com `npm run build && npm run preview`

## 📈 Monitoramento

### Artifacts Disponíveis

- **Build files**: Arquivos compilados (7 dias)
- **Test reports**: Relatórios de teste (30 dias)
- **Coverage reports**: Relatórios de cobertura (30 dias)
- **Playwright reports**: Relatórios E2E (30 dias)

### Logs e Métricas

- GitHub Actions fornece logs detalhados de cada execução
- Coverage reports são gerados automaticamente
- Dependabot cria PRs automáticos para atualizações

## 🔄 Workflow de Desenvolvimento

```mermaid
graph LR
    A[Feature Branch] --> B[Pull Request]
    B --> C[CI Pipeline]
    C --> D[Code Review]
    D --> E[Merge to Dev]
    E --> F[Dev Environment]
    F --> G[Merge to Staging]
    G --> H[Staging Deploy]
    H --> I[QA Testing]
    I --> J[Merge to Main]
    J --> K[Production Deploy]
```

## 📚 Recursos Adicionais

- [GitHub Pages Documentation](https://docs.github.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

Para questões específicas ou problemas, consulte os logs do GitHub Actions ou abra uma issue no repositório.
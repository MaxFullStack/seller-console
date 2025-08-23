# 🚀 Deployment Guide

Guia rápido para deploy e gerenciamento de ambientes do Seller Console.

## ⚡ Quick Start

### Local Development
```bash
npm install
npm run dev
```

### Production Build Test
```bash
npm run build
npm run preview
```

### Run All Quality Checks
```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## 🌍 Ambientes

| Ambiente   | Branch    | URL                                          | Deploy        |
|------------|-----------|----------------------------------------------|---------------|
| Development| `dev`     | Local (http://localhost:5173)               | Manual        |
| Staging    | `staging` | https://username.github.io/seller-console/staging/ | Automático    |
| Production | `main`    | https://username.github.io/seller-console/         | Automático    |

## ✅ Pre-Deploy Checklist

### Before Merging to Staging
- [ ] Todos os testes unitários passando
- [ ] Todos os testes E2E passando
- [ ] ESLint sem erros
- [ ] TypeScript sem erros
- [ ] Build funcionando localmente
- [ ] Coverage de testes ≥ 80%
- [ ] Code review aprovado

### Before Merging to Production
- [ ] QA completo no ambiente de staging
- [ ] Validação de funcionalidades críticas
- [ ] Performance testada
- [ ] Accessibility testada
- [ ] Cross-browser testing
- [ ] Mobile testing

## 🛠️ Comandos de Deploy

### Deploy para Staging
```bash
# Atualizar staging com suas mudanças
git checkout staging
git merge dev
git push origin staging

# O GitHub Actions automaticamente:
# 1. Executa todos os testes
# 2. Faz build
# 3. Deploy para GitHub Pages
```

### Deploy para Production
```bash
# Atualizar production
git checkout main
git merge staging
git push origin main

# Deploy automático para produção
```

### Deploy Manual (Emergency)
1. Vá para GitHub Actions
2. Selecione "Deploy to GitHub Pages"
3. Clique "Run workflow"
4. Escolha o ambiente
5. Execute

## 🔍 Monitoring e Debug

### Verificar Status do Deploy
```bash
# Ver status dos workflows
gh workflow list

# Ver runs recentes
gh run list

# Ver logs de um run específico
gh run view [RUN_ID]
```

### Logs Úteis
- **Build logs**: GitHub Actions > Deploy workflow
- **Test reports**: Artifacts > test-results
- **Coverage reports**: Artifacts > coverage-report

### URLs de Monitoramento
- [GitHub Actions](https://github.com/[username]/seller-console/actions)
- [GitHub Pages Settings](https://github.com/[username]/seller-console/settings/pages)
- [Security Advisories](https://github.com/[username]/seller-console/security/advisories)

## 🚨 Troubleshooting

### Deploy Falhando

#### 1. Verificar Logs
```bash
# GitHub CLI
gh run view --log

# Ou via web
# https://github.com/[username]/seller-console/actions
```

#### 2. Testar Localmente
```bash
# Reproduzir o ambiente de produção
VITE_APP_ENV=production npm run build
npm run preview
```

#### 3. Verificar Dependências
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problemas Comuns

#### Base Path Incorreto
```bash
# Verificar se o nome do repositório está correto no vite.config.ts
# Linha 17: return '/seller-console/';
```

#### Tests Falhando no CI
```bash
# Executar localmente primeiro
npm run test:all

# Verificar se não há arquivos em gitignore que são necessários
```

#### GitHub Pages 404
1. Verificar se GitHub Pages está habilitado
2. Confirmar source como "GitHub Actions"
3. Verificar se o domínio customizado (se usado) está configurado

## 📊 Quality Gates

### Automatic Checks (CI)
- ✅ ESLint (código limpo)
- ✅ TypeScript (tipos corretos)
- ✅ Prettier (formatação)
- ✅ Unit Tests (funcionalidade)
- ✅ E2E Tests (fluxos críticos)
- ✅ Build Success (compilação)
- ✅ Security Audit (vulnerabilidades)

### Manual Checks (QA)
- [ ] Funcionalidades principais funcionando
- [ ] Responsividade mobile
- [ ] Performance aceitável
- [ ] Accessibility guidelines
- [ ] SEO básico
- [ ] Error handling

## 🔄 Rollback Strategy

### Rollback Rápido
```bash
# Reverter último commit em main
git checkout main
git revert HEAD
git push origin main
```

### Rollback para Versão Específica
```bash
# Identificar commit anterior estável
git log --oneline

# Reverter para commit específico
git checkout main
git revert [COMMIT_SHA]
git push origin main
```

### Emergency Hotfix
```bash
# Criar branch de hotfix direto da main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Fazer correção
# ...

# Deploy direto para main (bypass staging se necessário)
git checkout main
git merge hotfix/critical-fix
git push origin main
```

## 📋 Maintenance

### Weekly Tasks
- [ ] Revisar dependabot PRs
- [ ] Verificar security advisories
- [ ] Monitorar performance
- [ ] Limpar artifacts antigos (automático)

### Monthly Tasks
- [ ] Review coverage reports
- [ ] Atualizar documentação
- [ ] Audit de dependências major
- [ ] Performance audit

## 🔗 Links Úteis

- [GitHub Pages Status](https://www.githubstatus.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

---

💡 **Dica**: Sempre teste localmente antes de fazer deploy. Use `npm run build && npm run preview` para simular produção.
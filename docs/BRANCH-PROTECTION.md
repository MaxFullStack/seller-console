# Branch Protection Configuration

Este documento detalha como configurar as regras de proteção de branches no GitHub para garantir qualidade e segurança no desenvolvimento.

## 🛡️ Visão Geral

As regras de proteção de branches previnem pushes diretos para branches importantes e garantem que todo código passe por revisão e testes antes de ser incorporado.

## 📋 Configuração Passo a Passo

### 1. Acessar Configurações

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Branches**
3. Clique em **"Add classic branch protection rule"**

### 2. Configurar Branch Main

#### Pattern da Branch
```
main
```

#### Proteções Recomendadas

**✅ Require a pull request before merging**
- Força o uso de Pull Requests
- Impede commits diretos na main

**✅ Require approvals**
- Número de aprovações: **1**
- Garante revisão de código

**✅ Require status checks to pass before merging**
- Status checks obrigatórios:
  - `CI/CD Pipeline`
  - `quality-gate`
- Garante que testes passem

**✅ Require branches to be up to date before merging**
- Mantém branches atualizadas antes do merge

**✅ Require conversation resolution before merging**
- Resolve todos os comentários antes do merge

**✅ Require linear history**
- Mantém histórico limpo e linear

### 3. Configurar Branch Staging

#### Pattern da Branch
```
staging
```

#### Proteções Recomendadas

**✅ Require status checks to pass before merging**
- Status checks obrigatórios:
  - `CI/CD Pipeline`
  - `quality-gate`

**✅ Require branches to be up to date before merging**
- Mantém branches atualizadas

## 🔍 Status Checks Disponíveis

Após executar o primeiro workflow, os seguintes status checks estarão disponíveis:

### Pipeline Principal (ci.yml)
- `CI/CD Pipeline` - Pipeline completo
- `setup` - Configuração e cache
- `lint` - Verificação de código (ESLint)
- `typecheck` - Verificação de tipos (TypeScript)
- `format-check` - Verificação de formatação (Prettier)
- `unit-tests` - Testes unitários
- `e2e-tests` - Testes end-to-end
- `build` - Build da aplicação
- `security-audit` - Auditoria de segurança
- `quality-gate` - Gate de qualidade final

### Pipeline de Deploy (deploy.yml)
- `determine-environment` - Determinação do ambiente
- `build-and-deploy` - Build e deploy

## ⚙️ Configuração Avançada

### Para Projetos com Múltiplos Desenvolvedores

**✅ Require review from Code Owners**
- Requer revisão de proprietários do código
- Configure arquivo `.github/CODEOWNERS`

**✅ Require approval of the most recent reviewable push**
- Nova aprovação necessária após mudanças

**✅ Dismiss stale pull request approvals when new commits are pushed**
- Remove aprovações antigas após novos commits

### Para Projetos Enterprise

**✅ Require signed commits**
- Commits devem ser assinados digitalmente

**✅ Require deployments to succeed before merging**
- Deploy de staging deve passar antes do merge

## 🚨 Troubleshooting

### Status Checks Não Aparecem

**Problema:** Na configuração inicial, os status checks podem não aparecer.

**Soluções:**

1. **Aguardar primeiro workflow:**
   ```bash
   git add .
   git commit -m "feat: trigger first workflow"
   git push origin main
   ```

2. **Verificar workflows:**
   - Acesse `Actions` no GitHub
   - Confirme que workflows estão executando

3. **Configurar depois:**
   - Crie a regra sem status checks
   - Edite depois para adicionar os checks

### Branch Protection Muito Restritiva

**Problema:** Não consegue fazer mudanças urgentes.

**Soluções:**

1. **Usar bypass temporário:**
   - Como admin, pode fazer override
   - Use apenas em emergências

2. **Hotfix workflow:**
   ```bash
   git checkout main
   git checkout -b hotfix/urgent-fix
   # Fazer mudanças
   git push origin hotfix/urgent-fix
   # Criar PR normal
   ```

### CI/CD Falhando

**Problema:** Status checks sempre falham.

**Verificações:**

1. **Logs do workflow:**
   ```bash
   # Ver no GitHub Actions ou via CLI
   gh run list
   gh run view [RUN_ID] --log
   ```

2. **Testar localmente:**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

## 📚 Melhores Práticas

### 1. Configuração Progressiva
- Comece com proteções básicas
- Adicione mais rigor conforme a equipe cresce

### 2. Educação da Equipe
- Documente o processo de PR
- Treine desenvolvedores sobre as regras

### 3. Revisão Regular
- Avalie eficácia das regras mensalmente
- Ajuste conforme necessário

### 4. Exceções Documentadas
- Documente quando bypass é aceitável
- Mantenha log de exceções

## 🔗 Links Úteis

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Actions Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [Code Owners Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

**Nota:** Essas configurações trabalham em conjunto com os workflows definidos em `.github/workflows/` para criar um ambiente de desenvolvimento seguro e confiável.
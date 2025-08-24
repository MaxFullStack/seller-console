# GitHub Workflows Guide

## Quick Reference

### 🚀 Production Deployment
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test locally
npm run test:unit
npm run test:integration
npm run lint

# 3. Create pull request to main
gh pr create --title "feat: my feature" --body "Description"

# 4. Merge PR (triggers CI → Deploy pipeline automatically)
```

### 🔄 Staging Deployment
```bash
# 1. Push to staging branch
git checkout staging
git merge feature/my-feature
git push origin staging

# 2. Automatic CI → Deploy to staging environment
```

### 🛠️ Manual Operations
```bash
# Run specific workflow
gh workflow run "CI/CD Pipeline"
gh workflow run "Deploy to GitHub Pages" --ref main

# Check workflow status
gh run list --limit 5

# View workflow details
gh run view <run-id> --log
```

## Pipeline Status Dashboard

### Current Workflows Status
- ✅ **CI Pipeline**: Validates all code changes
- ✅ **Deploy Pipeline**: Deploys after CI success
- ✅ **Security Pipeline**: Weekly security scans
- ✅ **Maintenance Pipeline**: Automated updates

### Quality Gates
All deployments require:
- [ ] ESLint passing
- [ ] TypeScript type checking
- [ ] Prettier formatting
- [ ] Unit tests (88 tests)
- [ ] Integration tests (18 tests)
- [ ] E2E tests
- [ ] Security audit
- [ ] Build verification

## Environment URLs

### Production
- **URL**: https://maxfullstack.github.io/seller-console/
- **Branch**: main
- **Auto-deploy**: ✅ After CI success

### Staging  
- **URL**: https://maxfullstack.github.io/seller-console/staging/
- **Branch**: staging
- **Auto-deploy**: ✅ After CI success

## Workflow Triggers

| Workflow | Push | PR | Schedule | Manual |
|----------|------|----|---------:|--------|
| CI Pipeline | main, dev, staging | main, dev | - | ✅ |
| Deploy Pipeline | After CI success | - | - | ✅ |
| Security Pipeline | main | main | Weekly | ✅ |
| Maintenance | - | - | Weekly | ✅ |

## Troubleshooting

### ❌ CI Pipeline Failing
1. **Check quality gates**: Review linting, formatting, tests
2. **View logs**: `gh run view <run-id> --log`
3. **Fix locally**: Run `npm run lint:fix` and `npm test`

### ❌ Deploy Pipeline Not Running  
1. **Check CI status**: CI must pass first
2. **Verify branch**: Ensure pushing to main/staging
3. **Manual trigger**: `gh workflow run "Deploy to GitHub Pages"`

### ❌ Tests Failing
```bash
# Run specific test types
npm run test:unit          # Fast unit tests
npm run test:integration   # Integration tests  
npm run test:e2e          # End-to-end tests

# Debug specific test
npm test -- --reporter=verbose MyComponent.test.tsx
```

### ❌ Build Failing
```bash
# Check TypeScript errors
npm run typecheck

# Check build locally
npm run build

# Check formatting
npm run format
```

## Security & Compliance

### Automated Security
- **CodeQL Analysis**: Weekly scans on main branch
- **Dependency Updates**: Automated PRs for security patches
- **Vulnerability Alerts**: Immediate notifications

### Manual Security Checks
```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm audit --audit-level high

# Update dependencies
npm update
```

## Performance Monitoring

### Workflow Performance
- **CI Pipeline**: ~3-5 minutes
- **Deploy Pipeline**: ~2-3 minutes
- **Security Pipeline**: ~5-10 minutes

### Optimization Tips
- Use `npm ci` instead of `npm install` in CI
- Cache node_modules between runs
- Run tests in parallel where possible

## Branch Strategy

### Main Branch (`main`)
- **Protected**: Requires PR and CI success
- **Auto-deploy**: Production after CI passes
- **Security**: Full CodeQL analysis

### Staging Branch (`staging`) 
- **Semi-protected**: Requires CI success
- **Auto-deploy**: Staging environment
- **Testing**: Full test suite required

### Development Branch (`dev`)
- **Open**: Direct pushes allowed
- **Validation**: CI pipeline runs
- **Purpose**: Feature integration

### Feature Branches (`feature/*`)
- **Temporary**: Created for specific features
- **Testing**: Full CI validation on PR
- **Cleanup**: Deleted after merge

## Best Practices

### Before Committing
```bash
# Run full validation locally
npm run lint:fix
npm run typecheck  
npm run test
npm run build
```

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Run local validation
4. Create PR with clear description
5. Address review feedback
6. Merge after CI passes

### Deployment Process
1. Changes automatically deploy after CI success
2. Monitor deployment status in Actions tab
3. Verify deployment at target URL
4. Monitor for any runtime errors

## Emergency Procedures

### Rollback Production
```bash
# Option 1: Revert commit and push
git revert <commit-hash>
git push origin main

# Option 2: Manual deployment from previous commit
gh workflow run "Deploy to GitHub Pages" --ref <previous-commit>
```

### Hotfix Process
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Make minimal fix
# 3. Test thoroughly
npm test

# 4. Create PR directly to main
gh pr create --title "hotfix: critical issue" --base main

# 5. Merge immediately after CI passes
```

### Disable Workflows
```bash
# Disable workflow (requires repo admin)
gh workflow disable "Deploy to GitHub Pages"

# Re-enable when ready
gh workflow enable "Deploy to GitHub Pages"
```

## Monitoring & Alerts

### GitHub Actions Dashboard
- Visit: https://github.com/maxfullstack/seller-console/actions
- Monitor: Recent workflow runs and status
- Alert: Failed runs appear with red status

### Email Notifications
Configure in GitHub Settings → Notifications:
- Workflow failures
- Security alerts  
- Dependency vulnerabilities

### Slack Integration (Optional)
Add Slack webhook for workflow notifications:
```yaml
- name: Slack Notification
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```
# Pipeline de engenharia do Jove

## Objetivos

- manter velocidade com segurança
- reduzir regressões
- padronizar commits, PRs e releases
- garantir deploy reproduzível

## Fluxo recomendado

1. Crie uma branch curta a partir de `main`.
2. Implemente em pequenos commits usando Conventional Commits.
3. Antes de cada push, o pre-commit formata e valida arquivos staged.
4. O commit-msg valida a mensagem do commit.
5. Abra PR com evidências e checklist.
6. O CI executa validações completas e build de container.
7. Se a mudança impactar release, adicione um changeset.
8. Gere versão com `bun run version-packages`.
9. Crie tag `vX.Y.Z` após merge aprovado.
10. O workflow de release valida o artefato da versão.
11. O deploy é manual por ambiente via workflow com `image_tag`.

## Desenvolvimento diário

```bash
bun install
bun run dev
bun run validate
```

## Qualidade e anti-regressão

Validação padrão do projeto:

```bash
bun run validate
```

Ela executa:

- `format:check`
- `lint`
- `typecheck`
- `test`

Validação de container:

```bash
bun run docker:build
bun run docker:smoke
```

## Política de Git

### Branches

- `main`: sempre estável
- `feature/*`: novas funcionalidades
- `fix/*`: correções
- `chore/*`: manutenção
- `release/*`: preparação excepcional de release

### Commits

Padrão obrigatório: Conventional Commits.

Exemplos:

- `feat: adiciona suporte a novo provider`
- `fix: corrige mapeamento de erro do gateway`
- `chore: atualiza pipeline de CI`

### Pull Requests

Todo PR deve conter:

- objetivo claro
- evidência de teste
- impacto esperado
- documentação atualizada quando aplicável

## Versionamento

O projeto usa Changesets.

Criar changeset:

```bash
bun run changeset
```

Preparar versão:

```bash
bun run version-packages
```

Inspecionar plano de release:

```bash
bun run release:plan
```

## Workflows

### CI

Arquivo: `.github/workflows/ci.yml`

Executa em push para `main` e em PR:

- instalação com lockfile
- validação completa
- build da imagem Docker
- smoke test do container

### Release

Arquivo: `.github/workflows/release.yml`

Executa em `main`, em tags `v*` e manualmente:

- validação completa
- build e push da imagem para o GHCR
- publicação de tags `main`, `sha-*`, `vX.Y.Z` e `latest` quando aplicável

### Deploy

Arquivo: `.github/workflows/deploy.yml`

Deploy contínuo via SSH:

- `staging` automático após release bem-sucedido vindo de `main`
- `production` manual com seleção de tag

Secrets necessários:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- `GHCR_READ_TOKEN`

## Recomendação operacional

- proteja a branch `main`
- exija PR review
- exija CODEOWNERS quando aplicável
- exija CI verde antes de merge
- não permita push direto em `main`
- use environments `staging` e `production` com aprovação para produção
- mantenha `.env` fora do Git
- rode smoke test após cada build de imagem
- publique imagens apenas via workflow de release

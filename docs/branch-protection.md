# Branch protection recomendada

Aplique em `main`:

- bloquear push direto
- exigir pull request antes do merge
- exigir pelo menos 1 review aprovado
- exigir resolução de conversas antes do merge
- exigir status checks obrigatórios:
  - `validate`
  - `docker-verification`
- exigir branch atualizada antes do merge
- exigir histórico linear
- impedir force-push
- impedir delete da branch

## Estratégia de release

- mudanças entram via PR em `main`
- toda mudança versionável recebe changeset
- após merge, valide `bun run release:plan`
- promova release com `bun run release:promote -- 0.1.1`
- a tag `vX.Y.Z` publica imagem no GHCR
- deploy contínuo usa a tag publicada ou `main`

# syntax=docker/dockerfile:1

# ── Base ───────────────────────────────────────────────────────
FROM oven/bun:1.3.14-alpine AS base
WORKDIR /app

# ── Dependências ───────────────────────────────────────────────
FROM base AS deps

# Copia manifests primeiro para aproveitar cache de layers
COPY package.json bun.lock ./
COPY apps/gateway/package.json ./apps/gateway/
COPY packages/core/package.json ./packages/core/
COPY packages/providers/package.json ./packages/providers/
COPY packages/openai-api/package.json ./packages/openai-api/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile --production

# ── Runtime ────────────────────────────────────────────────────
FROM base AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info

# Executa como usuário não-root fornecido pela imagem Bun
COPY --from=deps --chown=bun:bun /app/node_modules ./node_modules
COPY --from=deps --chown=bun:bun /app/packages ./packages

# Copia apenas os arquivos necessários para execução
COPY --chown=bun:bun package.json bun.lock tsconfig.base.json ./
COPY --chown=bun:bun apps/gateway ./apps/gateway
COPY --chown=bun:bun packages/core ./packages/core
COPY --chown=bun:bun packages/providers ./packages/providers
COPY --chown=bun:bun packages/openai-api ./packages/openai-api
COPY --chown=bun:bun packages/shared ./packages/shared

USER bun
EXPOSE 3000

# Healthcheck nativo — sem depender de curl/wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "const r=await fetch('http://localhost:3000/health');if(!r.ok)process.exit(1)"

CMD ["bun", "run", "--cwd", "apps/gateway", "start"]

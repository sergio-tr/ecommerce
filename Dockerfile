# Local CommerceCore API image. Digest resolved 2026-11-17 from
# registry-1.docker.io/library/node:24.22.2-bookworm-slim (multi-arch index).
# The chart sets COMMERCECORE_HTTP_HOST=0.0.0.0. This image does not.
FROM node:24.22.2-bookworm-slim@sha256:01d566e8d94d8c619591d78652babfccd3c6992a3dffa9ed5ab39e11cf6c70e9 AS build

ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
WORKDIR /src

RUN corepack enable && corepack prepare pnpm@11.10.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY nx.json tsconfig.json tsconfig.base.json ./
COPY apps/commercecore-api apps/commercecore-api

RUN printf '\nnode-linker=hoisted\nstore-dir=/src/.pnpm-store\n' >> .npmrc \
  && pnpm install --frozen-lockfile \
  && pnpm exec tsc -p apps/commercecore-api/tsconfig.app.json \
  && pnpm prune --prod

FROM node:24.22.2-bookworm-slim@sha256:01d566e8d94d8c619591d78652babfccd3c6992a3dffa9ed5ab39e11cf6c70e9 AS runtime

WORKDIR /app
COPY --from=build --chown=node:node /src/node_modules ./node_modules
COPY --from=build --chown=node:node /src/dist/apps/commercecore-api ./dist/apps/commercecore-api
COPY --from=build --chown=node:node /src/package.json ./package.json

USER node
ENV NODE_ENV=production
ENV HOME=/tmp
ENV TMPDIR=/tmp
ENV COMMERCECORE_ENV=local
ENV COMMERCECORE_HTTP_PORT=3000
ENV COMMERCECORE_LOG_LEVEL=info
ENV COMMERCECORE_SERVICE_VERSION=0.0.0

EXPOSE 3000
CMD ["node", "dist/apps/commercecore-api/main.js"]

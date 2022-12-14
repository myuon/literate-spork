FROM node:16 as builder
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:16 as deps
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile --production

FROM gcr.io/distroless/nodejs:16
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=deps --chown=nonroot:nonroot /app/node_modules ./node_modules
USER nonroot

CMD ["dist/index.js"]

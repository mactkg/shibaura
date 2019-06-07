FROM maxmcd/deno:slim

WORKDIR /shibaura
COPY src ./src
COPY tests ./tests
COPY config.toml ./

RUN deno fetch /shibaura/src/server.ts

ENV PORT 8080
EXPOSE 8080
CMD deno run -A /shibaura/src/server.ts

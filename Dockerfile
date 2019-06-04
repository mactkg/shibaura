FROM maxmcd/deno:slim

COPY . .

RUN deno fetch ./src/server.ts

EXPOSE 8080
CMD deno run -A ./src/server.ts

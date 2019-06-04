FROM maxmcd/deno:slim

COPY . .

RUN deno fetch ./server.ts

EXPOSE 8080
CMD deno run -A ./server.ts

run: build
	docker run --rm -it -p 8080:8080 shibaura

build: Dockerfile server.ts server_test.ts
	docker build -t shibaura .

test: build
	docker run --rm -t shibaura deno run -A ./server_test.ts

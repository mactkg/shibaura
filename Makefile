run: build
	docker run --rm -it -p 8080:8080 shibaura

build: Dockerfile src tests
	docker build -t shibaura .

test: build
	docker run --rm -t shibaura deno run -A ./tests/server.ts

run: build
	docker run --rm -it -p 8080:8080 shibaura

build: Dockerfile src tests
	docker build -t shibaura .

test: tests src
	ls ./tests/*.ts | xargs -I_ deno run -A _

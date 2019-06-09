run: build
	docker run --rm -it -p 8080:8080 shibaura

lint_tests: tests
	npx eslint --fix tests/*.ts

lint_src: src
	npx eslint --fix src/*.ts

lint: lint_src lint_tests

build: Dockerfile src tests
	docker build -t shibaura .

test: tests src
	ls ./tests/*.ts | xargs -I_ deno run -A _

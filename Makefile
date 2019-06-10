DOCKER_IMAGE_NAME ?= shibaura

run: build
	docker run --rm -it -p 8080:8080 ${DOCKER_IMAGE_NAME}

lint_tests: tests
	npx eslint --fix tests/*.ts

lint_src: src
	npx eslint --fix src/*.ts

lint: lint_src lint_tests

build: Dockerfile src tests
	docker build -t ${DOCKER_IMAGE_NAME} .

deploy_cloud_run: build
	docker tag ${DOCKER_IMAGE_NAME} ${GCP_IMAGE_NAME}
	docker push ${GCP_IMAGE_NAME}
	gcloud beta run deploy ${GCP_CLOUD_RUN_SERVICE_NAME} --allow-unauthenticated --image=${GCP_IMAGE_NAME} --project=${GCP_PROJECT}

test: tests src
	ls ./tests/*.ts | xargs -I_ deno run -A _

.PHONY: start build build-dev build-dev-source build-prod watch;

BIN = ./node_modules/.bin

start:
	@npm start

build: build-dev
build: build-prod

build-dev: export NODE_ENV=development
build-dev: export NODE_SOURCE=false
build-dev:
	@webpack --colors --progress

build-dev-source: export NODE_ENV=development
build-dev-source: export NODE_SOURCE=true
build-dev-source:
	@webpack --colors --progress

build-prod: export NODE_ENV=production
build-prod:
	@webpack --colors --progress
	@npm version patch

watch: export NODE_ENV=development
watch:
	@webpack --watch --colors --progress

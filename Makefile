.DEFAULT: fmt

.PHONY: md
md:
	npx @renoirb/conventions-use-prettier -w *.md

.PHONY: fmt
fmt: md
	npx @renoirb/conventions-use-prettier -w **/*.mjs

.PHONY: dev-server
dev-server:
	deno run --allow-net --allow-read scripts/dev-server.ts


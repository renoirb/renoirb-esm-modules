.DEFAULT: fmt

.PHONY: fmt
fmt:
	npx @renoirb/conventions-use-prettier -w *.md
	npx @renoirb/conventions-use-prettier -w **/*.mjs

.PHONY: dev-server
dev-server:
	deno run --allow-net --allow-read scripts/dev-server.ts


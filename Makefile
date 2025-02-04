.DEFAULT: fix

.PHONY: fix
fix:
	npx @renoirb/conventions-use-prettier -w *.md
	npx @renoirb/conventions-use-prettier -w **/*.mjs
	npx @renoirb/conventions-use-prettier -w **/*.ts

.PHONY: dev-server
dev-server:
	deno run --allow-net --allow-read scripts/dev-server.ts
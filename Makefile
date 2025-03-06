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

# @TODO Make sure we keep dist/http WITH ALL RELEASES otherwise we will lose because push-dir pushes only what's in dist/
.PHONY: publish
publish:
	npx push-dir --dir=dist/http --branch=published --local-branch-name=main --cleanup


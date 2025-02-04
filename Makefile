.DEFAULT: fix

.PHONY: fix
fix:
	npx @renoirb/conventions-use-prettier -w *.md

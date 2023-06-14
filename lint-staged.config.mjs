export default {
  "*.{ts,json,cjs,mjs,js}": ["eslint --fix"],
  "*.md": ["npx markdownlint-cli --ignore CHANGELOG.md"],
  "package.json": ["npx scriptlint --fix"],
}

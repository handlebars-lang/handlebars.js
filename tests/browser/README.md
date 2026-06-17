# Browser Tests with Playwright

These tests execute Mocha tests from the `spec`-folder in multiple browsers.

## Using Docker

Execute the following commands in the project root:

```bash
pnpm install
pnpm run build
docker pull mcr.microsoft.com/playwright:focal
docker run -it --rm --volume $(pwd):/srv/app --workdir /srv/app --ipc=host mcr.microsoft.com/playwright:focal sh -c "corepack enable && pnpm run test:browser"
```

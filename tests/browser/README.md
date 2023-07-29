# Browser Tests with Playwright

These tests execute Mocha tests from the `spec`-folder in multiple browsers.

## Using Docker

Execute the following commands in the project root:

```bash
npm install
npx grunt prepare
docker pull mcr.microsoft.com/playwright:focal
docker run -it --rm --volume $(pwd):/srv/app --workdir /srv/app --ipc=host mcr.microsoft.com/playwright:focal npm run test:browser
```

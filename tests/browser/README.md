# Browser Tests with Playwright

These tests execute Mocha tests from the `spec`-folder in multiple browsers.

## Using Docker

Execute the following commands in the project root:

```bash
npm install
npx grunt prepare
docker run -it --rm --volume $(pwd):/srv/app --workdir /srv/app --ipc=host mcr.microsoft.com/playwright:v1.44.1-jammy npm run test:browser
```
This is a [Next.js](https://nextjs.org/) project.

## Environment setup

Create `.env` file based on `.env.{brandCode}` in the root directory of the project

## Development

Install dependencies

```bash
yarn
```

Run the development server:

```bash
yarn dev:{brandCode}
```

Open [http://localhost:3000/en/hotel](http://localhost:3000/en/hotel) with your browser to see the development version (Slower).

Build the app:

```bash
yarn build:{brandCode}
```

Start the app:

```bash
yarn start:{brandCode}
```

Open [http://localhost:3000/en/hotel](http://localhost:3000/en/hotel) with your browser to see the production version (Faster).

## Style changes

In order to change global theme for a new brand, you have to create a new `.env.brandCode` file that will contain theme configurations about new brand

Change NEXT_PUBLIC_BRAND_CODE env variable:

```bash
NEXT_PUBLIC_BRAND_CODE=brandCode
```

After creation of new files you have to do following steps:

1. To restart the development server
2. To drop cache by deleting .next folder

Always import components using absolute path `components/` even if this import occurs within components folder
Example: `components/shared/PageWrapper/PageWrapper`

## Configuration

To configure a new property, you need to create a new configurations in GET_CONFIGURATION file

## PWA

Follow these steps in order to enable PWA:

1. Create `manifest.brandCode.json` in the public folder
2. Configure `NEXT_PUBLIC_THEME_COLOR` variable inside `.env.brandCode` file

## Note

[Naming conventions to be followed](https://hudini.atlassian.net/wiki/spaces/~635a709413f37118d726ca66/blog/2023/12/22/261357570/Naming+Conventions?atlOrigin=eyJpIjoiMDgzNGU3MGRhYjc1NDU3OTlmZGFmOWFiNjk3ZjE1YjEiLCJwIjoiYyJ9)

## Infinite

Below document contains necessary information about 'INFINITE'

[INFINITE](https://hudini.atlassian.net/wiki/spaces/~635a709413f37118d726ca66/pages/250413065/INFINITE)

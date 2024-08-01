This is a [Next.js](https://nextjs.org/) project.

## Initial Setup

Clone repository

```bash
git clone https://Som_06@bitbucket.org/hudini-20/pwa-product.git
```

Install dependencies

```bash
yarn
```

## Development

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

For the purpose of Development & Testing:

`brandCode=stage`

W/O Authentication

`hotel=infinite`

W/ Authentication

`hotel=infinite-auth`

⚠️ **CAUTION:** Do not use `brandCode=production` in the browser.

## Styles

In order to change global theme for a new brand, you have to create a new `.globals.brandCode.scss` containing theme configurations

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

To configure a new property, you need to create a new configuration in GET_CONFIGURATION file

## PWA

Follow these steps in order to enable PWA:

1. Create `brandCode.ico`
2. Create `manifest.brandCode.json` in the public folder

## Note

[Naming conventions to be followed](https://hudini.atlassian.net/wiki/spaces/~635a709413f37118d726ca66/blog/2023/12/22/261357570/Naming+Conventions?atlOrigin=eyJpIjoiMDgzNGU3MGRhYjc1NDU3OTlmZGFmOWFiNjk3ZjE1YjEiLCJwIjoiYyJ9)

## Infinite

Below document contains necessary information about **INFINITE**

[INFINITE](https://hudini.atlassian.net/wiki/spaces/~635a709413f37118d726ca66/pages/250413065/INFINITE)

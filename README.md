This is a [Next.js](https://nextjs.org/) project.

## Environment setup

Create `.env` file based on `.env.example` in the root directory of the project

## Production

Install dependencies

```bash
yarn install
```

Build the app

```bash
yarn build
```

Export the app

```bash
yarn export
```

The website will be exported in the /out folder in the root directory of the project

## Development

Install dependencies

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Style changes

In order to changes styles for another hotel you have to create another `.env.hotelName` file that will contain data about new hotel

Change NEXT_PUBLIC_HOTEL_CODE env variable:

```bash
NEXT_PUBLIC_HOTEL_CODE=hotelName
```

Copy every icon from the folder

```bash
assets/icons/default
```

into the folder

```bash
assets/icons/hotelName
```

Then you have to create a file in the directory of components which styles you want to overwrite

Example:

`Card.module.hotelName.scss`

Add new scripts to the package.json folder

```bash
"scripts": {
    "dev:melia": "env-cmd -f .env.melia yarn next dev",
    "build:melia": "env-cmd -f .env.melia yarn build",
}
```

## Custom flow creation

In the `pages` folder flows are separated by maps `check-in.alpha` `dining.alpha`
These maps have `index.tsx` - it is the first page of the flow, it should contain links/buttons that are linking to another pages.

In the `.env` file you have to specify the version for the each of the existing flows

```bash
NEXT_PUBLIC_CHECK_IN_FLOW_VERSION='alpha'
NEXT_PUBLIC_CHECK_OUT_FLOW_VERSION='alpha'
NEXT_PUBLIC_DINING_FLOW_VERSION='alpha'
NEXT_PUBLIC_HOUSEKEEPING_FLOW_VERSION='alpha'
NEXT_PUBLIC_ROOM_CONTROLS_FLOW_VERSION='alpha'
```

Also in case if you add a new page to the flow, you have also to add the new route into the `pwa-common\utils\availablePaths.ts` file

After creation of new files you have to do following steps:

1. To restart the development server
2. To drop cache by deleting .next folder

## Custom component creation

In order to creating a costom component for another hotel you have to create `.env.hotelName` file that will contain data about new hotel

Change NEXT_PUBLIC_HOTEL_CODE env variable:

```bash
NEXT_PUBLIC_HOTEL_CODE=hotelName
```

Inside the map that contains component, the original component name should look like:
`ComponentName.tsx`

You have to create another file with custom logic defined in it:
`ComponentName.hotelName.tsx`

After creation of new files you have to do following steps:

1. To restart the development server
2. To drop cache by deleting .next folder

Also, whenever you import components you have to import them using absolute path `components/` even if this import occurs within components folder
Example: `components/uiBuilder/CAROUSEL/CAROUSEL_WO_BG/CAROUSEL_WO_BG`

## PWA

Follow these steps in order to enable PWA:

1. Create `manifest.hotelName.json` in the public folder
2. Configure `NEXT_PUBLIC_THEME_COLOR` variable inside `.env.hotelName`

# Tasks that are not closed yet because of the back-end:

- Room controls API integration
- Notifications page API binding
- Housekeeping order request
- TV controls API integration
- In room dining confirmation API request

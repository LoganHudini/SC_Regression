/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const withPWA = require('next-pwa');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const regexEqual = (x, y) => {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { scrollRestoration: true },
  reactStrictMode: true,
  swcMinify: false,
  webpack(config, options) {
    const hotelCode = process.env.NEXT_PUBLIC_HOTEL_CODE || 'default';

    // SCSS configuration for the 'Component.hotelName.scss'
    const oneOf = config.module.rules.find((rule) => typeof rule.oneOf === 'object');

    if (oneOf) {
      // Find the module which targets *.scss|*.sass files
      const moduleSassRule = oneOf.oneOf.find((rule) =>
        regexEqual(rule.test, /\.module\.(scss|sass)$/),
      );

      if (moduleSassRule) {
        // Get the config object for sass-loader plugin
        const sassLoader = moduleSassRule.use.find(({ loader }) => loader.includes('sass-loader'));
        if (sassLoader) {
          sassLoader.options = {
            ...sassLoader.options,
            additionalData: async (content, loaderContext) => {
              let updatedContent = content;

              if (hotelCode) {
                const { resourcePath } = loaderContext;
                const parsedPath = path.parse(resourcePath);

                const fileNameWithoutExtension = parsedPath.name;
                const fileLocation = parsedPath.dir;

                const fileToImport = `${fileLocation}/${fileNameWithoutExtension}.${hotelCode}.scss`;

                if (fs.existsSync(fileToImport)) {
                  updatedContent = `${updatedContent} @import './${fileNameWithoutExtension}.${hotelCode}';`;
                }

                const styleVariablesPath = path.join(
                  __dirname,
                  `./styles/variables.${hotelCode}.scss`,
                );

                if (fs.existsSync(styleVariablesPath)) {
                  updatedContent = `@import '@styles/variables.${hotelCode}'; ${updatedContent}`;
                } else {
                  updatedContent = `@import '@styles/variables'; ${updatedContent}`;
                }

                return updatedContent;
              }

              updatedContent = `@import '@styles/variables'; ${updatedContent}`;

              return updatedContent;
            },
          };
        }
      }
    }

    // Import overrite logic for the Component.hotelName.tsx
    if (hotelCode) {
      config.module.rules.push({
        test: /\.(tsx|ts)$/,
        include: [path.resolve(__dirname, 'components'), path.resolve(__dirname, 'pages')],
        use: [
          options.defaultLoaders.babel,
          {
            loader: 'string-replace-loader',
            options: {
              search:
                /import(?:(?:(?:[ \n\t]+([^ *\n\t{},]+)[ \n\t]*(?:,|[ \n\t]+))?([ \n\t]*\{(?:[ \n\t]*[^ \n\t"'{}]+[ \n\t]*,?)+\})?[ \n\t]*)|[ \n\t]*\*[ \n\t]*as[ \n\t]+([^ \n\t{}]+)[ \n\t]+)from[ \n\t]*(?:['"])([^'"\n]+)(['"])/g,
              replace: (match, _p1, _p2, _p3, p4) => {
                if (p4.startsWith('components')) {
                  const customComponentPath = `${p4}.${hotelCode}`;

                  return fs.existsSync(path.resolve(__dirname, `${customComponentPath}.tsx`))
                    ? match.replace(p4, customComponentPath)
                    : match;
                } else {
                  return match;
                }
              },
              flags: 'g',
            },
          },
        ],
      });
    }

    // Icons override logic
    // config.resolve.alias['@icons'] = path.resolve(__dirname, `assets/icons/${hotelCode}`);

    // Multibrand PWA logic
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'public', `manifest.${hotelCode}.json`),
            to: path.join(__dirname, 'public', 'manifest.json'),
            noErrorOnMissing: true,
          },
        ],
      }),
    );

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  trailingSlash: true,
};

module.exports = withPWA({
  dest: 'public',
  register: true,
  sw: 'service-worker.js',
  disable: process.env.NODE_ENV === 'development',
  skipWaiting: true,
})(nextConfig);

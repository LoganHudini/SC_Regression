/* eslint-disable @typescript-eslint/no-var-requires */
const withPWA = require('next-pwa');

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
  webpack(config) {
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
            additionalData: async (content) => {
              let updatedContent = content;

              updatedContent = `@import '@styles/variables'; ${updatedContent}`;

              return updatedContent;
            },
          };
        }
      }
    }

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

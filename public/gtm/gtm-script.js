import { GA_MEASUREMENT_ID } from '../../core/graphql/endpoints';

(function () {
  const gaID = GA_MEASUREMENT_ID; // Replace with your actual GA_MEASUREMENT_ID

  // Ensure the dataLayer is initialized before loading the script
  window.dataLayer = window.dataLayer || [];

  // Load Google Tag Manager script asynchronously
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaID}`;
  document.head.appendChild(script);

  script.onload = function () {
    // Initialize Google Analytics once the GTM script is loaded
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  };
})();

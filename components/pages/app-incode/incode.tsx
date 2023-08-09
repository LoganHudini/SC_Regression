const incodeConfig = {
  apiURL: 'https://demo-api.incodesmile.com/', // provided by Incode
  apiKey: '3a9264b3cdec06942821657097c7843b1c6eee30', // provided by Incode
};

declare global {
  interface Window {
    OnBoarding: any;
  }
}

async function startIncode() {
  const incode = await window.OnBoarding.create(incodeConfig);
  await incode.warmup();
  return incode;
}

export default startIncode;

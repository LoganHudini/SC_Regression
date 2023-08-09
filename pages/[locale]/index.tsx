import { GetStaticProps, NextPage } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { getStaticPaths } from 'utils/getStatic';
import { getHamburgerProps } from 'utils/hamburger/getHamburgerProps';

export { getStaticPaths };

const Home: NextPage = () => {
  const [color] = useState('#f0f0f0');

  return (
    <div>
      <style>{`:root { --custom-color: ${color};}`}</style>
      <h1 className='styled-element'>Hello</h1>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'], i18nConfig)),
      ...(await getHamburgerProps()),
    },
  };
};

export default Home;

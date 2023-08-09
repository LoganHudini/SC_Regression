import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { client } from 'core/graphql/client';
import { IGetHotelInfoApiResponse, GET_HOTEL_INFO } from 'core/graphql/queries/GET_HOTEL_INFO';
import { GetStaticProps, NextPage } from 'next';
import urlSlug from 'url-slug';
import Head from 'next/head';
import Link from 'utils/link';
import React, { useEffect } from 'react';
import { getStaticPaths } from 'utils/getStatic';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { IHamburgerProps, getHamburgerProps } from 'utils/hamburger/getHamburgerProps';
import { availablePaths } from 'utils/availablePaths';
import { HOME_PAGE } from 'core/graphql/endpoints';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';

export { getStaticPaths };

interface IHomePageProps {
  paths: {
    path: string;
    name: string;
  }[];
}

const CHECK_IN_FLOW = [
  availablePaths.GET_RESERVATION,
  availablePaths.ABOUT_YOUR_STAY,
  availablePaths.CHECK_IN_PAYMENT,
  availablePaths.CHECK_IN,
  availablePaths.GUEST_INFORMATION_INPUT,
  availablePaths.GUEST_INFORMATION,
  availablePaths.PERSONALIZE_YOUR_ROOM,
  availablePaths.PRE_CHECK_IN_CONFIRMATION,
  availablePaths.RESERVAION_CONFIRMATION,
  availablePaths.ROOM_ASSIGNED,
  availablePaths.ROOM_DETAILS,
  availablePaths.SELECT_ROOM,
  availablePaths.UPGRADES,
];

const CHECK_OUT_FLOW = [
  availablePaths.BILL,
  availablePaths.CHECKOUT_CONFIRMATION,
  availablePaths.CHECKOUT_PAYMENT,
];

const HOUSEKEEPING_FLOW = [
  availablePaths.HOUSEKEEPING,
  availablePaths.HOUSEKEEPING_CHECKBOX,
  availablePaths.HOUSEKEEPING_QUANTITY,
  availablePaths.HOUSEKEEPING_RESERVATION_CONFIRMATION,
];

const RESERVATION_FLOW = [
  availablePaths.TABLE_RESERVATION,
  availablePaths.TABLE_RESERVATION_DETAILS,
  availablePaths.TABLE_RESERVATION_TIME,
  availablePaths.TABLE_RESERVATION_CONFIRMATION,
];

const ROOM_CONTROLS = [
  availablePaths.ROOM_CONTROLS_TV_CHANNEL,
  availablePaths.ROOM_CONTROLS_TV_LIST,
  availablePaths.ROOM_CONTROLS,
  availablePaths.ROOM_CONTROLS_TV,
];

const DINING_FLOW = [
  availablePaths.DINING,
  availablePaths.DINING_DETAILS,
  availablePaths.DINING_MENU,
  availablePaths.DINING_ORDER_SUMMARY,
  availablePaths.DINING_RESERVATION_CONFIRMATION,
];

const AVAILABLE_PAGES = [
  availablePaths.TRIPS,
  availablePaths.LANGUAGE,
  availablePaths.CHAT,
  availablePaths.NOTIFICATIONS,
];

const HomePage: NextPage<IHomePageProps & IHamburgerProps> = ({ paths, hamburger, pages }) => {
  // const navigate = useLocalizedRouter();

  // useEffect(() => {
  //   navigate(`/${HOME_PAGE}`);
  // }, [navigate]);

  return (
    <>
      <Head>
        <title>Hudini PWA</title>
      </Head>
      <Header screenTitle='Hudini PWA' />
      <PageWrapper hamburger={hamburger} pages={pages} displayBottomMenu>
        <h1 style={{ marginTop: '25px' }}>Wecome to the hudini-pwa-sdk</h1>
        <h2 style={{ marginTop: '25px' }}>Available routes:</h2>
        <hr />
        <h3>Pages:</h3>
        <ul>
          {AVAILABLE_PAGES.map((path) => (
            <li key={path}>
              <Link href={path}>{path}</Link>
            </li>
          ))}
        </ul>
        <h3>Check-in flow:</h3>
        <ul>
          {CHECK_IN_FLOW.map((path) => (
            <li key={path}>
              <Link href={path}>{path}</Link>
            </li>
          ))}
        </ul>
        <h3>Check-out flow:</h3>
        <ul>
          {CHECK_OUT_FLOW.map((path) => (
            <li key={path}>
              <Link href={path}>{path}</Link>
            </li>
          ))}
        </ul>
        <h3>Reservation flow:</h3>
        <ul>
          {RESERVATION_FLOW.map((path) => (
            <li key={path}>
              <Link href={path}>{path}</Link>
            </li>
          ))}
        </ul>
        <h3>IRD flow:</h3>
        <ul>
          {DINING_FLOW.map((path) => (
            <li key={path}>
              <Link href={path}>{path}</Link>
            </li>
          ))}
        </ul>
        <h3>Housekeeping flow:</h3>
        <ul>
          {HOUSEKEEPING_FLOW.map((path) => (
            <li key={path}>
              <Link href={path}>{path}</Link>
            </li>
          ))}
        </ul>
        <h3>Room controls flow:</h3>
        <ul>
          {ROOM_CONTROLS.map((path) => (
            <li key={path}>
              <Link href={path}>{path}</Link>
            </li>
          ))}
        </ul>
        <hr />
        <h3>UI builder pages</h3>
        <ul>
          {paths.map((path) => (
            <li key={path.path}>
              <Link href={`/${path.path}`}>{path.name}</Link>
            </li>
          ))}
        </ul>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  const { data } = await client.query<IGetHotelInfoApiResponse>({
    query: GET_HOTEL_INFO,
  });

  const paths = data.listUiBuilderPages
    .filter((page) => page.status === 'Published')
    .map((el) => {
      let pageName = urlSlug(el.name);

      if (el.name === HOME_PAGE) {
        pageName = '';
      }

      return { path: pageName, name: el.name };
    });

  return {
    props: {
      paths,
      ...(await serverSideTranslations(locale as string, ['common'], i18nConfig)),
      ...(await getHamburgerProps()),
    },
  };
};

export default HomePage;

/* eslint-disable camelcase */
import { CURRENCY, GA_MEASUREMENT_ID } from 'core/graphql/endpoints';
import { getHotelName } from './fetchConfigs';

declare global {
  interface Window {
    gtag: any;
  }
}

const hotelName = getHotelName();

const gtag = typeof window !== 'undefined' && window.gtag;

export const pageView = (url: string, title: string) => {
  gtag &&
    gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: title,
      client_id: hotelName,
    });
};

export const analyticsEvent = (item: any) => {
  gtag &&
    gtag('event', item?.action, {
      event_category: item?.category,
      event_label: item?.label,
      value: item?.value,
    });
};

export const fAndBOrderEvent = (order: any) => {
  gtag &&
    gtag('event', 'purchase', {
      transaction_id: order?.id,
      value: order?.totalAmount,
      currency: CURRENCY,
      items: order?.items?.map((item: any, index: number) => ({
        item_name: item?.name,
        index: index,
        item_brand: 'F&B Dining',
        item_category: 'F&B Dining Order',
        item_variant: item?.customisations[0]?.name,
        price:
          item?.amount * item?.count +
          item?.addons?.reduce((acc: number, addon: any) => acc + addon?.price, 0)?.toFixed(2),
        quantity: item?.count,
      })),
    });
};

export const irdOrderEvent = (order: any) => {
  gtag &&
    gtag('event', 'purchase', {
      transaction_id: order?.id,
      value: order?.totalAmount,
      currency: CURRENCY,
      items: order?.items?.map((item: any, index: number) => ({
        item_name: item?.name,
        index: index,
        item_brand: 'In-Room Dining',
        item_category: 'In-Room Dining Order',
        item_variant: item?.customisations[0]?.name,
        price:
          item?.amount * item?.count +
          item?.addons?.reduce((acc: number, addon: any) => acc + addon?.price, 0)?.toFixed(2),
        quantity: item?.count,
      })),
    });
};

export const viewItemEvent = (item: any) => {
  gtag &&
    gtag('event', 'view_item', {
      currency: CURRENCY,
      value: item?.price,
      items: [
        {
          item_id: item?.id,
          item_name: item?.name,
          price: item?.price,
        },
      ],
    });
};

export const addToCartEvent = (item: any) => {
  gtag &&
    gtag('event', 'add_to_cart', {
      currency: CURRENCY,
      value: item?.price,
      items: [
        {
          item_id: item?.id,
          item_name: item?.name,
          price: item?.price,
          quantity: item?.quantity,
        },
      ],
    });
};

export const serviceRequestEvent = (order: any) => {
  gtag &&
    gtag('event', 'purchase', {
      transaction_id: order?.id,
      items: order?.items?.map((item: any) => ({
        item_name: item?.name?.split('X')[0],
        index: item?.id,
        item_brand: 'Service Requests',
        item_category: 'Service Request Order',
        quantity: item?.name?.split('X')[0],
      })),
    });
};

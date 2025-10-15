export const HOTEL_CODE_ID_MAP: Record<string, string> = {
  'fairmont-mumbai': '1d210111-07b7-4a7f-bbc5-10328a193d41',
  'fairmont-century-plaza': '3e99579b-7d09-4ed1-a0ef-3bd76ecfa088',
  'fairmont-udaipur': 'dd9cea5f-dc4f-4e24-ba21-0c0a629626d6',
};

export const getHotelIdForCode = (code: string): string | undefined => {
  return HOTEL_CODE_ID_MAP[code];
};

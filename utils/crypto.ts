import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

export const decryptData = (encryptedData: any, key: string | undefined = undefined) => {
  if (!SECRET_KEY) {
    throw new Error('SECRET_KEY missing in environment variables');
  }

  try {
    if (encryptedData) {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key ?? SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return null;
  } catch (error) {
    return null;
  }
};

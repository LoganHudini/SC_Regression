import React, { useRef, useCallback } from 'react';
import DocumentScannerIcon from '@icons/DocumentScanner.svg';
import styles from './UploadTravelDocument.module.scss';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { guestInformationStorage } from 'storage/guest-information.storage';
import { readFileAsBase64 } from 'utils/readFileAsBase64';
import produce from 'immer';
import { useTranslation } from 'react-i18next';

export const UploadTravelDocument: React.FC = () => {
  const router = useRouter();

  const { t } = useTranslation('guest-information-input');

  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }, []);

  const guestId = router.query.guestId;

  const guests = useReactiveVar(guestInformationStorage);
  const selectedGuest = guests?.find((guest) => guest.id === guestId);

  const handleDocumentSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || event.target.files.length === 0) {
        // User didn't select a file
        return;
      }

      const file = event.target.files[0];
      const readResult = await readFileAsBase64(file);

      guestInformationStorage(
        produce(guestInformationStorage(), (draft) => {
          const guest = draft?.find((el) => el.id === guestId);

          if (guest?.document) {
            guest.document.base64 = readResult.base64;
            guest.document.contentType = readResult.contentType;
            guest.document.fileName = readResult.fileName;
          }
        }),
      );

      event.target.value = '';
    },
    [guestId],
  );

  return (
    <>
      <button className={styles.uploadDocumentWrapper} onClick={handleClick}>
        <DocumentScannerIcon className={styles.uploadDocumentIcon} />
        <p className={styles.uploadDocumentText}>
          {selectedGuest?.document?.fileName
            ? `${t('Selected file:')}: ${selectedGuest.document.fileName}`
            : t('Scan Travel Document')}
        </p>
      </button>
      <input
        onChange={handleDocumentSelected}
        className={styles.hiddenInput}
        type='file'
        ref={inputRef}
      />
    </>
  );
};

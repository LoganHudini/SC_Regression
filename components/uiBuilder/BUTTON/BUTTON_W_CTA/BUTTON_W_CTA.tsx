import React, { useCallback } from 'react';
import { IConfig } from '../../../../types/UIConfiguration.types';
import { getRedirectLink } from '../../../../utils/getRedirectLink';
import { StyledButton } from '../../../shared/StyledButton/StyledButton';
import styles from './BUTTON_W_CTA.module.scss';
import { useRouter } from 'next/router';
import { flowPathMap } from 'utils/flowPathMap';
import { useCheckedIn } from 'storage/check-in.storage';
interface IButtonProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const BUTTON_W_CTA: React.FC<IButtonProps> = ({ config, paths }) => {
  const router = useRouter();
  const checkinData = useCheckedIn();
  const redirectUrl = getRedirectLink(paths, config.redirectLink?.linkId);

  const onCtaClick = useCallback(() => {
    if (redirectUrl) {
      const LINK = {
        IN_APP: `${router.query.locale ? `/${router.query.locale}` : ''}/${redirectUrl}`,
        EXTERNAL: redirectUrl,
        FLOW: `${router.query.locale ? `/${router.query.locale}` : ''}${
          flowPathMap[config.redirectLink?.linkId as keyof typeof flowPathMap]
        }`,
      };

      router.push(LINK[config.redirectLink?.connection as keyof typeof LINK] as string);
    }
  }, [redirectUrl, router, config.redirectLink?.linkId, config.redirectLink?.connection]);

  return config.cta?.isActive ? (
    <>
      {!checkinData?.checkedIn && (
        <StyledButton className={styles.button} variant='contained' onClick={onCtaClick}>
          {config.cta?.title}
        </StyledButton>
      )}
    </>
  ) : null;
};

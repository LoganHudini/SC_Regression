import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import React from 'react';
import { IConfig } from '../../../../types/UIConfiguration.types';
import ExpandMoreIcon from '@icons/ExpandMore.svg';
import styles from './ACCORDION_W_ICON.module.scss';
import { ASSETS_URL } from '../../../../core/graphql/endpoints';
import { StableImage } from 'components/shared/StableImage/StableImage';

interface IAccordionProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const ACCORDION_W_ICON: React.FC<IAccordionProps> = ({ config }) => {
  return (
    <div className={styles.accordionsWrapper}>
      {config.accordions?.map((el, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <StableImage
              className={styles.accordionImage}
              src={el.imgURL ? `${ASSETS_URL}/${el.imgURL}` : undefined}
            />
            {el.titleH3 && <h3 className={styles.accordionTitle}>{el.titleH3}</h3>}
          </AccordionSummary>
          <AccordionDetails>
            {el.body && <p className={styles.accordionBody}>{el.body}</p>}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

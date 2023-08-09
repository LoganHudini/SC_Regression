import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import React from 'react';
import { IConfig } from '../../../../types/UIConfiguration.types';
import styles from './ACCORDION_WO_ICON.module.scss';

interface IAccordionProps {
  config: Partial<IConfig>;
  paths: {
    path: string;
    id: string;
  }[];
}

export const ACCORDION_WO_ICON: React.FC<IAccordionProps> = ({ config }) => {
  return (
    <div className={styles.accordionsWrapper}>
      {config.accordions?.map((el, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<div className={styles.plusIcon} />}>
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

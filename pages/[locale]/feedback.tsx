import { Header } from 'components/shared/Header/Header';
import { PageWrapper } from 'components/shared/PageWrapper/PageWrapper';
import { GetStaticProps } from 'next';
import i18nConfig from 'next-i18next.config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../styles/feedback/feedback.module.scss';
import { getStaticPaths } from 'utils/getStatic';
import { useLocale, useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import { ApolloError, useQuery } from '@apollo/client';
import { GET_FEEDBACK } from 'core/graphql/queries/GET_FEEDBACK';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import cx from 'classnames';
import { RATING5STARS } from 'utils/constants';
import Okay from '@icons/okayFeedback.svg';
import Good from '@icons/goodFeedback.svg';
import Great from '@icons/greatFeedback.svg';
import { TextField } from '@mui/material';
import { client } from 'core/graphql/client';
import { processError } from 'utils/processError';
import { PostFeedback } from 'core/graphql/queries/FEEDBACK';
import dayjs from 'dayjs';
import { timeFormats } from 'utils/timeFormats';
import { availablePaths } from 'utils/availablePaths';
import Head from 'next/head';
import { HOTEL_CODE } from 'core/graphql/endpoints';
import { CHECKOUT } from 'core/graphql/queries/CHECKOUT';
import { useCheckedIn } from 'storage/check-in.storage';
import { buttonArrow } from 'utils/functions';

export { getStaticPaths };

const Feedback = () => {
  const { t } = useTranslation('dining');
  const [feedbackText, setFeedbackText] = useState<any>();
  const [selectedFeedback, setSelectedFeedback] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const isCheckedIn = useCheckedIn();

  const locale = useLocale();
  const navigate = useLocalizedRouter();

  const { data } = useQuery(GET_FEEDBACK, {
    context: { clientName: 'host_v4' },
    fetchPolicy: 'no-cache',
  });

  const feedbackData = data?.listFeedback?.filter((item: any) => item?.destination === CHECKOUT);

  useEffect(() => {
    feedbackData?.length === 0 && navigate(availablePaths?.HOME);
  }, [feedbackData, navigate]);

  const handleButtonClick = (categoryTitle: any, rating: any) => {
    setSelectedFeedback((prevSelectedRatings: any) => ({
      ...prevSelectedRatings,
      [categoryTitle]: rating,
    }));
  };

  const hotelName = HOTEL_CODE ?? '';

  const feedbackPayload = {
    orgEmail: 'somanatha.biradar@hudini.io',
    email: '',
    space: hotelName,
    guestName: isCheckedIn?.name,
    feedbackDate: dayjs().format(timeFormats.YEAR_MONTH_DAY),
    comments: feedbackText,
    feedbackCategories: Object.entries(selectedFeedback).map(([description, rating]) => ({
      description,
      rating: rating?.toString() ?? '',
    })),
  };

  const submit = async () => {
    try {
      setLoading(true);
      const uploadSignatureResponse = await client.mutate({
        mutation: PostFeedback,
        context: { clientName: 'rest_v3' },
        variables: {
          body: feedbackPayload,
        },
      });
      navigate(availablePaths.HOME);
      setLoading(false);
    } catch (uploadSignatureError) {
      processError(t, uploadSignatureError as ApolloError);
      setLoading(false);
    }
  };
  return (
    <>
      <Head>
        <title>{t('Feedback') as string}</title>
      </Head>
      <Header screenTitle={t('Feedback') as string} displayHome />

      <PageWrapper className={styles.pageWrapper}>
        <div className={styles.wrapper}>
          <div className={styles.title}>{feedbackData && feedbackData[0]?.subtext}</div>
          {feedbackData?.map((preference: any, index: number) => (
            <>
              <p className={styles.preferenceTitle}>{t('Kindly rate our services')}</p>
              <div key={index} className={styles.buttonWrapper}>
                {preference?.feedbackCategories?.map((category: any, index: number) => (
                  <>
                    {category?.type === RATING5STARS && (
                      <>
                        <div className={styles.ratingWrapper} key={index}>
                          <p className={styles.categoryTitle}>{category.title}</p>
                          <div className={styles.emojiWrapper}>
                            <div
                              className={styles.emojiContainer}
                              onClick={() => handleButtonClick(category.title, 1)}
                            >
                              <Okay
                                className={cx(styles.button, {
                                  [styles.selectedOption]: selectedFeedback[category.title] === 1,
                                })}
                              />
                              <span className={styles.emojiTitle}>{t('OKAY')}</span>
                            </div>
                            <div
                              className={styles.emojiContainer}
                              onClick={() => handleButtonClick(category.title, 2)}
                            >
                              <Good
                                className={cx(styles.button, {
                                  [styles.selectedOption]: selectedFeedback[category.title] === 2,
                                })}
                              />
                              <span className={styles.emojiTitle}>{t('GOOD')}</span>
                            </div>
                            <div
                              className={styles.emojiContainer}
                              onClick={() => handleButtonClick(category.title, 3)}
                            >
                              <Great
                                className={cx(styles.button, {
                                  [styles.selectedOption]: selectedFeedback[category.title] === 3,
                                })}
                              />
                              <span className={styles.emojiTitle}>{t('GREAT')}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ))}
                <div className={styles.feedbackTextWrapper}>
                  <span className={styles.categoryTitle}>{t('Feedback')} </span>
                  <TextField
                    placeholder={`${t('Type here')}`}
                    multiline
                    onChange={(e) => setFeedbackText(e.target.value)}
                    fullWidth
                    value={feedbackText}
                    autoComplete='off'
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        textAlign: 'left',
                      },
                    }}
                    className={cx(styles.guestDataInput, styles.demo)}
                    InputProps={{
                      classes: {
                        notchedOutline: styles.customUnderline,
                      },
                    }}
                    variant='outlined'
                  />
                </div>
              </div>
            </>
          ))}

          <div className={cx(styles.bottomMenuWrapper)}>
            <StyledButton
              variant='contained'
              className={styles.bottomMenuButton}
              onClick={submit}
              loading={loading}
              arrow={buttonArrow}
            >
              {t('submit')}
            </StyledButton>
          </div>

          {/* <div className={styles.confirmOrderButton}>
            <div className={styles.confirmationWrapperButton}>
              <StyledButton
                className={styles.submitButton}
                onClick={submit}
                variant='contained'
                loading={loading}
              >
                {t('submit')}
              </StyledButton>
            </div>
          </div> */}
        </div>
      </PageWrapper>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const locale = ctx?.params?.locale;

  return {
    props: {
      ...(await serverSideTranslations(locale as string, ['common'], i18nConfig)),
    },
  };
};

export default Feedback;

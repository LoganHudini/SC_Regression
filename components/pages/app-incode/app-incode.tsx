/* eslint-disable @next/next/no-img-element */
// check public/index.html
import { useReactiveVar } from '@apollo/client';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
// import { useDispatch } from 'react-redux';
// import { updateOCRData } from '../app/app/reservationSlice';
// import Loading from '../shared/loading/Loading';
// import { notificationManager } from '../utils/NotificationUtils';
import ArrowDown from '@icons/arrow-down.svg';
import ArrowUp from '@icons/arrow-up.svg';
import Icons from '@icons/icons.svg';
import ThreeDots from '@icons/three-dots.svg';
import startIncode from './incode';
// import './incode.css';
import Steps from './Steps';
import { guestFaceMatchStorageData } from 'storage/guest-facematch.storage';
import styles from './Incode.module.scss';

function FrontId({
  session,
  type,
  onSuccess,
  onError,
}: {
  session: any;
  type: string;
  onSuccess: any;
  onError: any;
}) {
  const containerRef: any = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      startIncode().then((incode) => {
        incode.renderCamera(type, containerRef.current, {
          onSuccess,
          onError: onError,
          token: session,
          numberOfTries: -1,
          showTutorial: true,
        });
      });
    }
  }, [onSuccess, onError, session]);

  return <div ref={containerRef}></div>;
}

function BackId({ session, onSuccess, onError }: { session: any; onSuccess: any; onError: any }) {
  const containerRef: any = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      startIncode().then((incode) => {
        incode.renderCamera('back', containerRef.current, {
          onSuccess,
          onError: onError,
          token: session,
          numberOfTries: -1,
          showTutorial: true,
        });
      });
    }
  }, [onSuccess, onError, session]);

  return <div ref={containerRef}></div>;
}

function Selfie({ session, onSuccess, onError }: { session: any; onSuccess: any; onError: any }) {
  const containerRef: any = useRef();

  useEffect(() => {
    startIncode().then((incode) => {
      incode.renderCamera('selfie', containerRef.current, {
        onSuccess,
        onError: onError,
        token: session,
        numberOfTries: 15,
        showTutorial: true,
      });
    });
  }, [onSuccess, onError, session]);

  return <div ref={containerRef}></div>;
}

function FaceMatch({
  session,
  onSuccess,
  onError,
  liveness,
  userExists,
}: {
  session: any;
  onSuccess: any;
  onError: any;
  liveness: any;
  userExists: any;
}) {
  const containerRef: any = useRef();
  useEffect(() => {
    startIncode().then((incode) => {
      const x = incode.renderFaceMatch(containerRef.current, {
        onSuccess,
        onError,
        token: session,
        liveness,
        userExists,
      });
    });
  }, [onSuccess, onError, session, liveness, userExists]);

  return <div ref={containerRef}></div>;
}

function ProcessId({ session, onSuccess }: { session: any; onSuccess: any; onError: any }) {
  // const dispatch = useDispatch();
  const navigate = useLocalizedRouter();
  const goToTheNextStep = useCallback(() => {
    navigate(availablePaths.GUEST_INFORMATION_INPUT);
  }, [navigate]);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  // const updateGuestDetails = (name: string, value: string) => {
  //   const inputField = name;
  //   const inputValue = value;
  //   reservationGuestInfoStorageData({ ...guestReservationInfo, [inputField]: inputValue });
  // };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // updateGuestDetails('docType', sessionStorage.getItem('docType') || '');
      startIncode().then((incode) => {
        incode.processId({ token: session.token }).then(async () => {
          onSuccess();
          const ocrData = await incode.ocrData({ token: session.token });
          reservationGuestInfoStorageData({
            ...guestReservationInfo,
            docNo: ocrData.documentNumber,
            docType: sessionStorage.getItem('docType'),
          });
          // updateGuestDetails('docNo', ocrData.documentNumber);
          // dispatch(updateOCRData(ocrData));
          // navigate(availablePaths.HOME);
        });
      });
    }
  }, [onSuccess, session]);

  return (
    <div>
      <div
        style={{
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        Processing..
      </div>
    </div>
  );
}

export function usePermissions() {
  const [state, setState] = useState('unknown');

  useEffect(() => {
    try {
      navigator.mediaDevices.getUserMedia({ video: true }).then(
        (stream) => {
          setState('available');
        },
        (e) => {
          setState('unknown');
        },
      );
      // navigator.permissions
      //   .query({ name: 'camera' })
      //   .then(function (result) {
      //     setState(result.state);
      //   })
      //   .catch(() => {
      //     setState('unknown');
      //   });
    } catch (e) {
      setState('unknown');
    }
  }, []);

  return state;
}

// This only works for Android, you need to handle iOS
function ResetPermissions({ onTryAgain }: { onTryAgain: any }) {
  return (
    <div className={styles.resetPermissions}>
      <h1>Follow the next steps:</h1>
      <ul className={styles.list}>
        <li>
          <span className={styles.number}>1</span> <p>Tap the 3 dots</p>{' '}
          <ThreeDots className={styles.threeDots} />
          <ArrowUp className={styles.arrowUp} />
          {/* <img className={styles.threeDots} alt='three dots' src={threeDots} />
          <img className={styles.arrowUp} src={arrowUp} alt='arrow pointing to the three dots' /> */}
        </li>
        <li>
          <span className={styles.number}>2</span> <p>Tap this icon</p>{' '}
          <ArrowDown className={styles.arrowDown} />
          {/* <img src={arrowDown} className={styles.arrowDown} alt='arrow pointing to icon with i' /> */}
          <div>
            <Icons />
            {/* <img src={icons} alt='bar icons' /> */}
          </div>
        </li>
        <li>
          <span className={styles.number}>3</span>{' '}
          <p>
            Tap in <span className={styles.blue}>Site settings</span>
          </p>
        </li>
        <li>
          <span className={styles.number}>4</span>{' '}
          <span className={styles.blue}>Allow Permission</span>{' '}
          <p style={{ marginLeft: 10 }}>to Camera</p>
        </li>
      </ul>
      <div className={styles.buttonContainer}>
        <button onClick={onTryAgain}>Try Again</button>
      </div>
    </div>
  );
}

function RetrySteps({
  session,
  onSuccess,
  onError,
  numberOfTries,
}: {
  session: any;
  onSuccess: any;
  onError: any;
  numberOfTries: any;
}) {
  const containerRef: any = useRef();

  useEffect(() => {
    startIncode().then((incode) => {
      incode.renderRetrySteps(
        containerRef.current,
        {
          token: session,
          numberOfTries,
          showPassport: false,
        },
        {
          onSuccess,
          onError,
        },
      );
    });
  }, [onSuccess, onError, session, numberOfTries]);

  return <div ref={containerRef}></div>;
}

export function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

export default function AppIncode(props: any) {
  const navigate = useLocalizedRouter();
  // accompanying =  props?.location?.state?.accompany
  // const history = useHistory();
  // const params = useParams();
  const [session, setSession] = useState<any>();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);
  const permissionsState = usePermissions();
  const [resetPermissions, setResetPermissions] = useState(false);
  const [liveness, setLiveness] = useState(false);
  const [userExists, setUserExists] = useState(false);
  // console.log('the query params are: ', params);
  // const navigate = useNavigate();
  let type = 'Passport';
  if (typeof window !== 'undefined') {
    type = sessionStorage.getItem('docType') || 'Passport';
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const queryParams = useQuery();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const flowId = queryParams.get('flowId');
      startIncode().then((incode) => {
        incode
          .createSession('ALL', '', {
            configurationId: flowId || '',
          })
          .then(async (session: any) => {
            // await incode.warmup();
            setSession(session);
          });
      });
    }, [queryParams]);
  }
  useEffect(() => {
    // if permissions are denied from start, let's show the reset permissions screen
    setResetPermissions(permissionsState === 'denied' ? true : false);
  }, [permissionsState]);

  function goNext() {
    setStep(step + 1);
  }

  async function checkScore() {
    startIncode().then(async (incode) => {
      const score = await incode.getScore({ token: session?.token });
      if (
        +score.faceRecognition.overall.value > 0 &&
        score.faceRecognition.overall.status == 'OK'
      ) {
        guestFaceMatchStorageData({ faceMatch: true, checked: true });
      } else if (
        +score.faceRecognition.overall.value > 0 &&
        score.faceRecognition.overall.status != 'OK'
      ) {
        guestFaceMatchStorageData({ faceMatch: false, checked: true });
      }

      navigate(availablePaths.GUEST_INFORMATION_INPUT);
    });
  }

  function handleError(e: any) {
    if (e.type === 'permissionDenied') {
      setResetPermissions(true);
      return;
    }
    setError(true);
  }

  // if (!session) return <Loading />;
  if (resetPermissions) {
    return <ResetPermissions onTryAgain={() => setResetPermissions(false)} />;
  }
  if (error) {
    return (
      <div>
        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          Document scan unsuccessful
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          <button
            onClick={() => {
              navigate(availablePaths.GUEST_INFORMATION_INPUT);
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // const getOCRData = async () => {
  //   console.log('the session data is: ', session);
  //   let ocrData = await incode.ocrData({ token: session.token });
  //   console.log('the ocr data is: ', ocrData);
  // };
  if (type === 'Passport') {
    return (
      <Steps currentStep={step}>
        <FrontId session={session} type={'passport'} onSuccess={goNext} onError={handleError} />
        {/* {type && type !== "PASSPORT" && <BackId session={session} onSuccess={goNext} onError={handleError} />} */}
        <ProcessId session={session} onSuccess={goNext} onError={handleError} />
        {/* <OCRData session={session} onSuccess={goNext} onError={handleError}/> */}
        <Selfie
          session={session}
          onSuccess={(res: any) => {
            setLiveness(res?.liveness);
            setUserExists(res?.existingUser);
            goNext();
          }}
          onError={handleError}
        />
        <FaceMatch
          session={session}
          onSuccess={checkScore}
          liveness={liveness}
          userExists={userExists}
          onError={handleError}
        />
        <RetrySteps session={session} numberOfTries={3} onSuccess={goNext} onError={handleError} />
        <div>
          <h1
            style={{
              textAlign: 'center',
            }}
          >
            You finished the onboarding process
            {/* <OCRData session={session} /> */}
            {/* {data} */}
          </h1>
          {/* <div>{getOCRData()}</div> */}
        </div>
      </Steps>
    );
  } else {
    return (
      <Steps currentStep={step}>
        <FrontId session={session} type={'front'} onSuccess={goNext} onError={handleError} />
        <BackId session={session} onSuccess={goNext} onError={handleError} />
        <ProcessId session={session} onSuccess={goNext} onError={handleError} />
        {/* <OCRData session={session} onSuccess={goNext} onError={handleError}/> */}
        <Selfie
          session={session}
          onSuccess={(res: any) => {
            setLiveness(res?.liveness);
            setUserExists(res?.existingUser);
            goNext();
          }}
          onError={handleError}
        />
        <FaceMatch
          session={session}
          onSuccess={checkScore}
          liveness={liveness}
          userExists={userExists}
          onError={handleError}
        />
        <RetrySteps session={session} numberOfTries={3} onSuccess={goNext} onError={handleError} />
        <div>
          <h1
            style={{
              textAlign: 'center',
            }}
          >
            You finished the onboarding process
            {/* <OCRData session={session} /> */}
            {/* {data} */}
          </h1>
          {/* <div>{getOCRData()}</div> */}
        </div>
      </Steps>
    );
  }
}

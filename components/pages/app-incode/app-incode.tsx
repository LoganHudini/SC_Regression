import { useReactiveVar } from '@apollo/client';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { reservationGuestInfoStorageData } from 'storage/reservation-guest-info.storage';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import startIncode from './incode';
import Steps from './Steps';
import { guestFaceMatchStorageData } from 'storage/guest-facematch.storage';

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
  const navigate = useLocalizedRouter();
  const goToTheNextStep = useCallback(() => {
    navigate(availablePaths.CHECK_IN);
  }, [navigate]);
  const guestReservationInfo = useReactiveVar(reservationGuestInfoStorageData);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      startIncode().then((incode) => {
        incode.processId({ token: session.token }).then(async () => {
          onSuccess();
          const ocrData = await incode.ocrData({ token: session.token });
          reservationGuestInfoStorageData({
            ...guestReservationInfo,
            docNo: ocrData.documentNumber,
            docType: ocrData.typeOfId.toUpperCase(),
            effectiveDate: ocrData?.issueDate + '-01-01',
            expiryDate: ocrData?.expirationDate + '-12-31',
            issueCountry: ocrData?.issuingCountry ?? '',
          });
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
    } catch (e) {
      setState('unknown');
    }
  }, []);

  return state;
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
  const [session, setSession] = useState<any>();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);
  const permissionsState = usePermissions();
  const [resetPermissions, setResetPermissions] = useState(false);
  const [liveness, setLiveness] = useState(false);
  const [userExists, setUserExists] = useState(false);
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
            setSession(session);
          });
      });
    }, [queryParams]);
  }
  useEffect(() => {
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

      navigate(availablePaths?.GUEST_VERIFICATION);
    });
  }

  function handleError(e: any) {
    if (e.type === 'permissionDenied') {
      setResetPermissions(true);
      return;
    }
    setError(true);
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
              navigate(availablePaths.CHECK_IN);
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (type === 'Passport') {
    return (
      <Steps currentStep={step}>
        <FrontId session={session} type={'passport'} onSuccess={goNext} onError={handleError} />
        <ProcessId session={session} onSuccess={goNext} onError={handleError} />
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
          </h1>
        </div>
      </Steps>
    );
  } else {
    return (
      <Steps currentStep={step}>
        <FrontId session={session} type={'front'} onSuccess={goNext} onError={handleError} />
        <BackId session={session} onSuccess={goNext} onError={handleError} />
        <ProcessId session={session} onSuccess={goNext} onError={handleError} />
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
          </h1>
        </div>
      </Steps>
    );
  }
}

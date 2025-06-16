import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { StyledButton } from 'components/shared/StyledButton/StyledButton';
import styles from './CameraCapture.module.scss';
import CloseIcon from '@icons/closeButton.svg';
import { Loader } from '../Loaders/Loaders';

type CameraCaptureProps = {
  openCamera: boolean;
  handleCapture: (imageData: string) => Promise<any>;
  onClose: (cam: boolean) => void;
  t: any;
};

const CameraCapture: React.FC<CameraCaptureProps> = ({
  openCamera = false,
  handleCapture,
  onClose,
  t,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (openCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCamera]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  useEffect(() => {
    if (streaming && videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((err) => {
        console.error('Failed to play video:', err);
      });
    }
  }, [streaming, mediaStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreaming(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    setStreaming(false);
  };

  const takePhoto = () => {
    const width = 300;
    const height = 225;
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setUrl(dataUrl);
        stopCamera();

        (async () => {
          setLoading(true);
          try {
            const newData = await handleCapture(dataUrl);
            if (newData) {
              setTimeout(() => {
                onClose(newData);
              }, 1000);
            }
          } finally {
            setLoading(false);
          }
        })();
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.previewContainer}>
        <CloseIcon
          onClick={() => {
            stopCamera();
            onClose(true);
          }}
        />
      </div>

      {!url && openCamera ? (
        <>
          {streaming ? (
            <div className={styles.videoWrapper}>
              <video ref={videoRef} autoPlay playsInline className={styles.video} />
            </div>
          ) : (
            <div>
              <Loader />
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      ) : (
        url && (
          <div className={styles.imageWrapper}>
            <Image src={url} alt='Captured Id' fill className={styles.image} />
          </div>
        )
      )}

      <div className={styles.buttonGroup}>
        {streaming && !url && (
          <StyledButton variant='contained' onClick={takePhoto} disabled={loading}>
            <span>{url ? t('Done') : loading ? <Loader /> : t('Capture ID')}</span>
          </StyledButton>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;

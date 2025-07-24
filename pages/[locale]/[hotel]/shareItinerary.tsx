import React, { useState, useEffect } from 'react';
import Share from '@icons/shareIconBlack.svg';
import styles from '@styles/itinerary/shareitinerary.module.scss';

const ShareButton = ({
  title,
  text,
  url,
  fileName = 'itinerary.pdf',
  htmlContent,
}: {
  title?: string;
  text?: string;
  url?: string;
  fileName?: string;
  htmlContent: string;
}) => {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(
      typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function',
    );
  }, []);

  const generatePDF = async () => {
    if (typeof window === 'undefined') return null;

    if (!htmlContent.trim()) {
      alert('No content to generate PDF');
      return null;
    }

    const container = document.createElement('div');
    container.innerHTML = htmlContent;

    document.body.appendChild(container);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true, // enable cross-origin images
          allowTaint: false, // disallow tainted canvases
          logging: false,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      const worker = html2pdf().from(htmlContent).set(opt);
      const pdfBlob = await worker.outputPdf('blob');

      document.body.removeChild(container);

      return pdfBlob;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
      return null;
    }
  };

  const handleShare = async () => {
    if (!canShare) {
      alert('Sharing is not supported on this device or browser.');
      return;
    }

    try {
      const pdfBlob = await generatePDF();
      if (!pdfBlob) return;

      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      const shareData: ShareData & { files?: File[] } = {
        title: title || 'Check out this itinerary!',
        text: text || 'I wanted to share this travel itinerary with you.',
        url: url || '',
      };

      if (navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      } else {
        alert('File sharing not supported on this device');
        return;
      }

      await navigator.share(shareData);
      console.log('Shared successfully');
    } catch (error: any) {
      console.error('Error sharing:', error);
      if (error.name !== 'AbortError') {
        alert('Failed to share: ' + error.message);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={!canShare}
      aria-label='Share'
      className={styles.shareIcon}
      title='Share this itinerary'
    >
      <Share />
    </button>
  );
};

export default ShareButton;

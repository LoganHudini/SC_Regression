// html2pdf.d.ts
declare module 'html2pdf.js' {
  const html2pdf: {
    (): {
      from: (element: HTMLElement | string) => {
        set: (options: any) => {
          outputPdf: (type: string, options?: any) => Promise<Blob>;
          save: () => void;
        };
      };
    };
    default: any;
  };
  export default html2pdf;
}

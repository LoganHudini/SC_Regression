import { useEffect, useState } from 'react';

const useScripts = (url: string, type?: any, id?: string) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = url;
    script.type = type || 'text/javascript';
    script.id = id || '';
    document.body.appendChild(script);
    script.addEventListener('load', () => {
      setScriptLoaded(true);
    });
    return () => {
      document.body.removeChild(script);
    };
  }, [id, type, url]);
  return scriptLoaded;
};

export default useScripts;

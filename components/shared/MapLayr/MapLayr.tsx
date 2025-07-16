import { useRef } from 'react';
import Script from 'next/script';
import { mapCode } from 'storage/home.storage';
import { useReactiveVar } from '@apollo/client';

const MapLayrMap = () => {
  const mapRef = useRef(null);
  const code = useReactiveVar(mapCode);
  console.log(code, 'global code ');

  const handleScriptLoad = async () => {
    if (!window.maplayr) {
      console.error('MapLayr script not loaded.');
      return;
    }

    const map = await window.maplayr.Map.managed(code);
    const mapView = map.attach(mapRef.current);

    const layer = new window.maplayr.AnnotationLayer();
    mapView.addLayer(layer);

    const pointsOfInterest = [
      {
        name: 'Shipwreck Restaurant',
        location: new window.maplayr.Coordinates(36.69427, -6.41905),
      },
      { name: 'Mystical Waters', location: new window.maplayr.Coordinates(36.69035, -6.40912) },
      { name: 'Underwater Kingdom', location: new window.maplayr.Coordinates(36.69878, -6.41632) },
    ];

    for (const poi of pointsOfInterest) {
      const annotation = new window.maplayr.Annotation({
        position: poi.location,
        node() {
          const container = document.createElement('div');
          container.className = 'annotation';
          container.textContent = poi.name;
          return container;
        },
      });

      layer.add(annotation);

      annotation.addEventListener('click', () => {
        mapView.moveCamera({
          position: poi.location,
          span: 20,
          heading: 360 * Math.random(),
          animated: true,
        });
      });
    }
  };

  return (
    <>
      <Script
        src='https://cdn.attractions.io/frameworks/maplayr-web/v0.3/maplayr.js'
        strategy='lazyOnload'
        onLoad={handleScriptLoad}
      />
      <div ref={mapRef} id='map' style={{ width: '100%', height: '607px' }} />
    </>
  );
};

export default MapLayrMap;

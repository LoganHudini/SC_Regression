declare global {
  interface Window {
    maplayr: any;
  }
}

export {};

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { mapCode } from 'storage/home.storage';
import { useReactiveVar } from '@apollo/client';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import styles from './MapLayr.module.scss';
import locationMarkerUrl from '../../../assets/icons/mapLocation.png?url';

// Helper: Calculate distance between two coordinates (in meters)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Helper: Trigger short vibration (mobile only)
const triggerVibration = () => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([300, 100, 200]);
  }
};

const MapLayrMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const code = useReactiveVar(mapCode);
  const navigate = useLocalizedRouter();

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const currentDestinationRef = useRef<any | null>(null);
  const currentDestinationNameRef = useRef<string | null>(null);
  const proximityCheckRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!code) {
      navigate(availablePaths.HOME);
    }
  }, [code, navigate]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (toast.visible) {
      timeout = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [toast.visible]);

  const handleScriptLoad = async () => {
    if (!window.maplayr) {
      console.error('MapLayr script not loaded.');
      return;
    }

    const map = await window.maplayr.Map.managed(code);
    const mapView = map.attach(mapRef.current);

    const userLocationMarker = new window.maplayr.UserLocationMarker();
    mapView.addUserLocationMarker(userLocationMarker);

    mapView.addEventListener('click', (event: any) => {
      if (event.coordinates) {
        userLocationMarker.position = {
          coordinates: event.coordinates,
          accuracy: 20,
        };
      }
    });

    const layer = new window.maplayr.AnnotationLayer();
    mapView.addLayer(layer);

    let currentRouteShapes: any[] = [];

    const clearRoute = () => {
      currentRouteShapes.forEach((shape) => {
        mapView.removeShape(shape);
      });
      currentRouteShapes = [];
      currentDestinationRef.current = null;
      currentDestinationNameRef.current = null;

      if (proximityCheckRef.current) {
        clearInterval(proximityCheckRef.current);
        proximityCheckRef.current = null;
      }
    };

    const setRoute = (destination: any, name: string) => {
      if (!userLocationMarker.position) {
        console.warn('Click on the map first to set your starting location!');
        return;
      }
      clearRoute();
      currentDestinationRef.current = destination;
      currentDestinationNameRef.current = name;

      try {
        const reactiveRoute = map.createReactiveRoute(userLocationMarker, destination);

        const outerShape = new window.maplayr.Shape(reactiveRoute);
        outerShape.strokeColor = '#0066ccff';
        outerShape.strokeWidth = 8;
        mapView.addShape(outerShape);

        const innerShape = new window.maplayr.Shape(reactiveRoute);
        innerShape.strokeColor = '#3399ffff';
        innerShape.strokeWidth = 5;
        mapView.addShape(innerShape);

        currentRouteShapes = [innerShape, outerShape];

        if (proximityCheckRef.current) clearInterval(proximityCheckRef.current);
        proximityCheckRef.current = setInterval(() => {
          const userPos = userLocationMarker.position?.coordinates;
          const dest = currentDestinationRef.current;
          const destName = currentDestinationNameRef.current;

          if (!userPos || !dest || !destName) return;

          const distance = calculateDistance(
            userPos.latitude,
            userPos.longitude,
            dest.latitude,
            dest.longitude,
          );

          if (distance <= 20) {
            clearRoute();

            // Trigger vibration
            triggerVibration();

            // Highlight POI
            const poiElement = document.querySelector(
              `[data-poi-name="${CSS.escape(destName)}"]`,
            ) as HTMLElement | null;

            if (poiElement) {
              poiElement.classList.add(styles.pulseHighlight);
              setTimeout(() => {
                poiElement.classList.remove(styles.pulseHighlight);
              }, 2500);
            }

            // Show toast
            setToast({
              message: `You've arrived at ${destName}!`,
              visible: true,
            });
          }
        }, 1000);
      } catch (error) {
        console.error('Routing failed:', error);
        clearRoute();
      }
    };

    // === Points of Interest ===
    const pointsOfInterest = [
      {
        name: 'Shipwreck Restaurant',
        location: new window.maplayr.Coordinates(36.69427, -6.41905),
        arrivalRadius: 30,
      },
      { name: 'Mystical Waters', location: new window.maplayr.Coordinates(36.69035, -6.40912) },
      {
        name: 'Underwater Kingdom',
        location: new window.maplayr.Coordinates(36.69878, -6.41632),
      },
      {
        name: 'Entrance',
        location: new window.maplayr.Coordinates(-20.5031528, 57.4079234),
      },
      {
        name: 'Pro shop',
        location: new window.maplayr.Coordinates(-20.5031487, 57.4078868),
        images: [
          'https://rogershospitality-stage.s3.ap-south-1.amazonaws.com/La+Reserve+Golf+Link+ProShop.png',
        ],
      },
      {
        name: 'Toilet',
        location: new window.maplayr.Coordinates(-20.5031088, 57.4078429),
      },
      {
        name: 'Bar & Restaurant',
        location: new window.maplayr.Coordinates(-20.5030495, 57.407916),
        images: ['/images/activity/restaurant.jpg'],
      },
      {
        name: 'Halfway',
        location: new window.maplayr.Coordinates(-20.5027257, 57.4082868),
      },
      {
        name: 'Driving Range',
        location: new window.maplayr.Coordinates(-20.5033893, 57.4073967),
      },
      {
        name: 'Reception',
        location: new window.maplayr.Coordinates(-20.5031578, 57.4128328),
      },
      {
        name: 'Restaurant',
        location: new window.maplayr.Coordinates(-20.5034734, 57.4126152),
      },
      {
        name: 'Swimming Pool',
        location: new window.maplayr.Coordinates(-20.5038449, 57.4126742),
      },
      {
        name: 'Garden',
        location: new window.maplayr.Coordinates(-20.5017886, 57.4143402),
      },
      {
        name: 'Restaurant Main Entrance',
        location: new window.maplayr.Coordinates(-20.5019795, 57.4127155),
      },
      {
        name: 'Restaurant Backyard Entry',
        location: new window.maplayr.Coordinates(-20.5021918, 57.4128073),
      },
      {
        name: 'Restaurant Deck',
        location: new window.maplayr.Coordinates(-20.5018203, 57.4116547),
      },
      {
        name: 'Suite',
        location: new window.maplayr.Coordinates(-20.502032, 57.4127091),
      },
      {
        name: 'Duck Lake',
        location: new window.maplayr.Coordinates(-20.5025454, 57.4126501),
      },
      {
        name: 'Bel Ombre Nature Reserve',
        location: new window.maplayr.Coordinates(-20.5010911, 57.4407171),
      },
      {
        name: 'Enbas pied restaurant',
        location: new window.maplayr.Coordinates(-20.5007466, 57.4404834),
      },
      {
        name: 'Welcome pavillion villa',
        location: new window.maplayr.Coordinates(-20.5050244, 57.4081665),
      },
      {
        name: 'Marine education center',
        location: new window.maplayr.Coordinates(-20.5053526, 57.4078412),
      },
      {
        name: 'Watersports center',
        location: new window.maplayr.Coordinates(-20.5057963, 57.4075254),
      },
      {
        name: 'Beach Volley',
        location: new window.maplayr.Coordinates(-20.5059574, 57.4078523),
      },
      {
        name: 'Bar',
        location: new window.maplayr.Coordinates(-20.5057624, 57.4080263),
      },
      {
        name: 'Restaurant',
        description:
          'Craft precious family moments around the C Beach Club’s child-friendly pool, sprawling over 600m. Lifelong memories are made here, at this sublime beachfront playground.',
        location: new window.maplayr.Coordinates(-20.5055316, 57.4080072),
        images: [
          'https://rogershospitality-stage.s3.ap-south-1.amazonaws.com/CBeach+restaurant.png',
        ],
      },
      {
        name: 'La Reserve',
        location: new window.maplayr.Coordinates(-20.5000372, 57.4269962),
      },
      {
        name: 'Bar',
        location: new window.maplayr.Coordinates(-20.5000372, 57.4269962),
      },
      {
        name: 'Restaurant',
        location: new window.maplayr.Coordinates(-20.5001173, 57.4271441),
        images: ['/images/activity/restaurant.jpg'],
      },
      {
        name: 'Pro shop',
        description:
          'Prepare to embark on a shopping experience like no other at our shopping paradise.',
        location: new window.maplayr.Coordinates(-20.5001914, 57.427179),
        images: [
          'https://rogershospitality-stage.s3.ap-south-1.amazonaws.com/La+Reserve+Golf+Link+ProShop.png',
        ],
      },
      {
        name: 'Vestiare',
        location: new window.maplayr.Coordinates(-20.5002294, 57.4269835),
      },
      {
        name: 'Heliport',
        location: new window.maplayr.Coordinates(-20.510503, 57.4233877),
      },
      {
        name: 'Place du moulin',
        location: new window.maplayr.Coordinates(-20.5050238, 57.412237),
      },
      {
        name: 'World of seashells',
        location: new window.maplayr.Coordinates(-20.50546, 57.4122283),
      },
      {
        name: 'Horse riding',
        location: new window.maplayr.Coordinates(-20.5105871, 57.4200366),
      },
      {
        name: 'Heritage Valriche entrance',
        location: new window.maplayr.Coordinates(-20.5036907, 57.4163458),
      },
      {
        name: 'Zero KMs',
        location: new window.maplayr.Coordinates(-20.5044639, 57.4151378),
      },
    ];

    for (const poi of pointsOfInterest) {
      const annotation = new window.maplayr.Annotation({
        position: poi.location,
        node() {
          const label = document.createElement('div');
          label.className = styles.annotationLabel;

          if (poi.images && poi.images.length > 0) {
            poi.images.forEach((imgUrl: string) => {
              const img = document.createElement('img');
              img.src = imgUrl.trim();
              img.alt = poi.name;
              img.style.width = '120px';
              img.style.height = '80px';
              img.style.objectFit = 'cover';
              img.style.borderRadius = '8px';
              img.style.marginBottom = '6px';
              label.appendChild(img);
            });
          }
          const text = document.createElement('span');
          text.textContent = poi.name;
          text.style.display = 'block';
          if (poi.description) {
            text.style.fontWeight = '600';
          }
          label.appendChild(text);

          if (poi.description) {
            const desc = document.createElement('p');
            desc.textContent = poi.description;
            desc.style.fontSize = '13px';
            desc.style.fontWeight = '400';
            desc.style.color = '#555';
            desc.style.marginTop = '4px';
            desc.style.textAlign = 'center';
            desc.style.maxWidth = '160px';
            desc.style.lineHeight = '1.3';
            label.appendChild(desc);
          }

          const icon = document.createElement('img');
          icon.src = locationMarkerUrl?.src;
          icon.alt = poi.name;
          icon.className = styles.annotationIcon;

          icon.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();

            const labelEl = label as HTMLElement;
            const isVisible = labelEl.style.display === 'block';

            document.querySelectorAll<HTMLElement>(`.${styles.annotationLabel}`).forEach((el) => {
              el.style.display = 'none';
            });

            if (!isVisible) {
              requestAnimationFrame(() => {
                labelEl.style.display = 'block';
              });
            }

            setRoute(poi.location, poi.name);

            mapView.moveCamera({
              position: poi.location,
              span: 20,
              heading: 360 * Math.random(),
              animated: true,
            });
          });

          const container = document.createElement('div');
          container.className = styles.annotation;
          // Add data attribute for easy selection
          container.setAttribute('data-poi-name', poi.name);
          container.appendChild(icon);
          container.appendChild(label);
          return container;
        },
      });

      layer.add(annotation);
    }
  };

  useEffect(() => {
    if (!code) return;

    const interval = setInterval(() => {
      if (window.maplayr) {
        clearInterval(interval);
        handleScriptLoad();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    return () => {
      if (proximityCheckRef.current) {
        clearInterval(proximityCheckRef.current);
      }
    };
  }, []);

  return (
    <>
      <Script
        src='https://cdn.attractions.io/frameworks/maplayr-web/v0.3/maplayr.js'
        strategy='lazyOnload'
      />
      <div ref={mapRef} id='map' style={{ width: '100%', height: '100vh' }} />

      {/* Toast Notification */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#d8d8d8ff',
            color: 'var(--primary-text-color)',
            padding: '8px 12px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontSize: '14px',
            fontWeight: '200',
            maxWidth: '95%',
            textAlign: 'center',
          }}
        >
          {toast.message}
        </div>
      )}
    </>
  );
};

export default MapLayrMap;

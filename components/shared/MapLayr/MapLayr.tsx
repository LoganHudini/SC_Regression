import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { mapCode } from 'storage/home.storage';
import { useReactiveVar } from '@apollo/client';
import { availablePaths } from 'utils/availablePaths';
import { useLocalizedRouter } from 'utils/hooks/useLocalizedRouter';
import styles from './MapLayr.module.scss';
import locationMarkerUrl from '../../../assets/icons/mapLocation.png?url';

const MapLayrMap = () => {
  const mapRef = useRef(null);
  const code = useReactiveVar(mapCode);
  const navigate = useLocalizedRouter();

  useEffect(() => {
    if (!code) {
      navigate(availablePaths.HOME);
    }
  }, []);

  const handleScriptLoad = async () => {
    if (!window.maplayr) {
      console.error('MapLayr script not loaded.');
      return;
    }

    const map = await window.maplayr.Map.managed(code);
    const mapView = map.attach(mapRef.current);

    // --- POI Layer ---
    const layer = new window.maplayr.AnnotationLayer();
    mapView.addLayer(layer);

    const pointsOfInterest = [
      {
        name: 'Shipwreck Restaurant',
        location: new window.maplayr.Coordinates(36.69427, -6.41905),
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
      },
      {
        name: 'Toilet',
        location: new window.maplayr.Coordinates(-20.5031088, 57.4078429),
      },
      {
        name: 'Bar & Restaurant',
        location: new window.maplayr.Coordinates(-20.5030495, 57.407916),
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
        location: new window.maplayr.Coordinates(-20.5055316, 57.4080072),
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
      },
      {
        name: 'Pro shop',
        location: new window.maplayr.Coordinates(-20.5001914, 57.427179),
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

    // --- User Location ---
    // Create geolocation provider with specific parameters
    const locationProvider = new window.maplayr.GeolocationPositionProvider({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    });

    // Create user location marker with the geolocation provider
    const userLocationMarker = new window.maplayr.UserLocationMarker(locationProvider);

    // Customize the appearance
    userLocationMarker.fillColor = '#ff6b35';

    // Add the user location marker to the map view
    mapView.addUserLocationMarker(userLocationMarker);

    // Function to calculate route to a specific POI
    const calculateRouteToDestination = async (destination: any) => {
      try {
        // Get current user position
        const userPosition = userLocationMarker.position;

        if (!userPosition) {
          return;
        }

        // Check if routing is available
        if (typeof map.calculateRoute !== 'function') {
          drawStraightLine(userPosition, destination);
          return;
        }

        const route = await map.calculateRoute(userPosition, destination);
        createSimpleRoute(userPosition, destination);
        console.log(`Route distance: ${route.distance} metres`);

        // Display the route on the map
        const routeShape = new window.maplayr.Shape(route.path);
        routeShape.strokeColor = '#3600a2ff';
        routeShape.strokeWidth = 4;
        mapView.addShape(routeShape);

        return route;
      } catch (error) {
        drawStraightLine(userLocationMarker.position, destination);
      }
    };

    // Simple route visualization - just start and end markers
    const createSimpleRoute = (start: any, end: any) => {
      // Add start marker (green)
      const startAnnotation = new window.maplayr.Annotation({
        position: start,
        node() {
          const div = document.createElement('div');
          div.style.width = '16px';
          div.style.height = '16px';
          div.style.backgroundColor = '#00ff00';
          div.style.borderRadius = '50%';
          div.style.border = '3px solid white';
          div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          return div;
        },
      });
      layer.add(startAnnotation);

      // Add end marker (red)
      const endAnnotation = new window.maplayr.Annotation({
        position: end,
        node() {
          const div = document.createElement('div');
          div.style.width = '16px';
          div.style.height = '16px';
          div.style.backgroundColor = '#ff0000';
          div.style.borderRadius = '50%';
          div.style.border = '3px solid white';
          div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          return div;
        },
      });
      layer.add(endAnnotation);
    };

    // Fallback: Draw straight line if routing fails
    const drawStraightLine = (start: any, end: any) => {
      createSimpleRoute(start, end);
    };

    for (const poi of pointsOfInterest) {
      const annotation = new window.maplayr.Annotation({
        position: poi.location,
        node() {
          const label = document.createElement('span');
          label.textContent = poi.name;
          label.className = styles.annotationLabel;

          const icon = document.createElement('img');
          icon.src = locationMarkerUrl?.src;
          icon.alt = poi.name;
          icon.className = styles.annotationIcon;

          icon.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            console.log('Icon clicked:', poi.name);
            console.log('Before toggle, style:', (label as HTMLElement).style.display);

            const labelEl = label as HTMLElement;
            const isVisible = labelEl.style.display === 'block';

            // hide all labels
            const labels = document.querySelectorAll<HTMLElement>(`.${styles.annotationLabel}`);
            labels.forEach((el) => {
              el.style.display = 'none';
            });

            if (!isVisible) {
              requestAnimationFrame(() => {
                labelEl.style.display = 'block';
                console.log('After toggle, style:', labelEl.style.display);
              });
            }
          });

          // Add double-click handler directly to icon
          icon.addEventListener('dblclick', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            calculateRouteToDestination(poi.location);
          });

          const container = document.createElement('div');
          container.className = styles.annotation;
          container.appendChild(icon);
          container.appendChild(label);
          return container;
        },
      });

      layer.add(annotation);

      // Add right-click for routing
      annotation.addEventListener('contextmenu', (e: any) => {
        e.preventDefault();
        calculateRouteToDestination(poi.location);
      });

      // Single click for camera movement (with delay to not conflict with double-click)
      let clickTimeout: NodeJS.Timeout;
      annotation.addEventListener('click', () => {
        clickTimeout = setTimeout(() => {
          mapView.moveCamera({
            position: poi.location,
            span: 20,
            heading: 360 * Math.random(),
            animated: true,
          });
        }, 300);
      });

      // Double-click handler for routing
      annotation.addEventListener('dblclick', () => {
        clearTimeout(clickTimeout);
        calculateRouteToDestination(poi.location);
      });
    }
    // Customize the appearance (optional)
    userLocationMarker.fillColor = '#9100b5ff';

    // Add the user location marker to the map view
    mapView.addUserLocationMarker(userLocationMarker);

    // Debug logs for position updates
    locationProvider.addEventListener('position', (event: any) => {
      console.log('User position update:', event.position);
    });

    // Handle geolocation errors
    locationProvider.addEventListener('error', (event: any) => {
      console.error('Geolocation error:', event.error);
    });

    // --- Routing ---
    // Routing functionality is available via double-clicking POI markers
  };

  // Ensure script is loaded before init
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

  return (
    <>
      <Script
        src='https://cdn.attractions.io/frameworks/maplayr-web/v0.3/maplayr.js'
        strategy='lazyOnload'
      />
      <div ref={mapRef} id='map' style={{ width: '100%', height: '100vh' }} />
    </>
  );
};

export default MapLayrMap;

import React, { memo, useState, useCallback, useEffect } from 'react';
import { GoogleMap, Data, Marker } from '@react-google-maps/api';

const containerStyle = {
  height: '255px',
};

const dataOptions: any = {
  clickable: false,
  draggable: false,
  editable: false,
  fillOpacity: 1,
  strokeOpacity: 1,
  strokeWeight: 2,
  title: 'Title',
  visible: true,
  zIndex: 2000,
  Marker,
};

const LocationMap = (props: any) => {
  const [initialViewPoint, setInitialViewPoint] = useState(1);
  const [map, setMap] = useState(null);
  const center = {
    lat: props?.lat && Number(props?.lat),
    lng: props?.lng && Number(props?.lng),
  };

  const onLoad = useCallback(function callback(map: any) {
    const bounds = new window.google.maps.LatLngBounds();
    map?.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // A hack to re-render the map and display the marker based on selected lat / long values.
  useEffect(() => {
    if (initialViewPoint === 1) {
      setTimeout(() => {
        setInitialViewPoint(10);
      }, 200);
    }
  }, [initialViewPoint]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={initialViewPoint}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ streetViewControl: false, disableDefaultUI: true }}
      clickableIcons
    >
      <Data options={dataOptions} />
      {props.lat && props.lng && <Marker position={{ lat: center.lat, lng: center.lng }} />}
    </GoogleMap>
  );
};

export default memo(LocationMap);

import { parseTime12To24 } from './functions';

function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary); // No warning now since bytes are safe ASCII
}

export function getGoogleCalendarUrl(
  activity: any,
  activityName: any,
  hotelName: any,
  endDate: any,
) {
  if (!activity?.startDate || !activity?.startTime || !activity?.endTime) {
    console.warn('Skipping Google Calendar URL: missing date/time', activity);
    return '#'; // fallback link
  }

  const startTime24 = parseTime12To24(activity?.startTime); // "21:00:00"
  const endTime24 = parseTime12To24(activity?.endTime);

  if (!startTime24 || !endTime24) {
    console.warn('Failed to parse time:', activity?.startTime, activity?.endTime);
    return '';
  }

  const startDateTime = `${activity?.startDate}T${startTime24}`;
  const endDateTime = `${activity?.startDate}T${endTime24}`;

  const startDateObj = new Date(startDateTime);
  const endDateObj = new Date(endDateTime);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    console.error('Invalid date for Google Calendar:', activity);
    return '#';
  }

  const start = startDateObj.toISOString().replace(/-|:|\.\d+/g, '');
  const end =
    endDate === undefined
      ? endDateObj.toISOString().replace(/-|:|\.\d+/g, '')
      : endDate.toISOString().replace(/-|:|\.\d+/g, '');

  const locationValue =
    activity?.location && hotelName
      ? `${activity?.location} - ${hotelName}`
      : hotelName || activity?.location || '';

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    activity?.itineraryName || activityName || 'Activity',
  )}&details=${encodeURIComponent(activity.description || '')}&location=${encodeURIComponent(
    locationValue,
  )}&dates=${start}/${end}`;
}

export function getICalUrl(activity: any, activityName: any, hotelName: any, endDate: any) {
  if (!activity?.startDate || !activity?.startTime || !activity?.endTime) return '#';

  const startTime24 = parseTime12To24(activity?.startTime);
  const endTime24 = parseTime12To24(activity?.endTime);
  if (!startTime24 || !endTime24) return '#';

  const startDateTime = `${activity?.startDate}T${startTime24}`;
  const endDateTime = `${activity?.startDate}T${endTime24}`;
  const startDateObj = new Date(startDateTime);
  const endDateObj = new Date(endDateTime);
  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) return '#';

  const dtStart = startDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtEnd = endDate
    ? endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : endDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${Date.now()}@yourdomain.com`;

  const locationValue =
    activity?.location && hotelName
      ? `${activity?.location} - ${hotelName}`
      : hotelName || activity?.location || '';

  const escapeICSText = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YourCompany//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICSText(activity?.itineraryName || activityName || 'Activity')}`,
    `DESCRIPTION:${escapeICSText(activity.description || '')}`,
    `LOCATION:${escapeICSText(locationValue)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsContent = lines.join('\r\n');

  const base64 = base64Encode(icsContent);

  return `data:text/calendar;charset=utf-8;base64,${base64}`;
}

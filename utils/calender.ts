import { parseTime12To24 } from './functions';

export function generateICS(activity: any) {
  if (!activity.startDate || !activity.startTime || !activity.endTime) {
    console.warn('Skipping ICS generation: missing date/time', activity);
    return '';
  }

  const startTime24 = parseTime12To24(activity.startTime); // "21:00:00"
  const endTime24 = parseTime12To24(activity.endTime);

  if (!startTime24 || !endTime24) {
    console.warn('Failed to parse time:', activity.startTime, activity.endTime);
    return '';
  }

  const startDateTime = `${activity.startDate}T${startTime24}`;
  const endDateTime = `${activity.startDate}T${endTime24}`;

  console.log('startDateTime', startDateTime, 'endDateTime', endDateTime);

  return `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MyApp//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:${activity.id || 'event'}@example.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDateTime)}
DTEND:${formatICSDate(endDateTime)}
SUMMARY:${activity.title || 'Activity'}
DESCRIPTION:${activity.description || ''}
LOCATION:${activity.location || ''}
END:VEVENT
END:VCALENDAR`;
}

function formatICSDate(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.error('Invalid date for ICS:', date);
    return '';
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function getGoogleCalendarUrl(activity: any) {
  if (!activity.startDate || !activity.startTime || !activity.endTime) {
    console.warn('Skipping Google Calendar URL: missing date/time', activity);
    return '#'; // fallback link
  }

  const startTime24 = parseTime12To24(activity.startTime); // "21:00:00"
  const endTime24 = parseTime12To24(activity.endTime);

  if (!startTime24 || !endTime24) {
    console.warn('Failed to parse time:', activity.startTime, activity.endTime);
    return '';
  }

  const startDateTime = `${activity.startDate}T${startTime24}`;
  const endDateTime = `${activity.startDate}T${endTime24}`;

  const startDateObj = new Date(startDateTime);
  const endDateObj = new Date(endDateTime);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    console.error('Invalid date for Google Calendar:', activity);
    return '#';
  }

  const start = startDateObj.toISOString().replace(/-|:|\.\d+/g, '');
  const end = endDateObj.toISOString().replace(/-|:|\.\d+/g, '');

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    activity.title || 'Activity',
  )}&details=${encodeURIComponent(activity.description || '')}&location=${encodeURIComponent(
    activity.location || '',
  )}&dates=${start}/${end}`;
}

export function getICalUrl(activity: any) {
  if (!activity.startDate || !activity.startTime || !activity.endTime) {
    console.warn('Skipping iCal URL: missing date/time', activity);
    return '#';
  }

  const startTime24 = parseTime12To24(activity.startTime); // e.g. "21:00:00"
  const endTime24 = parseTime12To24(activity.endTime);

  if (!startTime24 || !endTime24) {
    console.warn('Failed to parse time:', activity.startTime, activity.endTime);
    return '#';
  }

  const startDateTime = `${activity.startDate}T${startTime24}`;
  const endDateTime = `${activity.startDate}T${endTime24}`;

  const startDateObj = new Date(startDateTime);
  const endDateObj = new Date(endDateTime);

  if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
    console.error('Invalid date for iCal:', activity);
    return '#';
  }

  const dtStart = startDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dtEnd = endDateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${activity.url || ''}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${activity.title || 'Activity'}
DESCRIPTION:${activity.description || ''}
LOCATION:${activity.location || ''}
END:VEVENT
END:VCALENDAR`;

  // Create a downloadable blob URL
  const blob = new Blob([icsContent.trim()], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

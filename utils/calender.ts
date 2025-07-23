import { parseTime12To24 } from './functions';

export function getGoogleCalendarUrl(activity: any, activityName: any, hotelName: any) {
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
  console.log(activity, 'activity');

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
    activity.name || activityName || 'Activity',
  )}&details=${encodeURIComponent(activity.description || '')}&location=${encodeURIComponent(
    hotelName || activity.location,
  )}&dates=${start}/${end}`;
}

export function getICalUrl(activity: any, activityName: any, hotelName: any) {
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
SUMMARY:${activity.name || activityName || 'Activity'}
DESCRIPTION:${activity.description || ''}
LOCATION:${hotelName || activity.location}
END:VEVENT
END:VCALENDAR`;

  // Create a downloadable blob URL
  const blob = new Blob([icsContent.trim()], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

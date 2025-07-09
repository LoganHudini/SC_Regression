import dayjs from 'dayjs';
import { convertTo12HourFormatSmallCase } from './functions';

export const generateItineraryHTML = (
  checkedInData: any,
  bookedActivities: any[],
  allActivities: any[],
  imageUrl: string,
): string => {
  // Filter Confirmed activities
  const filteredActivities = bookedActivities.filter((item) => item?.status === 'Confirmed');

  // Sort by start time
  const sortedActivities = filteredActivities.sort((a: any, b: any) => {
    // Helper function to extract date and time from an item
    const getDateTime = (item: any): Date => {
      const slotId = item?.slotId?.split('#') || [];
      const datePart = slotId[0];
      const fromTimeRaw = slotId[1];

      if (!datePart || !fromTimeRaw) {
        return new Date(0); // Fallback for invalid data
      }

      const startDate = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
      const startTime = convertTo12HourFormatSmallCase(fromTimeRaw.replace(':', ':'));
      return new Date(`${startDate} ${startTime}`);
    };

    const dateA = getDateTime(a);
    const dateB = getDateTime(b);

    return dateA.getTime() - dateB.getTime();
  });

  // Generate HTML for each activity
  const htmlRows = sortedActivities
    .map((item: any) => {
      const data = bookedActivities?.find((allItem) => item?.activityId === allItem?.id);
      if (!data) return '';
      const slotId = item?.slotId?.split('#') || '';
      const slotIdData = item?.slotId || '';
      const activityBookingId = item?.bookingId || '';
      const datePart = slotId?.[0];
      const fromTimeRaw = slotId?.[1];
      const toTimeRaw = slotId?.[2];
      const startDate = `${datePart?.slice(0, 4)}-${datePart?.slice(4, 6)}-${datePart?.slice(
        6,
        8,
      )}`;
      const startTime = convertTo12HourFormatSmallCase(fromTimeRaw?.replace(':', ':'));
      const activityDay = dayjs(startDate)?.format('dddd');
      const activityDate = dayjs(startDate)?.format('D MMM');

      return `
        <div style="display: flex; align-items: flex-start;">
          <div style="min-width: 80px; padding-right: 15px; text-align: right;">
            <div style="margin-top: 5px; font-size: 10px; color: #666; text-transform: uppercase;">${activityDay}</div>
            <div style="font-size: 24px;"><b>${activityDate}</b></div>
          </div>
          <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 15px;">
            <div style="margin-bottom: 20px; position: relative;">
              <div style="position: absolute; width: 10px; height: 10px; border-radius: 50%; background: #CCCCCC; left: -20px;"></div>
              <div style="font-size: 20px; margin-bottom: 5px;"><b>${
                item?.itineraryName || ''
              }</b></div>
              <div style="font-size: 20px; margin-bottom: 5px;"><b>${
                item?.startTime || ''
              }</b></div>
              <div style="font-size: 14px; color: #666; line-height: 1.4;">
                ${(item?.description || '').replace(/\n/g, '<br>')}${
        data?.description ? '<br><br>' : ''
      }
              </div>
            </div>
          </div>
        </div>`;
    })
    .join('');

  return `
  <body style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Times New Roman', serif; background-color: #F8F8F8; max-width: 450px; color: #333; margin: auto;">
    <div style="max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background-color: #F8F8F8;">
      <!-- Banner -->
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="Hotel Image" style="width: 100%; height: 200px; "/>`
          : ''
      }

      <!-- Greeting -->
      <div style="padding: 30px; background-color: #FFFFFF; margin: 20px;">
        <p style="font-size: 14px; color: #666; letter-spacing: 1px; margin-bottom: 4px; text-align: center;">
          Welcome, ${checkedInData.firstName} ${checkedInData.lastName}
        </p>
        <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 25px; text-align: center;">
          Here's Your Itinerary
        </h1>

        <!-- Activities Loop -->
        ${htmlRows}

        <!-- Footer -->
        <div style="font-size: 12px; color: #393939; text-align: center; padding: 0 20px 20px;">
          Update plans, add experiences, or make changes - <br><b>your stay, your way.</b>
        </div>
      </div>
    </div>
  </body>`;
};

import dayjs from 'dayjs';
import { convertTo12HourFormatSmallCase } from './functions';

// Interface for grouped activities
interface GroupedActivity {
  day: string;
  date: string;
  activities: Array<{
    activityId: string;
    slotId: string;
    book: any;
    itineraryName: string;
    startTime: string;
    description: string;
    data: any;
  }>;
}

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

  // Group activities by date
  const groupedActivities = sortedActivities.reduce<Record<string, GroupedActivity>>(
    (acc, item: any) => {
      const data = bookedActivities?.find((allItem) => item?.activityId === allItem?.id);
      if (!data) return acc;

      const slotId = item?.slotId?.split('#') || [];
      const datePart = slotId[0];
      if (!datePart) return acc;

      const fromTimeRaw = slotId[1];
      const startDate = `${datePart?.slice(0, 4)}-${datePart?.slice(4, 6)}-${datePart?.slice(
        6,
        8,
      )}`;
      const startTime = convertTo12HourFormatSmallCase(fromTimeRaw?.replace(':', ':'));
      const activityDay = dayjs(startDate)?.format('dddd');
      const activityDate = dayjs(startDate)?.format('D MMM');

      // Use activityDate as the grouping key
      if (!acc[activityDate]) {
        acc[activityDate] = {
          day: activityDay,
          date: activityDate,
          activities: [],
        };
      }

      // Add the enriched activity to the group
      acc[activityDate].activities.push({
        ...item,
        data,
        startTime,
      });

      return acc;
    },
    {},
  );

  // Generate HTML for grouped activities
  const htmlRows = Object.entries(groupedActivities)
    .map(
      ([dateKey, { day, date, activities }]) => `
      <div style="margin-bottom: 30px;">
        <div style="display: flex; align-items: flex-start;">
          <div style="min-width: 80px; padding-right: 15px; text-align: right;">
            <div style="margin-top: 5px; font-size: 10px; color: #666; text-transform: uppercase;">${day}</div>
            <div style="font-size: 24px;"><b>${date}</b></div>
          </div>
          <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 15px;">
            ${activities
              .map(
                (activity) => `
                <div style="margin-bottom: 20px; position: relative;">
                  <div style="position: absolute; width: 10px; height: 10px; border-radius: 50%; background: #CCCCCC; left: -20px;"></div>
                  <div style="font-size: 20px; margin-bottom: 5px;"><b>${
                    activity.itineraryName || ''
                  }</b></div>
                  <div style="font-size: 20px; margin-bottom: 5px;"><b>${
                    activity.startTime || ''
                  }</b></div>
                  <div style="font-size: 14px; color: #666; line-height: 1.4;">
                    ${(activity.description || '').replace(/\n/g, '<br>')}${
                  activity.data?.description ? '<br><br>' : ''
                }
                  </div>
                </div>
              `,
              )
              .join('')}
          </div>
        </div>
      </div>
    `,
    )
    .join('');

  return `
  <body style="margin: 0; padding: 0; box-sizing: border-box; font-family: 'Times New Roman', serif; background-color: #F8F8F8; max-width: 450px; color: #333; margin: auto;">
    <div style="max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background-color: #F8F8F8;">
      <!-- Banner -->
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="Hotel Image" style="width: 100%; height: 200px; " crossorigin="anonymous"/>`
          : ''
      }

      <!-- Greeting -->
      <div style="padding: 30px; background-color: #FFFFFF; margin: 20px;">
        <h1 style="font-size: 18px; font-weight: 600; letter-spacing: 1px; margin-bottom: 2px; text-align: center;">
          Welcome, ${checkedInData.firstName} ${checkedInData.lastName}!
        </h1>
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

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
    timeValue: string;
    startTime: string;
    description: string;
    data: any;
    status: any;
  }>;
}

export const generateItineraryHTML = (
  checkedInData: any,
  bookedActivities: any[],
  allActivities: any[],
  imageUrl: string,
  path: string,
  hotelName: any,
  description: any,
): string => {
  let location = description;

  location = [
    location.addressLine1,
    location.addressLine2,
    location.area,
    location.city,
    location.state?.trim(),
    location.postalCode,
    location.country,
  ]
    .filter(Boolean) // removes undefined, null, or empty strings
    .join(', ');
  // Filter Confirmed activities
  const filteredActivities = bookedActivities.filter(
    (item) =>
      item?.status === 'Confirmed' ||
      item?.itineraryType === 'CheckIn' ||
      item?.status === 'WaitingList',
  );

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
      const toTimeRaw = slotId[2];
      const startDate = `${datePart?.slice(0, 4)}-${datePart?.slice(4, 6)}-${datePart?.slice(
        6,
        8,
      )}`;
      const startTime = convertTo12HourFormatSmallCase(fromTimeRaw?.replace(':', ':'));
      const endTime = convertTo12HourFormatSmallCase(toTimeRaw?.replace(':', ':'));

      const activityDay = dayjs(startDate)?.format('dddd');
      const activityDate = dayjs(startDate)?.format('D MMM');

      const timeValue =
        item?.itineraryType === 'CheckIn'
          ? startTime
          : startTime && endTime
          ? `${startTime} - ${endTime}`
          : startTime;

      const status = item?.status;

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
        endTime,
        timeValue,
        status,
      });

      return acc;
    },
    {},
  );

  // Generate HTML for grouped activities
  const htmlRows = Object.entries(groupedActivities)
    .map(
      ([dateKey, { day, date, activities }]) => `
      <div style="margin-bottom: 30px; ">
        <div style="display: flex; align-items: flex-start;">
          <div style="min-width: 80px; padding-right: 15px; text-align: right; ">
            <div style="margin-top: 5px; font-family: 'ITC Franklin Gothic Std'; font-size: 10px; lineHeight: 14px; color: #666; text-transform: uppercase;">${day}</div>
            <div style="font-family: 'ITC Franklin Gothic Std', 'Arial', sans-serif; font-size: 21px;"><b>${date}</b></div>
          </div>
          <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 15px; break-inside: avoid; page-break-inside: avoid;">
            ${activities
              .map(
                (activity) => `
                <div style="margin-bottom: 20px; position: relative; break-inside: avoid; page-break-inside: avoid;">
                  <div style="position: absolute; width: 10px; height: 10px; border-radius: 50%; background: ${
                    activity?.status === 'WaitingList' ? '#FF0000' : '#CCCCCC'
                  }; left: -20px; break-inside: avoid; page-break-inside: avoid;"></div>

                  <div style="font-family: 'Domaine Display', serif; fontSize: 14px; lineHeight: 17px; marginBottom: 5px; word-break: break-word; white-space: normal; break-inside: avoid; page-break-inside: avoid;"><b>${
                    activity.itineraryName === 'CheckIn'
                      ? `Check in to ${hotelName}`
                      : activity.itineraryName || ''
                  }</b></div>
                  <div style="font-family: 'ITC Franklin Gothic Std', 'Arial', sans-serif; lineHeight: 20px; font-size: 16px; font-weight: bold; margin-bottom: 5px; word-break: break-word; white-space: normal; break-inside: avoid; page-break-inside: avoid;"><b>${
                    activity?.timeValue || activity?.startTime || ''
                  }</b></div>
                  <div style="break-inside: avoid; page-break-inside: avoid;">
                  ${
                    activity?.status === 'WaitingList'
                      ? `
                    <p style="font-family:'ITC Franklin Gothic Std', 'Arial', sans-serif; font-size: 10px; color: #FF0000; padding-top: 2px; padding-bottom: 2px; word-break: break-word; white-space: normal; text-align: justify;">
                   <b> Waiting List </b>
                    </p>`
                      : ''
                  }
                  <p style="font-family:'ITC Franklin Gothic Std', 'Arial', sans-serif; font-size: 10px; color: #666666; line-height: 14px; word-break: break-word; white-space: normal; text-align: justify;">
                   ${
                     activity.itineraryName === 'CheckIn'
                       ? location
                       : (activity.description || '').replace(/\n/g, '<br>')
                   }
                   ${
                     activity.itineraryName !== 'CheckIn' && activity?.data?.description
                       ? '<br><br>'
                       : ''
                   }
                  </p>
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
          ? `<img src="${imageUrl}" alt="Hotel Image" style="width: 100%; height: 200px; "alt="Hotel Image" crossorigin="anonymous" style="width: 100%; height: 200px;"/>`
          : ''
      }

      <!-- Greeting -->
      <div style="padding: 30px; background-color: #FFFFFF; margin: 20px; break-inside: avoid; page-break-inside: avoid;">
        <h1 style="font-family: 'Domaine Display'; font-size: 18px;  line-height: 27px; font-weight: 600; letter-spacing: 1px; margin-bottom: 2px; text-align: center;">
          Welcome, ${
            checkedInData?.firstName
              ? checkedInData.firstName.charAt(0).toUpperCase() + checkedInData.firstName.slice(1)
              : ''
          }
            ${
              checkedInData?.lastName
                ? checkedInData.lastName.charAt(0).toUpperCase() + checkedInData.lastName.slice(1)
                : ''
            }!
        </h1>
        <h1 style="font-family: 'Domaine Display'; font-size: 22px; line-height: 27px; font-weight: 600; margin-bottom: 25px; text-align: center;">
          Here's Your Itinerary
        </h1>

        <!-- Activities Loop -->
        ${htmlRows}
      </div>
      <!-- Footer -->
        <div style="font-size: 12px; color: #393939; text-align: center; padding: 0 20px 20px; word-break: break-word; white-space: normal: break-inside: avoid; page-break-inside: avoid;">
          Update plans, add experiences, or make changes - <br><b>your stay, your way.</b>
          <div style="padding-top: 8px; word-break: break-word; white-space: normal">
            <a href="${path}"
              style="display: inline-block; width: 201px; height: 23px; background: #333333;
                border: 1px solid #333333; opacity: 1; text-align: center;
                font-family: 'ITC Franklin Gothic Std', 'Arial', sans-serif;
                font-size: 16px; font-weight: 600; line-height: 22px;
                letter-spacing: 0.26px; color: #FFFFFF; text-transform: uppercase;
                text-decoration: none; padding: 7px 0; white-space: nowrap;">
            MANAGE ITINERARY
            </a>
          </div>
        </div>
    </div>
  </body>`;
};

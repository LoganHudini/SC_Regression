import { gql } from '@apollo/client';

export interface IGetActivitiesApiResponse {
  getActivitiesV2: {
    activities: {
      createdAt: string;
      createdBy: string;
      description: string;
      highlights: string;
      hotelId: string;
      icon: string;
      id: string;
      images: {
        index: number;
        fileName: string;
        master: string;
        ratio16to9: string;
        ratio1to1: string;
        ratio21to9: string;
        ratio9to16: string;
        ratio9to21: string;
      }[];
      isActive: boolean;
      label: string;
      location: string;
      name: string;
      activityLocation: {
        hotelLocation: string;
        addressLine1: string;
        addressLine2: string;
        area: string;
        city: string;
        country: string;
        latitude: number;
        longitude: number;
        postalCode: string;
        state: string;
        timezone: string;
        url: string;
        urlTitle: string;
        locationType: string;
      };
      schedule: any;
      information: {
        type: string;
        email: string;
        phone: string;
        URL: string;
        title: string;
        displayTitle: string;
      };
      bannerImage: {
        index: number;
        fileName: string;
        master: string;
        ratio16to9: string;
        ratio1to1: string;
        ratio21to9: string;
        ratio9to16: string;
        ratio9to21: string;
      };
      customAttributes: {
        key: string;
        value: string;
      }[];
      status: string;
      bannerImageStatus: string;
      capacity: number;
      categoryId: string;
      categoryName: string;
      price: number;
      residentsOnly: boolean;
      updatedAt: string;
      updatedBy: string;
      tags: any;
    }[];
    nextToken?: string;
  };
}

export const GET_ACTIVITIES = gql`
  query MyQuery(
    $hotelId: String!
    $id: String
    $startDate: String
    $endDate: String
    $categoryId: [String]
    $availability: [String]
    $priceType: [String]
    $location: [String]
    $limit: Int
    $pageToken: String
    $lang: String
  ) {
    getActivitiesV2(
      input: {
        hotelId: $hotelId
        id: $id
        startDate: $startDate
        endDate: $endDate
        categoryId: $categoryId
        availability: $availability
        priceType: $priceType
        location: $location
        limit: $limit
        pageToken: $pageToken
        lang: $lang
      }
    ) {
      activities {
        createdAt
        createdBy
        description
        highlights
        hotelId
        icon
        id
        images {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
          ratio9to16
          ratio9to21
        }
        isActive
        label
        location
        name
        activityLocation {
          hotelLocation
          addressLine1
          addressLine2
          area
          city
          country
          latitude
          longitude
          postalCode
          state
          timezone
          url
          urlTitle
          locationType
        }
        schedule {
          alwaysActive
          endTime
          oneTime {
            date
          }
          recurring {
            dates
            endDate
            recursWeek
            recurs
            startDate
            recurringTimeSlots {
              startTime
              endTime
            }
          }
          scheduleType
          startTime
        }
        information {
          type
          email
          phone
          URL
          title
          displayTitle
        }
        bannerImage {
          fileName
          index
          master
          ratio16to9
          ratio1to1
          ratio21to9
          ratio9to16
          ratio9to21
        }
        customAttributes {
          key
          value
        }
        status
        bannerImageStatus
        capacity
        categoryId
        categoryName
        price
        residentsOnly
        updatedAt
        updatedBy
        tags
      }
      nextToken
    }
  }
`;

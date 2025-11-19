import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { ActivityDetailDrawer } from '../ActivityDetailDrawer';
import { GET_RESERVATION } from 'core/graphql/queries/GET_RESERVATION';
import { CREATE_ACTIVITY_BOOKING } from 'core/graphql/queries/CREATE_ACTIVITY_BOOKING';
import { UPDATE_ACTIVITY_BOOKING } from 'core/graphql/queries/UPDATE_ACTIVITY_BOOKING';
import { CANCEL_ACTIVITY_BOOKING } from 'core/graphql/queries/CANCEL_ACTIVITY_BOOKING';
import dayjs from 'dayjs';

// Mock the required modules
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('utils/hooks/useConfiguration', () => ({
  useConfig: () => ({
    hotelId: 'test-hotel-id',
  }),
}));

jest.mock('storage/trips.storage', () => ({
  getTrips: jest.fn().mockReturnValue({
    reservationId: 'test-reservation-id',
    roomNumber: '101',
    checkInDate: '2025-01-01',
    checkOutDate: '2025-01-07',
    firstName: 'John',
    lastName: 'Doe',
  }),
}));

const mockShowSelectedActivity = {
  id: 'activity-1',
  categoryId: 'category-1',
  guests: 1,
  capacity: 10,
  schedule: {
    scheduleType: 'RECURRING',
    recurring: {
      recurringTimeSlots: [
        {
          startTime: '10:00',
          endTime: '11:00',
          displayTime: '10:00 AM - 11:00 AM',
          __typename: 'RecurringTimeSlots',
        },
        {
          startTime: '14:00',
          endTime: '15:00',
          displayTime: '2:00 PM - 3:00 PM',
          __typename: 'RecurringTimeSlots',
        },
      ],
    },
  },
};

describe('ActivityDetailDrawer', () => {
  const mockCloseDrawer = jest.fn();
  const mockHandleFetchActivities = jest.fn();
  
  const mocks = [
    {
      request: {
        query: GET_RESERVATION,
      },
      result: {
        data: {
          getReservation: {
            data: {
              reservationId: 'test-reservation-id',
              roomTypes: [{ roomNumber: '101' }],
              details: {
                contactPerson: {
                  firstName: 'John',
                  lastName: 'Doe',
                },
              },
              packages: [{ code: 'PKG1' }],
            },
          },
        },
      },
    },
    {
      request: {
        query: CREATE_ACTIVITY_BOOKING,
        variables: {
          hotelId: 'test-hotel-id',
          activityId: 'activity-1',
          categoryId: 'category-1',
          confirmationId: 'test-reservation-id',
          room: '101',
          firstName: 'John',
          lastName: 'Doe',
          seats: 2,
          date: dayjs().format('YYYY-MM-DD'),
          fromTime: '10:00',
          toTime: '11:00',
          arrivalDate: '2025-01-01',
          departureDate: '2025-01-07',
          notes: '',
          packages: ['PKG1'],
        },
      },
      result: {
        data: {
          createActivityBooking: {
            message: 'Booking created successfully',
            success: true,
          },
        },
      },
    },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ActivityDetailDrawer
          closeDrawer={mockCloseDrawer}
          showSelectedActivity={mockShowSelectedActivity}
          handleFetchActivities={mockHandleFetchActivities}
          drawerstate={true}
          {...props}
        />
      </MockedProvider>
    );
  };

  // Test Suite 1: Booking Flow
  describe('Booking Flow', () => {
    it('renders the activity booking drawer', () => {
      renderComponent();
      expect(screen.getByText(/activity details/i)).toBeInTheDocument();
    });

    it('allows selecting number of participants', async () => {
      renderComponent();
      
      // Find and click the increment button
      const incrementButton = screen.getByLabelText('Increment');
      fireEvent.click(incrementButton);
      
      // Check if people count has increased
      const countDisplay = screen.getByTestId('people-count');
      expect(countDisplay).toHaveTextContent('2');
    });

    it('prevents selecting more participants than capacity', () => {
      const mockActivity = {
        ...mockShowSelectedActivity,
        guests: 10, // At capacity
      };
      
      renderComponent({ showSelectedActivity: mockActivity });
      
      const incrementButton = screen.getByLabelText('Increment');
      fireEvent.click(incrementButton);
      
      // Should still be at capacity (10)
      const countDisplay = screen.getByTestId('people-count');
      expect(countDisplay).toHaveTextContent('10');
    });
  });

  // Test Suite 2: Booking Confirmation
  describe('Booking Confirmation', () => {
    it('shows success message after booking', async () => {
      renderComponent();
      
      // Select a time slot
      const timeSlot = screen.getByText('10:00 AM - 11:00 AM');
      fireEvent.click(timeSlot);
      
      // Submit the form
      const bookButton = screen.getByText('Book Now');
      fireEvent.click(bookButton);
      
      // Wait for the success message
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
      });
    });
  });

  // Test Suite 3: Modify or Cancel Booking
  describe('Modify or Cancel Booking', () => {
    it('pre-fills form when in modify mode', () => {
      const modifyProps = {
        modifyBookingFlow: true,
        modifyActivityData: {
          seats: 2,
          startDate: '2025-01-02',
          startTime: '10:00',
          endTime: '11:00',
          activityBookingId: 'booking-123',
        },
      };
      
      renderComponent(modifyProps);
      
      // Check if the form is pre-filled with the correct values
      const countDisplay = screen.getByTestId('people-count');
      expect(countDisplay).toHaveTextContent('2');
    });

    it('shows cancel confirmation when cancel button is clicked', () => {
      const modifyProps = {
        modifyBookingFlow: true,
        modifyActivityData: {
          seats: 2,
          startDate: '2025-01-02',
          startTime: '10:00',
          endTime: '11:00',
          activityBookingId: 'booking-123',
        },
      };
      
      renderComponent(modifyProps);
      
      // Click cancel button
      const cancelButton = screen.getByText('Cancel Booking');
      fireEvent.click(cancelButton);
      
      // Check if confirmation dialog is shown
      expect(screen.getByText('Are you sure you want to cancel this booking?')).toBeInTheDocument();
    });
  });

  // Test Suite 4: Real-Time Availability
  describe('Real-Time Availability', () => {
    it('shows available time slots', () => {
      renderComponent();
      
      // Check if time slots are displayed
      expect(screen.getByText('10:00 AM - 11:00 AM')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM - 3:00 PM')).toBeInTheDocument();
    });

    it('disables fully booked time slots', () => {
      // Mock a fully booked time slot
      const mockActivity = {
        ...mockShowSelectedActivity,
        schedule: {
          ...mockShowSelectedActivity.schedule,
          recurring: {
            recurringTimeSlots: [
              {
                ...mockShowSelectedActivity.schedule.recurring.recurringTimeSlots[0],
                isFullyBooked: true,
              },
              mockShowSelectedActivity.schedule.recurring.recurringTimeSlots[1],
            ],
          },
        },
      };
      
      renderComponent({ showSelectedActivity: mockActivity });
      
      // The first time slot should be disabled
      const timeSlot = screen.getByText('10:00 AM - 11:00 AM').closest('button');
      expect(timeSlot).toBeDisabled();
    });
  });

  // Test Suite 5: Waitlist Functionality
  describe('Waitlist Functionality', () => {
    it('shows waitlist message when activity is fully booked', async () => {
      const waitlistMocks = [
        ...mocks,
        {
          request: {
            query: CREATE_ACTIVITY_BOOKING,
            variables: expect.any(Object),
          },
          result: {
            data: {
              createActivityBooking: {
                message: 'the booking is now on the waitinglist',
                success: true,
              },
            },
          },
        },
      ];
      
      render(
        <MockedProvider mocks={waitlistMocks} addTypename={false}>
          <ActivityDetailDrawer
            closeDrawer={mockCloseDrawer}
            showSelectedActivity={mockShowSelectedActivity}
            handleFetchActivities={mockHandleFetchActivities}
            drawerstate={true}
          />
        </MockedProvider>
      );
      
      // Select a time slot and submit
      const timeSlot = screen.getByText('10:00 AM - 11:00 AM');
      fireEvent.click(timeSlot);
      
      const bookButton = screen.getByText('Book Now');
      fireEvent.click(bookButton);
      
      // Check for waitlist message
      await waitFor(() => {
        expect(screen.getByText('You are on the waitlist')).toBeInTheDocument();
        expect(screen.getByText(/We will let you know if a spot becomes available/i)).toBeInTheDocument();
      });
    });
  });
});

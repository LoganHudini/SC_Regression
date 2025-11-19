export interface TimeSlot {
  displayTime: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ActivityData {
  id: string;
  title: string;
  description: string;
  capacity: number;
  schedule: {
    scheduleType: 'RECURRING' | 'ONE_TIME' | 'ALWAYS_ACTIVE';
    recurring?: {
      recurringTimeSlots: TimeSlot[];
    };
    oneTime?: {
      date: string;
      startTime: string;
      endTime: string;
    };
  };
}

export interface BookingData {
  id?: string;
  activityId: string;
  date: string;
  timeSlot: TimeSlot;
  participants: number;
  notes?: string;
  status?: 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roomNumber: string;
  reservationId: string;
}

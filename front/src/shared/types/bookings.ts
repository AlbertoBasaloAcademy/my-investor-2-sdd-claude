export type BookingStatus = 'created' | 'cancelled';

export interface Booking {
  id: string;
  launchId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  status: BookingStatus;
}

export interface BookingRequest {
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
}

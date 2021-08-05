export interface Slice {
  origin_name: string;
  // Airport name of departure location
  destination_name: string;
  // Airport name of arrival location
  duration: number;
  // Duration Result parameter containing the total travel time of the slice in minutes.
  flight_number: string;
  // Number of the flight
  departure_date_time_utc: string;
  arrival_date_time_utc: string;
}

export interface Flight {
  slices: Slice[];
  price: number;
}

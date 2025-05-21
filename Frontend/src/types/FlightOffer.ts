// src/types/FlightOffer.ts

export interface FlightOffer {
  id: string;
  price: {
    currency: string;
    total: string;
  };
  itineraries: {
    duration: string;
    segments: {
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      duration: string;
    }[];
  }[];
}

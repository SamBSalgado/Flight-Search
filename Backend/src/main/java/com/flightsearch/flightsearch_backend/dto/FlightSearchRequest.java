package com.flightsearch.flightsearch_backend.dto;

import lombok.Data;

@Data
public class FlightSearchRequest {
  private String departureAirport;
  private String arrivalAirport;
  private String departureDate;
  private String returnDate;
  private String currencyCode;
  private boolean nonStop;
}

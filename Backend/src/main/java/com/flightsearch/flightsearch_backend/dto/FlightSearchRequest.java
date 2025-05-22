package com.flightsearch.flightsearch_backend.dto;

import lombok.Data;

@Data
public class FlightSearchRequest {
  private String departureAirport;
  private String arrivalAirport;
  private String departureDate;
  private String returnDate;
  private int numberOfAdults;
  private String currencyCode;
  private Boolean nonStop;

  private Integer pageLimit;
  private Integer pageOffset;
}

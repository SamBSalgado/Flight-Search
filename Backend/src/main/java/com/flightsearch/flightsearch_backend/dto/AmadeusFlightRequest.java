package com.flightsearch.flightsearch_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AmadeusFlightRequest {
  private String currencyCode;
  private List<OriginDestination> originDestinations;
  private List<Traveler> travelers;
  private List<String> sources;
  private SearchCriteria searchCriteria;
  
  @Data
  @AllArgsConstructor
  public static class OriginDestination {
    private String id;
    private String originLocationCode;
    private String destinationLocationCode;
    private DepartureDateTimeRange departureDateTimeRange;
  }

  @Data
  @AllArgsConstructor
  public static class DepartureDateTimeRange {
    private String date;
    private String time;
  }

  @Data
  @AllArgsConstructor
  public static class Traveler {
    private String id;
    private String travelerType;
  }

  @Data
  @AllArgsConstructor
  public static class SearchCriteria {
    private int maxFlightOffers;
    private FlightFilters flightFilters;
  }

  @Data
  @AllArgsConstructor
  public static class FlightFilters {
    private List<CabinRestriction> cabinRestrictions;
  }

  @Data
  @AllArgsConstructor
  public static class CabinRestriction {
    private String cabin;
    private String coverage;
    private List<String> originDestinationIds;
  }
}
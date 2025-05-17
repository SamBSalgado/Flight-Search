package com.flightsearch.flightsearch_backend.service;
import com.flightsearch.flightsearch_backend.service.AmadeusAuthService;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.flightsearch.flightsearch_backend.dto.AmadeusFlightRequest;
import com.flightsearch.flightsearch_backend.dto.AmadeusFlightRequest.DepartureDateTimeRange;
import com.flightsearch.flightsearch_backend.dto.FlightSearchRequest;

@Slf4j
@Service
public class AmadeusFlightService {

  @Autowired
  private AmadeusAuthService amadeusAuthService;

  public String searchFlights(FlightSearchRequest request) {
    String accessToken = amadeusAuthService.getAccessToken();
    String url = "https://test.api.amadeus.com/v2/shopping/flight-offers";

    String currentTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));

    AmadeusFlightRequest.DepartureDateTimeRange departureDateTimeRange = new DepartureDateTimeRange(request.getDepartureDate(), currentTime);
    AmadeusFlightRequest.OriginDestination originDestination = new AmadeusFlightRequest.OriginDestination("1", request.getDepartureAirport(), request.getArrivalAirport(), departureDateTimeRange);
    AmadeusFlightRequest.Traveler traveler = new AmadeusFlightRequest.Traveler("1", "ADULT");
    AmadeusFlightRequest.CabinRestriction cabinRestriction = new AmadeusFlightRequest.CabinRestriction("ECONOMY", "MOST_SEGMENTS", List.of("1"));
    AmadeusFlightRequest.FlightFilters flightFilters = new AmadeusFlightRequest.FlightFilters(List.of(cabinRestriction));
    AmadeusFlightRequest.SearchCriteria searchCriteria = new AmadeusFlightRequest.SearchCriteria(10, flightFilters);
    
    AmadeusFlightRequest flightRequest = new AmadeusFlightRequest(
      "USD",
      List.of(originDestination),
      List.of(traveler),
      List.of("GDS"),
      searchCriteria
    );

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("X-HTTP-Method-Override", "GET");
    
    HttpEntity<AmadeusFlightRequest> entity = new HttpEntity<>(flightRequest, headers);
    
    RestTemplate restTemplate = new RestTemplate();

    try {
      ResponseEntity<String> response = restTemplate.exchange(
        url,
        HttpMethod.POST,
        entity,
        String.class
      );

      if (response.getStatusCode().is2xxSuccessful()) {
        return response.getBody();
      } else {
        log.error("Error al buscar vuelos. Codigo: {}", response.getStatusCode());
        throw new RuntimeException("Error al buscar vuelos en Amadeus");
      }
    } catch (Exception e){
      log.error("Excepción al buscar vuelos: {}", e.getMessage(), e);
      throw new RuntimeException("Error en la comunicacion con Amadeus", e);
    }
  }
}

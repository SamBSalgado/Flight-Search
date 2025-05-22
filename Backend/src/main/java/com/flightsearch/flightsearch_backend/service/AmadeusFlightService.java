package com.flightsearch.flightsearch_backend.service;
import com.flightsearch.flightsearch_backend.service.AmadeusAuthService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

// import com.flightsearch.flightsearch_backend.dto.AmadeusFlightRequest;
// import com.flightsearch.flightsearch_backend.dto.AmadeusFlightRequest.DepartureDateTimeRange;
import com.flightsearch.flightsearch_backend.dto.FlightSearchRequest;

@Slf4j
@Service
public class AmadeusFlightService {

  @Autowired
  private AmadeusAuthService amadeusAuthService;

  public String searchFlights(FlightSearchRequest request) {
    String accessToken = amadeusAuthService.getAccessToken();
    String url = "https://test.api.amadeus.com/v2/shopping/flight-offers";

    if (request.getDepartureAirport() == null || request.getArrivalAirport() == null || request.getDepartureDate() == null) {
      throw new IllegalArgumentException("Los campos obligatorios no pueden ser nulos: departureAirport, arrivalAirport, departureDate");
    }

    UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url)
      .queryParam("originLocationCode", request.getDepartureAirport())
      .queryParam("destinationLocationCode", request.getArrivalAirport())
      .queryParam("departureDate", request.getDepartureDate());

      int adults = request.getNumberOfAdults();
      if (adults <= 0) {
        adults = 1;
      }
      builder.queryParam("adults", adults);

      if (request.getReturnDate() != null && !request.getReturnDate().isEmpty()) {
        builder.queryParam("returnDate", request.getReturnDate());
      }

      if (request.getCurrencyCode() != null && !request.getCurrencyCode().isEmpty()) {
        builder.queryParam("currencyCode", request.getCurrencyCode());
      } else {
        builder.queryParam("currencyCode", "USD");
      }
    
      if (request.getNonStop() != null) {
        builder.queryParam("nonStop", request.getNonStop());
      }

      if (request.getPageLimit() != null) {
        builder.queryParam("page[limit]", request.getPageLimit());
      }

      if (request.getPageOffset() != null) {
        builder.queryParam("page[offset]", request.getPageOffset());
      }

    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));
    
    HttpEntity<String> entity = new HttpEntity<>(headers);
    RestTemplate restTemplate = new RestTemplate();

    try {
      ResponseEntity<String> response = restTemplate.exchange(
        builder.toUriString(),
        HttpMethod.GET,
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

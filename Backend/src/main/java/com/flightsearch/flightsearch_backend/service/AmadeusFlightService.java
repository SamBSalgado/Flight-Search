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

import com.flightsearch.flightsearch_backend.dto.FlightSearchRequest;

@Slf4j
@Service
public class AmadeusFlightService {

  @Autowired
  private AmadeusAuthService amadeusAuthService;

  public String searchFlights(FlightSearchRequest request) {
    String accessToken = amadeusAuthService.getAccessToken();
    String url = "https://test.api.amadeus.com/v2/shopping/flight-offers";

    // Validación de campos obligatorios
    if (request.getDepartureAirport() == null || request.getArrivalAirport() == null || request.getDepartureDate() == null) {
      throw new IllegalArgumentException("Los campos obligatorios no pueden ser nulos: departureAirport, arrivalAirport, departureDate");
    }

    UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url)
      .queryParam("originLocationCode", request.getDepartureAirport())
      .queryParam("destinationLocationCode", request.getArrivalAirport())
      .queryParam("departureDate", request.getDepartureDate());

    // Manejo de adultos - asegurar al menos 1
    int adults = request.getAdults();
    if (adults <= 0) {
      adults = 1;
    }
    builder.queryParam("adults", adults);
    
    // Manejo de niños - solo agregar si hay niños
    int children = request.getChildren();
    if (children > 0) {
      builder.queryParam("children", children);
    }

    // Fecha de regreso (opcional)
    if (request.getReturnDate() != null && !request.getReturnDate().isEmpty()) {
      builder.queryParam("returnDate", request.getReturnDate());
    }

    // Moneda - usar el método helper que tiene fallback a USD
    String currency = request.getCurrency();
    builder.queryParam("currencyCode", currency);
    
    // Non-stop (opcional)
    if (request.getNonStop() != null) {
      builder.queryParam("nonStop", request.getNonStop());
    }

    // Configurar headers
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(accessToken);
    headers.setAccept(java.util.Collections.singletonList(MediaType.APPLICATION_JSON));
    
    HttpEntity<String> entity = new HttpEntity<>(headers);
    RestTemplate restTemplate = new RestTemplate();

    try {
      // Log de la URL para debugging
      String finalUrl = builder.toUriString();
      log.info("Realizando petición a Amadeus: {}", finalUrl);
      log.info("Parámetros de búsqueda - Adultos: {}, Niños: {}, Moneda: {}", adults, children, currency);
      
      ResponseEntity<String> response = restTemplate.exchange(
        finalUrl,
        HttpMethod.GET,
        entity,
        String.class
      );

      if (response.getStatusCode().is2xxSuccessful()) {
        log.info("Búsqueda exitosa. Status: {}", response.getStatusCode());
        return response.getBody();
      } else {
        log.error("Error al buscar vuelos. Codigo: {}, Body: {}", response.getStatusCode(), response.getBody());
        throw new RuntimeException("Error al buscar vuelos en Amadeus: " + response.getStatusCode());
      }
    } catch (Exception e) {
      log.error("Excepción al buscar vuelos: {}", e.getMessage(), e);
      throw new RuntimeException("Error en la comunicacion con Amadeus", e);
    }
  }
}
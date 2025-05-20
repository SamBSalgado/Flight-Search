package com.flightsearch.flightsearch_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AirportSearchService {
  
  @Autowired
  private AmadeusAuthService authService;

  public String searchAirports(String searchTerm) {
    if (searchTerm == null || searchTerm.trim().isEmpty()) {
      throw new IllegalArgumentException("El término de búsqueda no puede estar vacío");
    }

    String accessToken = authService.getAccessToken();

    String url = "https://test.api.amadeus.com/v1/reference-data/locations";

    UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(url)
      .queryParam("subType", "AIRPORT")
      .queryParam("keyword", searchTerm);

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
        log.error("Error al buscar aeropuertos. Código: {}", response.getStatusCode());
        throw new RuntimeException("Error al buscar aeropuertos en Amadeus");
      }
    } catch (Exception e){
      log.error("Excepción al buscar aeropuertos: {}", e.getMessage(), e);
      throw new RuntimeException("Error en la comunicación con Amadeus", e);
    }
  }
}

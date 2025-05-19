package com.flightsearch.flightsearch_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.flightsearch.flightsearch_backend.config.AmadeusConfig;
import com.flightsearch.flightsearch_backend.dto.AmadeusTokenResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AmadeusAuthService {
  @Autowired
  private AmadeusConfig amadeusConfig;

  private AmadeusTokenResponse tokenResponse;

  private static final String AMADEUS_API_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";

  public String getAccessToken() {
    if (tokenResponse == null || tokenResponse.isExpired()) {
      log.info("El token no existe o ha expirado. Solicitando nuevo token...");
      retrieveAccessToken();
    } else {
      log.info("Usando token existente");
    }
    return tokenResponse.getAccessToken();
  }

  private void retrieveAccessToken() {
    RestTemplate restTemplate = new RestTemplate();

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

    String body = "grant_type=client_credentials"
                  + "&client_id=" + amadeusConfig.getClientId()
                  + "&client_secret=" + amadeusConfig.getClientSecret();
    
    HttpEntity<String> request = new HttpEntity<>(body, headers);
    
    try {
      ResponseEntity<AmadeusTokenResponse> response = restTemplate.exchange(
        AMADEUS_API_URL,
        HttpMethod.POST,
        request,
        AmadeusTokenResponse.class
      );

      if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
        tokenResponse = response.getBody();
        log.info("Token obtenido exitosamente");
      } else {
        log.error("Error al obtener el token. Código: {}", response.getStatusCode().value());
        throw new RuntimeException("Error al obtener el token de Amadeus");
      }
    } catch (Exception e) {
      log.error("Excepción al obtener el token: {}", e.getMessage(), e);
      throw new RuntimeException("Error al comunicarse con la API de Amadeus", e);
    }
  }
}

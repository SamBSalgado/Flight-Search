package com.flightsearch.flightsearch_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AmadeusConfig {
  @Value("${amadeus.client-id}")
  private String clientId;

  @Value("${amadeus.client-secret}")
  private String clientSecret;

  public String getClientId() {
    return clientId;
  }

  public String getClientSecret() {
    return clientSecret;
  }
  
}

package com.flightsearch.flightsearch_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AmadeusTokenResponse {
  @JsonProperty("access_token")
  private String accessToken;

  @JsonProperty("expires_in")
  private int expiresIn;

  @JsonProperty("token_type")
  private String tokenType;

  private long createdAt = System.currentTimeMillis();

  public String getAccessToken() {
    return accessToken;
  }

  public int getExpiresIn() {
    return expiresIn;
  }

  public long getExpirationTime() {
    return createdAt + (expiresIn * 1000L);
  }

  public boolean isExpired() {
    return System.currentTimeMillis() >= getExpirationTime();
  }
}
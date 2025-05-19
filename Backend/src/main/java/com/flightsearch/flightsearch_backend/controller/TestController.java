package com.flightsearch.flightsearch_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.flightsearch.flightsearch_backend.dto.FlightSearchRequest;
import com.flightsearch.flightsearch_backend.service.AmadeusAuthService;
import com.flightsearch.flightsearch_backend.service.AmadeusFlightService;

@RestController
public class TestController {

  private final AmadeusAuthService authService;
  private final AmadeusFlightService flightService;

  public TestController(AmadeusAuthService authService, AmadeusFlightService flightService) {
    this.authService = authService;
    this.flightService = flightService;
  }

  @GetMapping("/token")
  public String getToken() {
    return authService.getAccessToken();
  }

  @PostMapping("/buscar-vuelos")
  public ResponseEntity<String> searchFlights(@RequestBody FlightSearchRequest request) {
    String result = flightService.searchFlights(request);
    return ResponseEntity.ok(result);
  }
}

package com.flightsearch.flightsearch_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.flightsearch.flightsearch_backend.dto.FlightSearchRequest;
import com.flightsearch.flightsearch_backend.service.AirportSearchService;
import com.flightsearch.flightsearch_backend.service.AmadeusAuthService;
import com.flightsearch.flightsearch_backend.service.AmadeusFlightService;

@RestController
public class TestController {

  private final AmadeusAuthService authService;
  private final AmadeusFlightService flightService;
  private final AirportSearchService airportSearchService;

  public TestController(AmadeusAuthService authService, AmadeusFlightService flightService, AirportSearchService airportSearchService) {
    this.authService = authService;
    this.flightService = flightService;
    this.airportSearchService = airportSearchService;
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

  @GetMapping("buscar-aero")
  public ResponseEntity<String> searchAirports(@RequestParam String keyword) {
    try {
      String result = airportSearchService.searchAirports(keyword);
      return ResponseEntity.ok(result);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("{\"error\": \"Error al buscar aeropuertos: " + e.getMessage() + "\"}");
    }
  }
}

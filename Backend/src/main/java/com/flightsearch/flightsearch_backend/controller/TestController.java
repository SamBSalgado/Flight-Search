package com.flightsearch.flightsearch_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flightsearch.flightsearch_backend.service.AmadeusAuthService;

@RestController
public class TestController {

  private final AmadeusAuthService authService;

  public TestController(AmadeusAuthService authService) {
    this.authService = authService;
  }

  @GetMapping("/token")
  public String getToken() {
    return authService.getAccessToken();
  }
}

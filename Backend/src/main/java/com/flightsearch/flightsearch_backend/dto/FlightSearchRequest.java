package com.flightsearch.flightsearch_backend.dto;

import lombok.Data;

@Data
public class FlightSearchRequest {
  private String departureAirport;
  private String arrivalAirport;
  private String departureDate;
  private String returnDate;
  private int adults;           // Cambiado de numberOfAdults a adults
  private int children;         // Nuevo campo para niños
  private String currencyCode;  // Renombrado de currency a currencyCode para consistencia
  private Boolean nonStop;
  
  // Método helper para obtener el total de adultos (manteniendo compatibilidad)
  public int getNumberOfAdults() {
    return this.adults > 0 ? this.adults : 1; // Asegurar al menos 1 adulto
  }
  
  // Método helper para obtener el total de pasajeros
  public int getTotalPassengers() {
    return getNumberOfAdults() + (this.children > 0 ? this.children : 0);
  }
  
  // Método para obtener la moneda, con fallback a USD
  public String getCurrency() {
    return this.currencyCode != null && !this.currencyCode.isEmpty() ? this.currencyCode : "USD";
  }
}
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { FlightOffer } from "../../types/FlightOffer";

interface SearchParams {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  currency: string;
  nonStop: boolean;
}

// Tasas de cambio fijas (puedes actualizarlas periódicamente)
interface ExchangeRates {
  USD: number;
  EUR: number;
  MXN: number;
}

interface SearchState {
  params: SearchParams | null;
  results: FlightOffer[];
  formData: {
    departureAirport: string;
    arrivalAirport: string;
    departureDate: string;
    returnDate: string;
    adults: number;
    currency: string;
    nonStop: boolean;
    departureQuery: string;
    arrivalQuery: string;
  } | null;
  exchangeRates: ExchangeRates;
  currentDisplayCurrency: string;
  originalCurrency: string; // Nueva propiedad para recordar la moneda original de la búsqueda
}

const initialState: SearchState = {
  params: null,
  results: [],
  formData: null,
  exchangeRates: {
    USD: 1.0,      // Base currency
    EUR: 0.85,     // 1 USD = 0.85 EUR (aproximado)
    MXN: 18.5,     // 1 USD = 18.5 MXN (aproximado)
  },
  currentDisplayCurrency: 'USD',
  originalCurrency: 'USD',
};

// Función helper para convertir precios
export const convertPrice = (
  price: string | number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRates: ExchangeRates
): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (fromCurrency === toCurrency) {
    return numericPrice.toFixed(2);
  }
  
  // Convertir a USD primero (si no está en USD)
  let priceInUSD = numericPrice;
  if (fromCurrency !== 'USD') {
    priceInUSD = numericPrice / exchangeRates[fromCurrency as keyof ExchangeRates];
  }
  
  // Convertir de USD a la moneda objetivo
  let finalPrice = priceInUSD;
  if (toCurrency !== 'USD') {
    finalPrice = priceInUSD * exchangeRates[toCurrency as keyof ExchangeRates];
  }
  
  return finalPrice.toFixed(2);
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchParams(state, action: PayloadAction<SearchParams>) {
      state.params = action.payload;
      // Actualizar la moneda original cuando se hace una nueva búsqueda
      state.originalCurrency = action.payload.currency;
      state.currentDisplayCurrency = action.payload.currency;
    },
    setSearchResults(state, action: PayloadAction<FlightOffer[]>) {
      state.results = action.payload;
    },
    setFormData(state, action: PayloadAction<{
      departureAirport: string;
      arrivalAirport: string;
      departureDate: string;
      returnDate: string;
      adults: number;
      currency: string;
      nonStop: boolean;
      departureQuery: string;
      arrivalQuery: string;
    }>) {
      state.formData = action.payload;
    },
    clearFormData(state) {
      state.formData = null;
    },
    setDisplayCurrency(state, action: PayloadAction<string>) {
      state.currentDisplayCurrency = action.payload;
    },
    updateExchangeRates(state, action: PayloadAction<ExchangeRates>) {
      state.exchangeRates = action.payload;
    },
  },
});

export const { 
  setSearchParams, 
  setSearchResults, 
  setFormData, 
  clearFormData,
  setDisplayCurrency,
  updateExchangeRates
} = searchSlice.actions;

export default searchSlice.reducer;
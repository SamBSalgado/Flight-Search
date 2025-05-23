import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FlightOffer } from '../../types/FlightOffer';

interface SearchParams {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  currency: string;
  nonStop: boolean;
}

interface FormData extends SearchParams {
  departureQuery: string;
  arrivalQuery: string;
}

interface SearchState {
  searchParams: SearchParams | null;
  results: FlightOffer[];
  formData: FormData | null;
  exchangeRates: { [key: string]: number };
  currentDisplayCurrency: string;
  originalCurrency: string;
}

const initialState: SearchState = {
  searchParams: null,
  results: [],
  formData: null,
  exchangeRates: {
    USD: 1,
    EUR: 0.85,
    MXN: 18.5
  },
  currentDisplayCurrency: 'USD',
  originalCurrency: 'USD'
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchParams: (state, action: PayloadAction<SearchParams>) => {
      state.searchParams = action.payload;
      state.originalCurrency = action.payload.currency;
      state.currentDisplayCurrency = action.payload.currency;
    },
    setSearchResults: (state, action: PayloadAction<FlightOffer[]>) => {
      state.results = action.payload;
    },
    setFormData: (state, action: PayloadAction<FormData>) => {
      state.formData = action.payload;
    },
    setDisplayCurrency: (state, action: PayloadAction<string>) => {
      state.currentDisplayCurrency = action.payload;
    },
    updateExchangeRates: (state, action: PayloadAction<{ [key: string]: number }>) => {
      state.exchangeRates = { ...state.exchangeRates, ...action.payload };
    }
  },
});

// Función helper para convertir precios
export const convertPrice = (
  originalPrice: string, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRates: { [key: string]: number }
): string => {
  if (fromCurrency === toCurrency) {
    return parseFloat(originalPrice).toFixed(2);
  }

  const numericPrice = parseFloat(originalPrice);
  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  // Convertir a USD primero, luego a la moneda objetivo
  const usdPrice = numericPrice / fromRate;
  const convertedPrice = usdPrice * toRate;
  
  return convertedPrice.toFixed(2);
};

export const { 
  setSearchParams, 
  setSearchResults, 
  setFormData, 
  setDisplayCurrency, 
  updateExchangeRates 
} = searchSlice.actions;

export default searchSlice.reducer;
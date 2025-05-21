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

interface SearchState {
  params: SearchParams | null;
  results: FlightOffer[];
}

const initialState: SearchState = {
  params: null,
  results: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchParams(state, action: PayloadAction<SearchParams>) {
      state.params = action.payload;
    },
    setSearchResults(state, action: PayloadAction<FlightOffer[]>) {
      state.results = action.payload;
    },
  },
});

export const { setSearchParams, setSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setSearchParams, setSearchResults } from "./searchSlice";
import { useNavigate } from "react-router-dom";
import '../../styles/searchForm.css';

interface Airport {
  iataCode: string;
  name: string;
  displayText: string;
}

export const SearchForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    departureAirport: 'SFO',
    arrivalAirport: 'LAX',
    departureDate: '2025-05-21',
    returnDate: '2025-06-01',
    adults: 1,
    currency: 'USD',
    nonStop: false,
  });

  const [departureQuery, setDepartureQuery] = useState('SFO');
  const [arrivalQuery, setArrivalQuery] = useState('LAX');
  const [departureSuggestions, setDepartureSuggestions] = useState<Airport[]>([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState<Airport[]>([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false);
  const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);
  const [isLoadingDeparture, setIsLoadingDeparture] = useState(false);
  const [isLoadingArrival, setIsLoadingArrival] = useState(false);

  const departureTimeoutRef = useRef<number | null>(null);
  const arrivalTimeoutRef = useRef<number | null>(null);
  const departureInputRef = useRef<HTMLInputElement>(null);
  const arrivalInputRef = useRef<HTMLInputElement>(null);

  const searchAirports = async (keyword: string, type: 'departure' | 'arrival') => {
    if (keyword.length < 2) {
      if (type === 'departure') {
        setDepartureSuggestions([]);
        setShowDepartureSuggestions(false);
      } else {
        setArrivalSuggestions([]);
        setShowArrivalSuggestions(false);
      }
      return;
    }

    try {
      if (type === 'departure') {
        setIsLoadingDeparture(true);
      } else {
        setIsLoadingArrival(true);
      }

      const response = await fetch(`http://localhost:8080/buscar-aero?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      // Transformar el array de strings en objetos Airport
      const airports: Airport[] = data.map((airportString: string) => {
        // Formato esperado: "IATA (Airport Name)"
        const match = airportString.match(/^([A-Z]{3})\s*\((.+)\)$/);
        if (match) {
          return {
            iataCode: match[1],
            name: match[2],
            displayText: airportString
          };
        }
        // Fallback si el formato no coincide
        return {
          iataCode: airportString,
          name: airportString,
          displayText: airportString
        };
      });

      if (type === 'departure') {
        setDepartureSuggestions(airports);
        setShowDepartureSuggestions(true);
        setIsLoadingDeparture(false);
      } else {
        setArrivalSuggestions(airports);
        setShowArrivalSuggestions(true);
        setIsLoadingArrival(false);
      }
    } catch (error) {
      console.error('Error searching airports:', error);
      if (type === 'departure') {
        setIsLoadingDeparture(false);
      } else {
        setIsLoadingArrival(false);
      }
    }
  };

  const handleAirportSearch = (value: string, type: 'departure' | 'arrival') => {
    if (type === 'departure') {
      setDepartureQuery(value);
      if (departureTimeoutRef.current) {
        clearTimeout(departureTimeoutRef.current);
      }
      departureTimeoutRef.current = setTimeout(() => {
        searchAirports(value, 'departure');
      }, 300);
    } else {
      setArrivalQuery(value);
      if (arrivalTimeoutRef.current) {
        clearTimeout(arrivalTimeoutRef.current);
      }
      arrivalTimeoutRef.current = setTimeout(() => {
        searchAirports(value, 'arrival');
      }, 300);
    }
  };

  const selectAirport = (airport: Airport, type: 'departure' | 'arrival') => {
    if (type === 'departure') {
      setDepartureQuery(airport.iataCode);
      setForm({ ...form, departureAirport: airport.iataCode });
      setShowDepartureSuggestions(false);
    } else {
      setArrivalQuery(airport.iataCode);
      setForm({ ...form, arrivalAirport: airport.iataCode });
      setShowArrivalSuggestions(false);
    }
  };

  useEffect(() => {
    return () => {
      if (departureTimeoutRef.current) {
        clearTimeout(departureTimeoutRef.current);
      }
      if (arrivalTimeoutRef.current) {
        clearTimeout(arrivalTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (departureInputRef.current && !departureInputRef.current.contains(event.target as Node)) {
        setShowDepartureSuggestions(false);
      }
      if (arrivalInputRef.current && !arrivalInputRef.current.contains(event.target as Node)) {
        setShowArrivalSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setForm({
      ...form,
      [name]: value,
    });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Actualizar los códigos de aeropuerto en el form antes de enviar
  const updatedForm = {
    ...form,
    departureAirport: departureQuery,
    arrivalAirport: arrivalQuery,
  };
  
  dispatch(setSearchParams(updatedForm));

  try {
    const response = await fetch('http://localhost:8080/buscar-vuelos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedForm),
    });
    
    const data = await response.json();
    
    // DEBUGGING: Logs para ver qué devuelve el backend
    console.log('Response from backend:', data);
    console.log('Type of data:', typeof data);
    console.log('Is data an array?', Array.isArray(data));
    console.log('Data keys (if object):', typeof data === 'object' ? Object.keys(data) : 'Not an object');

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Extraer el array de vuelos correctamente según la estructura de tu API
    let flightResults = [];
    
    if (Array.isArray(data)) {
      // Si data es directamente un array
      flightResults = data;
    } else if (data && data.data && Array.isArray(data.data)) {
      // Si está en data.data
      flightResults = data.data;
    } else if (data && data.flights && Array.isArray(data.flights)) {
      // Si está en data.flights
      flightResults = data.flights;
    } else if (data && data.offers && Array.isArray(data.offers)) {
      // Si está en data.offers
      flightResults = data.offers;
    } else {
      // Si no encontramos un array, usar array vacío
      console.warn('No flight array found in response, using empty array');
      flightResults = [];
    }

    console.log('Final flight results to dispatch:', flightResults);
    console.log('Number of flights:', flightResults.length);

    dispatch(setSearchResults(flightResults));
    navigate('/results');
    
  } catch (error) {
    console.error('Error searching flights:', error);
    // Opcional: dispatch un array vacío en caso de error
    dispatch(setSearchResults([]));
    // Opcional: mostrar un mensaje de error al usuario
    alert('Error searching flights. Please try again.');
  }
};

  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit} className="flight-search-form">
        <div className="form-group">
          <label htmlFor="departureAirport">Departure Airport</label>
          <div className="airport-input-wrapper" ref={departureInputRef}>
            <input 
              id="departureAirport"
              name="departureAirport" 
              value={departureQuery} 
              onChange={(e) => handleAirportSearch(e.target.value, 'departure')}
              placeholder="Search departure airport..."
              required 
              autoComplete="off"
            />
            {isLoadingDeparture && <div className="loading-indicator">Loading...</div>}
            {showDepartureSuggestions && departureSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {departureSuggestions.map((airport) => (
                  <li 
                    key={airport.iataCode}
                    onClick={() => selectAirport(airport, 'departure')}
                    className="suggestion-item"
                  >
                    {airport.displayText}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="arrivalAirport">Arrival Airport</label>
          <div className="airport-input-wrapper" ref={arrivalInputRef}>
            <input 
              id="arrivalAirport"
              name="arrivalAirport" 
              value={arrivalQuery} 
              onChange={(e) => handleAirportSearch(e.target.value, 'arrival')}
              placeholder="Search arrival airport..."
              required 
              autoComplete="off"
            />
            {isLoadingArrival && <div className="loading-indicator">Loading...</div>}
            {showArrivalSuggestions && arrivalSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {arrivalSuggestions.map((airport) => (
                  <li 
                    key={airport.iataCode}
                    onClick={() => selectAirport(airport, 'arrival')}
                    className="suggestion-item"
                  >
                    {airport.displayText}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="departureDate">Departure Date</label>
          <input 
            type="date" 
            id="departureDate"
            name="departureDate" 
            value={form.departureDate} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="returnDate">Return Date</label>
          <input 
            type="date" 
            id="returnDate"
            name="returnDate" 
            value={form.returnDate} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <div className="select-wrapper">
            <select 
              id="currency"
              name="currency" 
              value={form.currency} 
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              {/* Agrega más si necesitas */}
            </select>
            <span className="dropdown-icon">▼</span>
          </div>
        </div>

        <div className="form-group checkbox-group">
          <input 
            type="checkbox" 
            id="nonStop"
            name="nonStop" 
            checked={form.nonStop} 
            onChange={handleChange} 
          />
          <label htmlFor="nonStop">Non-stop</label>
        </div>

        <div className="form-group button-group">
          <button type="submit" className="search-button">Search</button>
        </div>
      </form>
    </div>
  );
};
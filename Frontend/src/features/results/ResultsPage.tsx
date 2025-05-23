import { useSelector, useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import type { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";
import { setDisplayCurrency, convertPrice } from "../search/searchSlice";
import '../../styles/ResultsPage.css';
import type { FlightOffer } from "../../types/FlightOffer";

type SortOption = 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc' | 'default';

export const ResultsPage = () => {
  const dispatch = useDispatch();
  const results = useSelector((state: RootState) => state.search.results);
  const exchangeRates = useSelector((state: RootState) => state.search.exchangeRates);
  const currentDisplayCurrency = useSelector((state: RootState) => state.search.currentDisplayCurrency);
  const originalCurrency = useSelector((state: RootState) => state.search.originalCurrency);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Función para formatear la hora
  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Función para calcular duración del vuelo en minutos (para ordenamiento)
  const calculateDurationMinutes = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    return Math.floor(diffMs / (1000 * 60)); // Duración en minutos
  };

  // Función para calcular duración del vuelo (para mostrar)
  const calculateDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Función para obtener el nombre de la aerolínea
  const getAirlineName = (code: string) => {
    const airlines: { [key: string]: string } = {
      'DL': 'Delta',
      'AM': 'Aeromexico',
      'AA': 'American Airlines',
      'UA': 'United Airlines',
      // Añade más según necesites
    };
    return airlines[code] || code;
  };

  // Función para convertir precio y mostrarlo
  const getConvertedPrice = (originalPrice: string) => {
    return convertPrice(originalPrice, originalCurrency, currentDisplayCurrency, exchangeRates);
  };

  // Función para manejar cambio de divisa
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setDisplayCurrency(e.target.value));
  };

  // Función para ordenar los resultados (actualizada para usar precios convertidos)
  const sortedResults = useMemo(() => {
    if (!results || results.length === 0) return [];
    
    const resultsCopy = [...results];
    
    switch (sortBy) {
      case 'price-asc':
        return resultsCopy.sort((a, b) => {
          const priceA = parseFloat(getConvertedPrice(a.price?.total || '0'));
          const priceB = parseFloat(getConvertedPrice(b.price?.total || '0'));
          return priceA - priceB;
        });
      
      case 'price-desc':
        return resultsCopy.sort((a, b) => {
          const priceA = parseFloat(getConvertedPrice(a.price?.total || '0'));
          const priceB = parseFloat(getConvertedPrice(b.price?.total || '0'));
          return priceB - priceA;
        });
      
      case 'duration-asc':
        return resultsCopy.sort((a, b) => {
          const itineraryA = a.itineraries[0];
          const itineraryB = b.itineraries[0];
          const firstSegmentA = itineraryA.segments[0];
          const lastSegmentA = itineraryA.segments[itineraryA.segments.length - 1];
          const firstSegmentB = itineraryB.segments[0];
          const lastSegmentB = itineraryB.segments[itineraryB.segments.length - 1];
          
          const durationA = calculateDurationMinutes(firstSegmentA.departure.at, lastSegmentA.arrival.at);
          const durationB = calculateDurationMinutes(firstSegmentB.departure.at, lastSegmentB.arrival.at);
          
          return durationA - durationB;
        });
      
      case 'duration-desc':
        return resultsCopy.sort((a, b) => {
          const itineraryA = a.itineraries[0];
          const itineraryB = b.itineraries[0];
          const firstSegmentA = itineraryA.segments[0];
          const lastSegmentA = itineraryA.segments[itineraryA.segments.length - 1];
          const firstSegmentB = itineraryB.segments[0];
          const lastSegmentB = itineraryB.segments[itineraryB.segments.length - 1];
          
          const durationA = calculateDurationMinutes(firstSegmentA.departure.at, lastSegmentA.arrival.at);
          const durationB = calculateDurationMinutes(firstSegmentB.departure.at, lastSegmentB.arrival.at);
          
          return durationB - durationA;
        });
      
      default:
        return resultsCopy;
    }
  }, [results, sortBy, currentDisplayCurrency, originalCurrency, exchangeRates]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
  };

  if (!results || results.length === 0) {
    return (
      <div className="no-results">
        <p>No results. Please search again.</p>
        <button onClick={() => navigate('/')}>Return to Search</button>
      </div>
    );
  }

  return (
    <div className="results-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Return to Search
      </button>

      {/* Controles de ordenamiento y divisa */}
      <div className="controls-section">
        <div className="sort-controls">
          <label htmlFor="sortSelect" className="sort-label">Sort by:</label>
          <select 
            id="sortSelect"
            value={sortBy} 
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="duration-asc">Duration: Shortest First</option>
            <option value="duration-desc">Duration: Longest First</option>
          </select>
        </div>

        <div className="currency-controls">
          <label htmlFor="currencySelect" className="currency-label">Display prices in:</label>
          <select 
            id="currencySelect"
            value={currentDisplayCurrency} 
            onChange={handleCurrencyChange}
            className="currency-select"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="MXN">MXN ($)</option>
          </select>
          {originalCurrency !== currentDisplayCurrency && (
            <span className="conversion-note">
              *Converted from {originalCurrency}
            </span>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="results-count">
        {sortedResults.length} flight{sortedResults.length !== 1 ? 's' : ''} found
        {sortBy !== 'default' && (
          <span className="sort-indicator">
            {' '}- Sorted by {
              sortBy === 'price-asc' ? 'Price (Low to High)' :
              sortBy === 'price-desc' ? 'Price (High to Low)' :
              sortBy === 'duration-asc' ? 'Duration (Shortest First)' :
              sortBy === 'duration-desc' ? 'Duration (Longest First)' : ''
            }
          </span>
        )}
      </div>

      <div className="flight-results">
        {sortedResults.map((flight: FlightOffer, index: number) => {
          const itinerary = flight.itineraries[0];
          const firstSegment = itinerary.segments[0];
          const lastSegment = itinerary.segments[itinerary.segments.length - 1];
          const originalPrice = flight.price?.total || '0';
          const convertedPrice = getConvertedPrice(originalPrice);
          const airlineCode = firstSegment.carrierCode;
          
          // Calcular si es directo o con escalas
          const isNonstop = itinerary.segments.length === 1;
          const duration = calculateDuration(firstSegment.departure.at, lastSegment.arrival.at);
          
          // Información de escalas
          let stopInfo = '';
          if (!isNonstop) {
            const stopCount = itinerary.segments.length - 1;
            stopInfo = `${stopCount} stop`;
            if (stopCount > 1) stopInfo += 's';
          }

          return (
            <div 
              key={`${index}-${flight.id || index}`} 
              className="flight-card"
              onClick={() => navigate(`/flight-details/${index}`, { 
                state: { flight, flightIndex: index } 
              })}
            >
              <div className="flight-main-info">
                <div className="time-route">
                  <div className="time-info">
                    {formatTime(firstSegment.departure.at)} - {formatTime(lastSegment.arrival.at)}
                  </div>
                  <div className="route-info">
                    {firstSegment.departure.iataCode} - {lastSegment.arrival.iataCode}
                  </div>
                </div>
                
                <div className="duration-info">
                  <div className="duration">{duration} {isNonstop ? '(Nonstop)' : `(${stopInfo})`}</div>
                  {!isNonstop && itinerary.segments.length === 2 && (
                    <div className="stop-details">
                      Stop in {itinerary.segments[0].arrival.iataCode}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="airline-price">
                <div className="price-section">
                  <div className="total-price">{currentDisplayCurrency} {convertedPrice}</div>
                  <div className="price-label">total</div>
                  <div className="per-traveler">{currentDisplayCurrency} {(parseFloat(convertedPrice) / 1).toFixed(2)}</div>
                  <div className="traveler-label">per Traveler</div>
                </div>
              </div>
              
              <div className="airline-info">
                <div className="airline-name">{getAirlineName(airlineCode)} ({airlineCode})</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
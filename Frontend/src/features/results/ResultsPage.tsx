import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";
import '../../styles/ResultsPage.css';
import type { FlightOffer } from "../../types/FlightOffer";

export const ResultsPage = () => {
  const results = useSelector((state: RootState) => state.search.results);
  const navigate = useNavigate();

  // Función para formatear la hora
  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Función para calcular duración del vuelo
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

      <div className="flight-results">
        {results.map((flight: FlightOffer, index: number) => {
          const itinerary = flight.itineraries[0];
          const firstSegment = itinerary.segments[0];
          const lastSegment = itinerary.segments[itinerary.segments.length - 1];
          const price = flight.price?.total;
          const currency = flight.price?.currency || 'USD';
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
            <div key={index} className="flight-card">
              <div className="flight-main-info">
                <div className="time-route">
                  <div className="time-info">
                    {formatTime(firstSegment.departure.at)} - {formatTime(lastSegment.arrival.at)}
                  </div>
                  <div className="route-info">
                    San Francisco (SFO) - New York (JFK)
                  </div>
                </div>
                
                <div className="duration-info">
                  <div className="duration">{duration} {isNonstop ? '(Nonstop)' : `(${stopInfo})`}</div>
                  {!isNonstop && (
                    <div className="stop-details">
                      1h 3m in Los Angeles (LAX)
                    </div>
                  )}
                </div>
              </div>
              
              <div className="airline-price">
                <div className="price-section">
                  <div className="total-price">$ {price} {currency}</div>
                  <div className="price-label">total</div>
                  <div className="per-traveler">$ {Math.round(parseFloat(price) / 1)} {currency}</div>
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
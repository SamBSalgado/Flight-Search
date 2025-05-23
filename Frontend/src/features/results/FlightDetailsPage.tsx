import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import type { FlightOffer } from "../../types/FlightOffer";
import '../../styles/FlightDetailsPage.css';

export const FlightDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flightIndex } = useParams();
  const results = useSelector((state: RootState) => state.search.results);
  
  // Obtener el vuelo desde el state o desde Redux
  const flight: FlightOffer = location.state?.flight || results?.[parseInt(flightIndex || '0')];
  
  if (!flight) {
    return (
      <div className="error-container">
        <h2>Flight not found</h2>
        <button onClick={() => navigate('/results')}>Back to Results</button>
      </div>
    );
  }

  // Funciones helper
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      })
    };
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getAirlineName = (code: string) => {
    const airlines: { [key: string]: string } = {
      'DL': 'Delta Air Lines',
      'AM': 'Aeromexico',
      'AA': 'American Airlines',
      'UA': 'United Airlines',
      'B6': 'JetBlue Airways',
      'WN': 'Southwest Airlines',
      'NK': 'Spirit Airlines',
      'F9': 'Frontier Airlines',
      'VB': 'VivaAerobus',
      'Y4': 'Volaris',
      'XE': 'ExpressJet'
    };
    return airlines[code] || `${code} Airlines`;
  };

  const getAircraftName = (code: string) => {
    const aircraft: { [key: string]: string } = {
      '320': 'Airbus A320',
      '321': 'Airbus A321',
      '319': 'Airbus A319',
      '737': 'Boeing 737',
      '738': 'Boeing 737-800',
      '739': 'Boeing 737-900',
      '777': 'Boeing 777',
      '787': 'Boeing 787 Dreamliner',
      '380': 'Airbus A380',
      'E90': 'Embraer E190'
    };
    return aircraft[code] || `Aircraft ${code}`;
  };

  const parseDuration = (duration: string) => {
    // Parse ISO 8601 duration format (PT4H30M)
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
    const match = duration.match(regex);
    if (!match) return duration;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    }
    return duration;
  };

  const getFareDetailsBySegmentId = (segmentId: string) => {
    return flight.travelerPricings?.[0]?.fareDetailsBySegment?.find(
      fareDetail => fareDetail.segmentId === segmentId
    );
  };

  const calculateTotalFees = () => {
    return flight.price.fees.reduce((total, fee) => total + parseFloat(fee.amount), 0);
  };

  const price = flight.price;
  const isRoundTrip = flight.itineraries.length > 1;
  const totalFees = calculateTotalFees();

  return (
    <div className="flight-details-container">
      {/* Header */}
      <div className="details-header">
        <button className="back-button" onClick={() => navigate('/results')}>
          ← Back to Results
        </button>
        <h1>Flight Details</h1>
      </div>

      <div className="content-wrapper">
        {/* Main Content */}
        <div className="main-content">
          {/* Flight Itinerary */}
          <div className="itinerary-container">
            {flight.itineraries.map((itinerary, itineraryIndex) => (
              <div key={itineraryIndex} className="itinerary-section">
                <h2 className="itinerary-title">
                  {isRoundTrip ? (itineraryIndex === 0 ? 'Outbound Flight' : 'Return Flight') : 'Flight Details'}
                </h2>
                
                <div className="segments-container">
                  {itinerary.segments.map((segment, segmentIndex) => {
                    const departure = formatDateTime(segment.departure.at);
                    const arrival = formatDateTime(segment.arrival.at);
                    const duration = parseDuration(segment.duration);
                    const fareDetails = getFareDetailsBySegmentId(segment.id);
                    const isOperatedByDifferentCarrier = segment.operating && segment.carrierCode !== segment.operating.carrierCode;
                    
                    return (
                      <div key={segmentIndex} className="segment-card">
                        <div className="segment-header">
                          <div className="airline-info">
                            <div className="airline-name">
                              {getAirlineName(segment.carrierCode)}
                            </div>
                            <div className="flight-number">
                              {segment.carrierCode} {segment.number}
                            </div>
                            {isOperatedByDifferentCarrier && (
                              <div className="operating-carrier">
                                Operated by {getAirlineName(segment.operating?.carrierCode || segment.carrierCode)}
                              </div>
                            )}
                            <div className="aircraft-type">
                              {segment.aircraft ? getAircraftName(segment.aircraft.code) : 'Aircraft not specified'}
                            </div>
                          </div>
                          <div className="duration-badge">
                            {duration}
                          </div>
                        </div>
                        
                        <div className="flight-timeline">
                          <div className="timeline-point departure">
                            <div className="airport-code">{segment.departure.iataCode}</div>
                            {segment.departure.terminal && (
                              <div className="terminal">Terminal {segment.departure.terminal}</div>
                            )}
                            <div className="city-name">Departure</div>
                            <div className="time">{departure.time}</div>
                            <div className="date">{departure.date}</div>
                          </div>
                          
                          <div className="timeline-line">
                            <div className="flight-path"></div>
                            <div className="plane-icon">✈️</div>
                          </div>
                          
                          <div className="timeline-point arrival">
                            <div className="airport-code">{segment.arrival.iataCode}</div>
                            {segment.arrival.terminal && (
                              <div className="terminal">Terminal {segment.arrival.terminal}</div>
                            )}
                            <div className="city-name">Arrival</div>
                            <div className="time">{arrival.time}</div>
                            <div className="date">{arrival.date}</div>
                          </div>
                        </div>

                        {/* Traveler Fare Details */}
                        {fareDetails && (
                          <div className="fare-details">
                            <h4>Fare Details</h4>
                            <div className="fare-info-grid">
                              <div className="fare-item">
                                <strong>Cabin Class:</strong>
                                <span>{fareDetails.cabin}</span>
                              </div>
                              <div className="fare-item">
                                <strong>Booking Class:</strong>
                                <span>{fareDetails.class}</span>
                              </div>
                              <div className="fare-item">
                                <strong>Fare Basis:</strong>
                                <span>{fareDetails.fareBasis}</span>
                              </div>
                              {fareDetails.brandedFareLabel && (
                                <div className="fare-item">
                                  <strong>Fare Type:</strong>
                                  <span>{fareDetails.brandedFareLabel}</span>
                                </div>
                              )}
                              <div className="fare-item">
                                <strong>Checked Bags:</strong>
                                <span>{fareDetails.includedCheckedBags?.quantity || 0} included</span>
                              </div>
                              <div className="fare-item">
                                <strong>Cabin Bags:</strong>
                                <span>{fareDetails.includedCabinBags?.quantity || 0} included</span>
                              </div>
                            </div>

                            {/* Amenities */}
                            {fareDetails.amenities && fareDetails.amenities.length > 0 && (
                              <div className="amenities-section">
                                <h5>Amenities</h5>
                                <div className="amenities-list">
                                  {fareDetails.amenities.map((amenity, amenityIndex) => (
                                    <div key={amenityIndex} className="amenity-item">
                                      <div className="amenity-description">
                                        {amenity.description}
                                      </div>
                                      <div className="amenity-details">
                                        <span className={`amenity-charge ${amenity.isChargeable ? 'chargeable' : 'included'}`}>
                                          {amenity.isChargeable ? 'Chargeable' : 'Included'}
                                        </span>
                                        <span className="amenity-type">
                                          {amenity.amenityType}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Layover information */}
                  {itinerary.segments.length > 1 && (
                    <div className="layover-info">
                      <h4>Layovers</h4>
                      {itinerary.segments.slice(0, -1).map((segment, index) => {
                        const nextSegment = itinerary.segments[index + 1];
                        const layoverDuration = calculateDuration(
                          segment.arrival.at, 
                          nextSegment.departure.at
                        );
                        return (
                          <div key={index} className="layover-item">
                            <span className="layover-airport">{segment.arrival.iataCode}</span>
                            <span className="layover-duration">{layoverDuration}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Flight Information */}
          <div className="additional-details">
            <h3>Flight Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <strong>Flight ID:</strong>
                <span>{flight.id}</span>
              </div>
              <div className="detail-item">
                <strong>Source:</strong>
                <span>{flight.source}</span>
              </div>
              <div className="detail-item">
                <strong>Number of Travelers:</strong>
                <span>{flight.travelerPricings?.length || 1}</span>
              </div>
              <div className="detail-item">
                <strong>Bookable Seats:</strong>
                <span>{flight.numberOfBookableSeats}</span>
              </div>
              {flight.lastTicketingDate && (
                <div className="detail-item">
                  <strong>Last Ticketing Date:</strong>
                  <span>{new Date(flight.lastTicketingDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="detail-item">
                <strong>Instant Ticketing:</strong>
                <span>{flight.instantTicketingRequired ? 'Required' : 'Not Required'}</span>
              </div>
              <div className="detail-item">
                <strong>Validating Airlines:</strong>
                <span>{flight.validatingAirlineCodes.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown Sidebar */}
        <div className="price-sidebar">
          <div className="price-summary">
            <h3>Price Breakdown</h3>
            
            <div className="price-details">
              <div className="price-row">
                <span>Base Price:</span>
                <span>${price.base} {price.currency}</span>
              </div>
              
              {price.fees.map((fee, index) => (
                fee.amount !== "0.00" && (
                  <div key={index} className="price-row">
                    <span>{fee.type} Fee:</span>
                    <span>${fee.amount} {price.currency}</span>
                  </div>
                )
              ))}
              
              {totalFees > 0 && (
                <div className="price-row">
                  <span>Total Fees:</span>
                  <span>${totalFees.toFixed(2)} {price.currency}</span>
                </div>
              )}
              
              <hr />
              
              <div className="price-row total">
                <span><strong>Total Price:</strong></span>
                <span><strong>${price.total} {price.currency}</strong></span>
              </div>
              
              <div className="price-row">
                <span>Price per Traveler:</span>
                <span>${(parseFloat(price.total) / flight.travelerPricings.length).toFixed(2)} {price.currency}</span>
              </div>
            </div>

            <button className="book-button">
              Select Flight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
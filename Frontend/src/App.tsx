import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { SearchForm } from './features/search/searchForm';
import { ResultsPage } from './features/results/ResultsPage';
import { FlightDetailsPage } from './features/results/FlightDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<SearchForm />} />
        <Route path='/results' element={<ResultsPage />} />
        <Route path='/flight-details/:flightIndex' element={<FlightDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
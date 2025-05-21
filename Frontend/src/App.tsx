import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { SearchForm } from './features/search/searchForm';
import { ResultsPage } from './features/results/ResultsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<SearchForm />} />
        <Route path='/results' element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
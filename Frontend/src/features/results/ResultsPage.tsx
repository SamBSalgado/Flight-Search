import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";

export const ResultsPage = () => {
  const results = useSelector((state: RootState) => state.search.results);
  const navigate = useNavigate();

  if (!results) {
    return <p>No results. Please search again.</p>;
  }

  return(
    <div>
      <button onClick={() => navigate('/')}>Return to Search</button>
      <h1>Flight Results</h1>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
};
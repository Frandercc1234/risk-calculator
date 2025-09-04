import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { QualitativeRisk } from './pages/QualitativeRisk';
import { QuantitativeRisk } from './pages/QuantitativeRisk';
import { RisksList } from './pages/RisksList';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/qualitative" element={<QualitativeRisk />} />
        <Route path="/quantitative" element={<QuantitativeRisk />} />
        <Route path="/risks" element={<RisksList />} />
      </Routes>
    </Layout>
  );
}

export default App;


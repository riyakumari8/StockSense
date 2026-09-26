import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Warehouses } from './components/Warehouses';
import { Locations } from './components/Locations';
import { Transfers } from './components/Transfers';
import { Adjustments } from './components/Adjustments';
import { StockLedger } from './components/StockLedger';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/warehouses" replace />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="locations" element={<Locations />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="adjustments" element={<Adjustments />} />
          <Route path="stock-ledger" element={<StockLedger />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

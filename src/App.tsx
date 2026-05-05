import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import FeedPage from './pages/FeedPage';
import CamperProfilePage from './pages/CamperProfilePage';
import ExpenseReportingPage from './pages/ExpenseReportingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<Layout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpenseReportingPage />} />
          <Route path="/camper/:id" element={<CamperProfilePage />} />
          <Route path="/settings" element={<div className="p-6">הגדרות (בקרוב...)</div>} />
          <Route path="/incidents" element={<div className="p-6">דיווח אירוע (בקרוב...)</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

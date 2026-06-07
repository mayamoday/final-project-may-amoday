import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import FeedPage from './pages/FeedPage';
import CamperProfilePage from './pages/CamperProfilePage';
import CampersListPage from './pages/CampersListPage';
import ExpenseReportingPage from './pages/ExpenseReportingPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import IncidentReportPage from './pages/IncidentReportPage';
import TasksManagementPage from './pages/TasksManagementPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/feed"       element={<FeedPage />} />
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/expenses"   element={<ExpenseReportingPage />} />
          <Route path="/campers"    element={<CampersListPage />} />
          <Route path="/camper/:id" element={<CamperProfilePage />} />
          <Route path="/knowledge"  element={<KnowledgeBasePage />} />
          <Route path="/incidents"  element={<IncidentReportPage />} />
          <Route path="/tasks"      element={<TasksManagementPage />} />
          <Route path="/settings"   element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

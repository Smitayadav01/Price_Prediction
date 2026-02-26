import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Auth } from './pages/Auth';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { ProtectedRoute } from './pages/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/farmer"
            element={
              <ProtectedRoute role="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/government"
            element={
              <ProtectedRoute role="government">
                <GovernmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

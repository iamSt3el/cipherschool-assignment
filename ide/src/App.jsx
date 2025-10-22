import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Ide } from "./pages/Ide"
import {LoginRegister} from "./pages/LoginRegister"
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/ide" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="w-screen h-screen">
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LoginRegister />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginRegister />
                </PublicRoute>
              }
            />
            <Route
              path="/ide"
              element={
                <ProtectedRoute>
                  <Ide />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

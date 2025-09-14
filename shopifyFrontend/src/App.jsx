import React,{useState} from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Orders from "./pages/OrdersData";
import Customers from "./pages/Customers";
import Products from "./pages/ProductData";
import Dashboard from "./components/Dashboard";
import AuthForm from "./components/AuthForm";
import DashboardPage from "./components/DashboardPage";
import EmailVerification from "./components/EmailVerification";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
const App = () => {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentTenant, setCurrentTenant] = useState(null);
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/user/orders" element={<Orders />} />
          <Route path="/user/customers" element={<Customers />} />
          <Route path="/user/products" element={<Products />} />
          <Route
        path="/login"
        element={
          <AuthForm
            setIsAuthenticated={setIsAuthenticated}
            setCurrentUser={setCurrentUser}
            setCurrentTenant={setCurrentTenant}
          />}/>
          <Route
            path="/verify-email"
            element={<EmailVerification />}
          />
          <Route
            path="/analytics"
            element={
              isAuthenticated ? (
                <AnalyticsDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
 <Route
        path="/api/user"
        element={
          isAuthenticated ? (
            <DashboardPage
              currentUser={currentUser}
              currentTenant={currentTenant}
              setIsAuthenticated={setIsAuthenticated}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />          
        </Routes>
      </main>
    </div>
  );
};

export default App;

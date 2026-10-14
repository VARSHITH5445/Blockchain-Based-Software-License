import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { SoftwareCatalog } from './pages/SoftwareCatalog';
import { AddEditSoftware } from './pages/AddEditSoftware';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { LicenseDetails } from './pages/LicenseDetails';
import { PublicVerification } from './pages/PublicVerification';
import { AdminDashboard } from './pages/AdminDashboard';
import { ActivityHistory } from './pages/ActivityHistory';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Web3Provider>
          <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
            <div>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/developer" element={<DeveloperDashboard />} />
                  <Route path="/products" element={<SoftwareCatalog />} />
                  <Route path="/products/new" element={<AddEditSoftware />} />
                  <Route path="/customer" element={<CustomerDashboard />} />
                  <Route path="/licenses/:idOrOnChainId" element={<LicenseDetails />} />
                  <Route path="/verify" element={<PublicVerification />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/activity" element={<ActivityHistory />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Features from './components/Features/Features';
import Marketplace from './pages/Marketplace/Marketplace';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard/ManagerDashboard';
import SocietyDetails from './components/SocietyDetails/SocietyDetails';
import './App.css';

function App() {
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/manager" element={isManager ? <ManagerDashboard /> : <Navigate to="/" />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/" element={
            <>
              <Navbar />
              <Hero />
              <Features />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

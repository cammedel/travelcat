// frontend/src/App.jsx (CORREGIDO)

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importa los componentes de pÃ¡gina. AsegÃºrate que estos archivos existan en src/pages/
import Dashboard from './pages/Dashboard';
import NuevaOTPage from './pages/NuevaOTpage'; // Â¡CORRECCIÃ“N! Importa la pÃ¡gina contenedora.
import Camiones from './pages/Camiones';      // <-- PÃ¡gina de Camiones
import Mantencion from './pages/Mantencion'; 
import Proveedores from './pages/Proveedores'; 
import Reportes from './pages/Reportes';
import Gastos from './pages/Gastos';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AccessibilityMenu from './components/AccessibilityMenu';
import NotificationsBell from './components/NotificationsBell';



// Componente simple para la barra de navegaciÃ³n (AÃ‘ADIMOS ENLACE A CAMIONES)
const NavBar = () => {
    const { isAuthenticated, user, logout } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/">Sistema de mantención</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Abrir menu de navegacion">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="mainNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/nueva">Ordenes de Trabajo</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/camiones">Camiones</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/mantencion">Mantención</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/proveedores">Proveedores</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/reportes">Reportes</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/gastos">Gastos</Link>
                        </li>
                    </ul>
                    <div className="d-flex align-items-center gap-3 text-white">
                        <NotificationsBell />
                        <span className="small">{user?.name || user?.email}</span>
                        <button className="btn btn-outline-light btn-sm" onClick={logout}>
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

function App() {
    return (
        <Router>
            <NavBar /> 
            
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={(
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/nueva"
                    element={(
                        <ProtectedRoute>
                            <NuevaOTPage />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/camiones"
                    element={(
                        <ProtectedRoute>
                            <Camiones />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/mantencion"
                    element={(
                        <ProtectedRoute>
                            <Mantencion />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/proveedores"
                    element={(
                        <ProtectedRoute>
                            <Proveedores />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/reportes"
                    element={(
                        <ProtectedRoute>
                            <Reportes />
                        </ProtectedRoute>
                    )}
                />
                <Route
                    path="/gastos"
                    element={(
                        <ProtectedRoute>
                            <Gastos />
                        </ProtectedRoute>
                    )}
                />
            </Routes>
            <AccessibilityMenu />
        </Router>
    );
    
}

export default App;



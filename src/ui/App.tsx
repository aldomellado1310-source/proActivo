import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { EstadoProvider } from './EstadoContext';
import { Layout } from './layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Flota } from './pages/Flota';
import { NaveDetalle } from './pages/NaveDetalle';
import { Certificados } from './pages/Certificados';
import { Insumos } from './pages/Insumos';
import { Reglas } from './pages/Reglas';

export function App() {
  return (
    <EstadoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/flota" element={<Flota />} />
            <Route path="/flota/:naveId" element={<NaveDetalle />} />
            <Route path="/certificados" element={<Certificados />} />
            <Route path="/insumos" element={<Insumos />} />
            <Route path="/reglas" element={<Reglas />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </EstadoProvider>
  );
}

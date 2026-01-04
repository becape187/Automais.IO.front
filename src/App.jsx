import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import Applications from './pages/Applications/Applications'
import Devices from './pages/Devices/Devices'
import Gateways from './pages/Gateways/Gateways'
import Routers from './pages/Routers/Routers'
import Users from './pages/Users/Users'
import Vpn from './pages/Vpn/Vpn'
import Login from './pages/Auth/Login'

function App() {
  // TODO: implementar lógica de autenticação real
  const isAuthenticated = true

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="devices" element={<Devices />} />
          <Route path="gateways" element={<Gateways />} />
          <Route path="routers" element={<Routers />} />
          <Route path="users" element={<Users />} />
          <Route path="vpn" element={<Vpn />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App


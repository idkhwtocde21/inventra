import { Route, Routes } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import Categories from './pages/Categories.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/categories" element={<Categories />} />
        </Route>
      </Route>

      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App
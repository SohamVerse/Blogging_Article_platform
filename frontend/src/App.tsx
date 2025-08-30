import './App.css'
import './index.css'
import { Routes, Route } from 'react-router-dom'
import { Hero } from './components/main/Hero'
import { NavBar } from './components/main/NavBar'
import Login from './auth/login/login'
import Signup from './auth/signup/signup'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import NewBlog from './components/dashboard/NewBlog'
import ProtectedRoute from './components/ProtectedRoute'
import AdminBlogDetails from "./pages/AdminBlogDetails";
function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={
          <>
            <Hero/>
            <h1>Hello World</h1>
          </>
        } />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/admin/blogs/:id" element={<AdminBlogDetails />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/new-blog" element={
          <ProtectedRoute>
            <NewBlog />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App

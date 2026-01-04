import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import { MovieListSkeleton } from './components/Skeleton';
import AdminDebug from './components/AdminDebug'; // Temporary debug component
import './App.css';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Stats = lazy(() => import('./pages/Stats'));
const Movies = lazy(() => import('./pages/Movies'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const EditMovie = lazy(() => import('./pages/EditMovie'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function App() {
  return (
    <AuthProvider>
      <Router>
                <div className="App">
                  <Header />
                  <AdminDebug />
                  <main className="main-content">
            <Suspense fallback={<MovieListSkeleton count={6} />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movies/:id" element={<MovieDetail />} />
                <Route path="/movies/:id/edit" element={<EditMovie />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


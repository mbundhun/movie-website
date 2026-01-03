import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../services/api';
import './Stats.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="empty-state">No statistics available</div>;
  }

  const ratingsData = {
    labels: stats.ratingsDistribution.map(r => `${r.rating}/10`),
    datasets: [{
      label: 'Number of Reviews',
      data: stats.ratingsDistribution.map(r => r.count),
      backgroundColor: 'rgba(52, 152, 219, 0.6)',
      borderColor: 'rgba(52, 152, 219, 1)',
      borderWidth: 1
    }]
  };

  const genreData = {
    labels: stats.genreBreakdown.map(g => g.genre),
    datasets: [{
      data: stats.genreBreakdown.map(g => g.count),
      backgroundColor: [
        'rgba(52, 152, 219, 0.6)',
        'rgba(46, 204, 113, 0.6)',
        'rgba(241, 196, 15, 0.6)',
        'rgba(231, 76, 60, 0.6)',
        'rgba(155, 89, 182, 0.6)',
        'rgba(52, 73, 94, 0.6)',
        'rgba(230, 126, 34, 0.6)',
        'rgba(26, 188, 156, 0.6)',
        'rgba(149, 165, 166, 0.6)',
        'rgba(192, 57, 43, 0.6)'
      ],
      borderWidth: 1
    }]
  };

  const moviesPerYearData = {
    labels: stats.moviesPerYear.map(m => m.year.toString()),
    datasets: [{
      label: 'Movies',
      data: stats.moviesPerYear.map(m => m.count),
      backgroundColor: 'rgba(46, 204, 113, 0.6)',
      borderColor: 'rgba(46, 204, 113, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="stats-page">
      <h1>Statistics</h1>

      <div className="stats-summary">
        <div className="stat-box">
          <h3>{stats.totalMovies}</h3>
          <p>Total Movies</p>
        </div>
        <div className="stat-box">
          <h3>{stats.totalReviews}</h3>
          <p>Total Reviews</p>
        </div>
        <div className="stat-box">
          <h3>{stats.averageRating}</h3>
          <p>Average Rating</p>
        </div>
      </div>

      {stats.userStats && (
        <div className="user-stats-section">
          <h2>Your Statistics</h2>
          <div className="stats-summary">
            <div className="stat-box">
              <h3>{stats.userStats.reviewsCount}</h3>
              <p>Your Reviews</p>
            </div>
            <div className="stat-box">
              <h3>{stats.userStats.averageRating}</h3>
              <p>Your Average Rating</p>
            </div>
            <div className="stat-box">
              <h3>{stats.userStats.watchlistCount}</h3>
              <p>Watchlist Items</p>
            </div>
          </div>
        </div>
      )}

      <div className="charts-section">
        <div className="chart-container">
          <h2>Ratings Distribution</h2>
          <Bar data={ratingsData} options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false }
            }
          }} />
        </div>

        <div className="chart-container">
          <h2>Genre Breakdown</h2>
          <Doughnut data={genreData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'right' }
            }
          }} />
        </div>

        <div className="chart-container">
          <h2>Movies Per Year</h2>
          <Line data={moviesPerYearData} options={{
            responsive: true,
            plugins: {
              legend: { display: false }
            }
          }} />
        </div>
      </div>
    </div>
  );
};

export default Stats;


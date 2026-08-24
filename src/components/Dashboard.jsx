import React, { useState, useEffect } from 'react';
import { JobService } from '../api/client';
import JobCard from './JobCard';
import JobForm from './JobForm';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      const data = await JobService.listJobs();
      // Sort so newest are first
      const sorted = (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setJobs(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Poll the list of jobs every 5 seconds just to catch newly completed ones 
    // without needing websocket integration
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJobCreated = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
  };

  return (
    <div>
      <h1>Data Ingestion Pipeline</h1>
      
      {error && (
        <div className="glass-panel" style={{ borderColor: 'var(--accent-danger)', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--accent-danger)' }}>Connection Error: {error}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Make sure your Go server is running on localhost:8080</p>
        </div>
      )}

      <div className="dashboard-grid">
        <aside>
          <JobForm onJobCreated={handleJobCreated} />
        </aside>

        <main className="jobs-container">
          <h2>Active & Recent Jobs</h2>
          {loading && <p>Loading jobs...</p>}
          
          {!loading && jobs.length === 0 && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No jobs found. Start a new pipeline to see it here.</p>
            </div>
          )}

          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              initialJob={job} 
              onCancelSuccess={fetchJobs}
            />
          ))}
        </main>
      </div>
    </div>
  );
}

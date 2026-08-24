import React, { useState, useEffect } from 'react';
import { JobService } from '../api/client';

export default function JobCard({ initialJob, onCancelSuccess }) {
  const [job, setJob] = useState(initialJob);
  const [metrics, setMetrics] = useState(initialJob.metrics || null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const isActive = job.status === 'RUNNING' || job.status === 'PENDING';

  // Polling effect for active jobs
  useEffect(() => {
    let intervalId;
    
    if (isActive) {
      intervalId = setInterval(async () => {
        try {
          const progress = await JobService.getProgress(job.id);
          setMetrics(progress);
          
          // To get the real status, we'd need to fetch the job again, 
          // or assume if progress says it's 100% we might be done.
          if (progress.percent_complete >= 100 && job.status === 'RUNNING') {
            const updatedJob = await JobService.getJob(job.id);
            setJob(updatedJob);
          }
        } catch (err) {
          console.error("Failed to poll progress:", err);
        }
      }, 1000); // Poll every 1 second
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [job.id, job.status, isActive]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const updatedJob = await JobService.cancelJob(job.id);
      setJob(updatedJob);
      if (onCancelSuccess) onCancelSuccess(updatedJob);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const fetchResults = async () => {
    try {
      const data = await JobService.getResults(job.id);
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const percent = metrics?.percent_complete || 0;

  const getDurationString = () => {
    if (!metrics?.start_time) return '0.0s';
    const start = new Date(metrics.start_time).getTime();
    
    // If we have an end time (not equal to zero value), use it
    // Go's empty time.Time might parse weirdly or not be present
    const end = metrics.end_time && new Date(metrics.end_time).getTime() > 0
      ? new Date(metrics.end_time).getTime() 
      : Date.now();
      
    const diff = (end - start) / 1000;
    return Math.max(0, diff).toFixed(1) + 's';
  };

  return (
    <div className="glass-panel animate-fade-in">
      <div className="job-header">
        <div>
          <h3>Data Processing Job</h3>
          <span className="job-id">{job.id}</span>
        </div>
        <span className={`status-badge status-${job.status}`}>
          {job.status}
        </span>
      </div>

      <div className="progress-bg">
        <div 
          className="progress-fill" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <span className="metric-label">Duration</span>
          <span className="metric-value">{getDurationString()}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Progress</span>
          <span className="metric-value">{percent.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Processed</span>
          <span className="metric-value">{metrics?.records_processed || 0}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Errors</span>
          <span className={`metric-value ${metrics?.error_count > 0 ? 'error' : ''}`}>
            {metrics?.error_count || 0}
          </span>
        </div>
      </div>

      {metrics?.last_error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--accent-danger)', fontSize: '0.875rem' }}>
          <strong>Error: </strong> {metrics.last_error}
        </div>
      )}

      {error && <div style={{ color: 'var(--accent-danger)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</div>}

      <div className="job-actions">
        {isActive && (
          <button 
            onClick={handleCancel} 
            disabled={isCancelling}
            className="btn btn-danger"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Job'}
          </button>
        )}
        
        {job.status === 'COMPLETED' && !results && (
          <button onClick={fetchResults} className="btn btn-primary">
            View Results
          </button>
        )}
      </div>

      {results && (
        <div className="results-panel animate-fade-in">
          {JSON.stringify(results, null, 2)}
        </div>
      )}
    </div>
  );
}

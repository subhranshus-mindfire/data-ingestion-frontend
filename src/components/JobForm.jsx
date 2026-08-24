import React, { useState } from 'react';
import { JobService } from '../api/client';

export default function JobForm({ onJobCreated }) {
  const [sourceUrl, setSourceUrl] = useState('https://data-processing-pipeline-go.onrender.com/samples/stress-input.csv');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const url = sourceUrl.trim();
    if (!url) {
      setError('Please provide a source URL.');
      setIsSubmitting(false);
      return;
    }

    // Infer type from URL extension, default to csv
    const type = url.toLowerCase().endsWith('.json') ? 'json' : 'csv';

    const spec = {
      sources: [
        { type, url }
      ]
    };

    try {
      const newJob = await JobService.triggerJob(spec);
      if (onJobCreated) onJobCreated(newJob);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
      <h2>Start New Pipeline</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Trigger a massive concurrent data processing job instantly.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Data Source URL (.csv or .json)</label>
          <input 
            type="url" 
            className="form-input" 
            placeholder="https://data-processing-pipeline-go.onrender.com/samples/stress-input.csv"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </div>

        {error && <div style={{ color: 'var(--accent-danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Triggering...' : 'Start Job'}
        </button>
      </form>
    </div>
  );
}

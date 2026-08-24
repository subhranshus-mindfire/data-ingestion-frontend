const API_BASE = "https://data-processing-pipeline-go.onrender.com/api/v1";

export const JobService = {
  /**
   * Fetches the list of all jobs
   */
  async listJobs() {
    const res = await fetch(`${API_BASE}/pipelines`);
    if (!res.ok) throw new Error("Failed to fetch jobs");
    return res.json();
  },

  /**
   * Fetches the details of a specific job
   */
  async getJob(id) {
    const res = await fetch(`${API_BASE}/pipelines/${id}`);
    if (!res.ok) throw new Error("Failed to fetch job details");
    return res.json();
  },

  /**
   * Submits a new job to the pipeline
   */
  async triggerJob(spec) {
    const res = await fetch(`${API_BASE}/pipelines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spec),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to trigger job");
    }
    return res.json();
  },

  /**
   * Fetches real-time progress for a specific job
   */
  async getProgress(id) {
    const res = await fetch(`${API_BASE}/pipelines/${id}/progress`);
    if (!res.ok) throw new Error("Failed to fetch progress");
    return res.json();
  },

  /**
   * Cancels an active job
   */
  async cancelJob(id) {
    const res = await fetch(`${API_BASE}/pipelines/${id}/cancel`, {
      method: "PATCH",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to cancel job");
    }
    return res.json();
  },

  /**
   * Fetches the final summary results of a completed job
   */
  async getResults(id) {
    const res = await fetch(`${API_BASE}/pipelines/${id}/results`);
    if (!res.ok) throw new Error("Results not ready or failed to fetch");
    return res.json();
  }
};

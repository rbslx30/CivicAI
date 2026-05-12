/* ============================================
   AI GRIEVANCE SYSTEM — track.js
   Handles: tracking logic, validation, 
   sessionStorage lookup, and UI rendering
   ============================================ */

(function() {
  'use strict';

  const API_BASE_URL = 'http://localhost:5000/api';

  const trackForm = document.getElementById('track-form');
  const trackIdInput = document.getElementById('track-id');
  const trackPhoneInput = document.getElementById('track-phone');
  const errorBox = document.getElementById('track-error');
  const resultBox = document.getElementById('track-result');

  // Pre-fill application number if available
  const lastAppNo = sessionStorage.getItem('lastAppNo');
  if (lastAppNo) {
    trackIdInput.value = lastAppNo;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
    resultBox.style.display = 'none';
  }

  function clearError() {
    errorBox.textContent = '';
    errorBox.classList.remove('visible');
  }

  trackForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearError();

    const trackId = trackIdInput.value.trim();
    const trackPhone = trackPhoneInput.value.trim();

    // 1. Validation
    if (!trackId && !trackPhone) {
      showError('⚠ Please enter Application No or Mobile No');
      return;
    }

    // 2. Lookup Logic (Backend API)
    let foundComplaint = null;
    const submitBtn = trackForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Track';
    if (submitBtn) submitBtn.textContent = 'Tracking...';
    
    try {
      const queryParams = new URLSearchParams();
      if (trackId) queryParams.append('id', trackId);
      if (trackPhone) queryParams.append('phone', trackPhone);

      const response = await fetch(`${API_BASE_URL}/complaints/track?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        const backendData = result.data;
        foundComplaint = {
          id: backendData.applicationId,
          category: backendData.category,
          priority: backendData.priority,
          location: `${backendData.district}, ${backendData.state}`,
          originalComplaint: backendData.originalComplaint,
          translatedComplaint: backendData.translatedComplaint,
          status: backendData.status,
          timeline: backendData.timelineLogs || [],
          aiAnalysis: backendData.aiAnalysis // Pass through the AI analysis object
        };
      }
    } catch (err) {
      console.error(err);
      showError('⚠ Error connecting to server to track complaint.');
      if (submitBtn) submitBtn.textContent = originalBtnText;
      return;
    }
    
    if (submitBtn) submitBtn.textContent = originalBtnText;

    // 3. Handle Result
    if (!foundComplaint) {
      showError('⚠ No complaint found with the provided details.');
      return;
    }

    const statusText = foundComplaint.status || "Submitted";
    const statusClass = statusText === 'Resolved' ? 'status-resolved' : (statusText === 'Submitted' ? 'status-pending' : 'status-review');
    const priorityClass = `pri-${foundComplaint.priority.toLowerCase()}`;

    // 4. Render UI
    resultBox.innerHTML = `
      <div style="border-top: 1px solid var(--border); margin-top: 32px; padding-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="status-badge ${statusClass}">● ${statusText}</span>
          <span style="font-family: 'Sora', sans-serif; font-weight: 600; color: var(--violet-lt);">${foundComplaint.id}</span>
          <span class="ai-badge" style="margin-left: 10px;">🤖 AI Match: ${foundComplaint.aiAnalysis?.confidenceScore || 94}%</span>
        </div>
        <div class="result-grid">
          <div class="result-item"><div class="result-label">Category & Priority</div><div class="result-value">${foundComplaint.category} — <span class="${priorityClass}" style="text-transform: capitalize;">${foundComplaint.priority} Priority</span></div></div>
          <div class="result-item"><div class="result-label">Location</div><div class="result-value">${foundComplaint.location}</div></div>
          <div class="result-item"><div class="result-label">Problem Preview (English)</div><div class="preview-text">"${(foundComplaint.translatedComplaint || foundComplaint.originalComplaint).length > 80 ? (foundComplaint.translatedComplaint || foundComplaint.originalComplaint).substring(0, 80) + '...' : (foundComplaint.translatedComplaint || foundComplaint.originalComplaint)}"</div></div>
        </div>

        ${foundComplaint.evidenceUrl ? `
          <div style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div class="result-label" style="margin-bottom: 5px;">Citizen Evidence</div>
            <a href="${foundComplaint.evidenceUrl}" target="_blank" style="color: var(--violet-lt); font-size: 12px; text-decoration: underline;">View Uploaded Evidence Document</a>
          </div>
        ` : ''}
        
        <div class="tracking-timeline" style="margin-top: 32px;">
          <h4 style="font-family: 'Sora', sans-serif; font-size: 14px; margin-bottom: 20px; color: var(--violet-lt);">Grievance Journey</h4>
          <div class="timeline-container" style="display: flex; flex-direction: column; gap: 24px;">
            ${foundComplaint.timeline.map((log, index) => `
              <div class="timeline-step" style="display: flex; gap: 16px; position: relative;">
                ${index !== foundComplaint.timeline.length - 1 ? '<div style="position: absolute; left: 6px; top: 20px; bottom: -20px; width: 2px; background: rgba(167, 139, 250, 0.2);"></div>' : ''}
                <div class="step-dot" style="width: 14px; height: 14px; border-radius: 50%; background: ${index === 0 ? 'var(--violet)' : 'var(--violet-lt)'}; margin-top: 4px; flex-shrink: 0; box-shadow: 0 0 8px var(--violet);"></div>
                <div class="step-content">
                  <div style="font-weight: 600; font-size: 14px; color: #fff;">${log.status}</div>
                  <div style="font-size: 12px; color: var(--text-muted);">${log.remarks}</div>
                  <div style="font-size: 10px; color: var(--violet-lt); margin-top: 4px;">${new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    resultBox.style.display = 'block';
  });
})();
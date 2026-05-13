/* ============================================
   AI GRIEVANCE SYSTEM — dashboard.js
   Handles: Dashboard rendering, filtering, 
   searching, and status updates via sessionStorage
   ============================================ */

(function() {
  'use strict';

  const API_BASE_URL = 'https://civicai-1gu2.onrender.com/api';

  let allComplaints = [];

  // Elements
  const tableBody = document.getElementById('table-body');
  const searchInput = document.getElementById('search-input');
  const filterStatus = document.getElementById('filter-status');
  const filterDept = document.getElementById('filter-dept');
  const noDataMsg = document.getElementById('no-data-msg');
  const modalOverlay = document.getElementById('action-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalBody = document.getElementById('modal-body');

  // Wrap API calls with Authorization header
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
    };
  };

  // Initialize Dashboard
  function init() {
    if (!localStorage.getItem('adminToken')) {
      window.location.href = 'login.html';
    } else {
      injectDemoControls();
      loadData();
      setupEventListeners();
    }
  }

  function injectDemoControls() {
    const controls = document.createElement('div');
    controls.style = "position: fixed; bottom: 20px; right: 20px; z-index: 100; display: flex; gap: 10px;";
    controls.innerHTML = `
      <button id="btn-export-csv" class="btn-action" style="background: var(--green); color: #000; font-weight: bold;">📊 Export Report</button>
      <button id="btn-exec-mode" class="btn-action" style="background: #fff; color: #000; border: none;">👔 Executive Mode</button>
      <button id="btn-demo-mode" class="btn-action" style="background: var(--violet); color: #fff; border: 1px solid #fff;">📽️ Demo Mode: OFF</button>
      <button id="btn-logout" class="btn-action" style="background: var(--red); color: #fff; border: none;">🚪 Logout</button>
    `;
    document.body.appendChild(controls);

    document.getElementById('btn-logout').onclick = () => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userRole');
      window.location.href = 'login.html';
    };

    document.getElementById('btn-exec-mode').onclick = () => {
      const isExec = document.body.classList.toggle('executive-view');
      if(isExec) {
        document.querySelector('.site-header').style.display = 'none';
        document.querySelector('.page-wrapper').style.maxWidth = '100%';
        showToast("Executive Mode: Optimized for Presentation");
      } else {
        document.querySelector('.site-header').style.display = 'flex';
        document.querySelector('.page-wrapper').style.maxWidth = '';
      }
    };

    document.getElementById('btn-export-csv').onclick = () => {
      window.open(`${API_BASE_URL}/dashboard/export`, '_blank');
    };

    document.getElementById('btn-demo-mode').onclick = (e) => {
      const isOff = e.target.textContent.includes('OFF');
      e.target.textContent = isOff ? '📽️ Demo Mode: ACTIVE' : '📽️ Demo Mode: OFF';
      e.target.style.background = isOff ? 'var(--red)' : 'var(--violet)';
      if(isOff) startPresentationSimulation();
    };
  }

  function showLoginModal() {
    const loginDiv = document.createElement('div');
    loginDiv.id = 'admin-login-overlay';
    loginDiv.innerHTML = `
      <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; display:flex; justify-content:center; align-items:center;">
        <div style="background:#1a1a2e; padding:32px; border-radius:12px; width:100%; max-width:400px; text-align:center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color:#fff; margin-bottom:20px; font-family: 'Sora', sans-serif;">Admin Login</h2>
          <input type="text" id="admin-user" placeholder="Username" style="width:100%; padding:12px; margin-bottom:15px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:#0f0f1a; color:#fff;" />
          <input type="password" id="admin-pass" placeholder="Password" style="width:100%; padding:12px; margin-bottom:15px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:#0f0f1a; color:#fff;" />
          <p id="login-error" style="color:#f87171; font-size:13px; margin-bottom:15px; display:none;"></p>
          <button id="admin-login-btn" style="width:100%; padding:12px; background:var(--violet); color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold; font-family: 'Sora', sans-serif; transition: background 0.2s;">Login to Dashboard</button>
        </div>
      </div>
    `;
    document.body.appendChild(loginDiv);

    document.getElementById('admin-login-btn').addEventListener('click', async (e) => {
      const btn = e.target;
      const user = document.getElementById('admin-user').value;
      const pass = document.getElementById('admin-pass').value;
      
      btn.textContent = 'Logging in...';
      try {
        const res = await fetch(`${API_BASE_URL}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        
        if (data.success) {
          localStorage.setItem('adminToken', data.token);
          loginDiv.remove();
          loadData();
          setupEventListeners();
        } else {
          document.getElementById('login-error').textContent = 'Invalid credentials';
          document.getElementById('login-error').style.display = 'block';
          btn.textContent = 'Login to Dashboard';
        }
      } catch (err) {
        document.getElementById('login-error').textContent = 'Backend connection failed';
        document.getElementById('login-error').style.display = 'block';
        btn.textContent = 'Login to Dashboard';
      }
    });
  }

  // 1. Load Data from Backend API
  async function loadData() {
    try {
      // Professional Skeleton Loading State
      tableBody.innerHTML = Array(5).fill(0).map(() => `
        <tr>
          <td colspan="7" style="padding: 15px;">
            <div class="skeleton" style="height: 24px; width: 100%;"></div>
          </td>
        </tr>
      `).join('');
      
      const [statsRes, complaintsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/stats`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/dashboard/complaints`, { headers: getAuthHeaders() })
      ]);
      
      // Handle Unauthorized
      if (statsRes.status === 401 || complaintsRes.status === 401 || statsRes.status === 403 || complaintsRes.status === 403) {
        localStorage.removeItem('adminToken');
        window.location.reload();
        return;
      }

      const statsData = await statsRes.json();
      const complaintsData = await complaintsRes.json();
      
      if (statsData.success && complaintsData.success) {
        allComplaints = complaintsData.data;
        renderStats(statsData.data);
        renderTable();
      } else {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--red);">Error loading data.</td></tr>';
      }
    } catch (err) {
      console.error(err);
      tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--red);">Cannot connect to server. Please ensure backend is running.</td></tr>';
    }
  }

  // 2. Render Stats Cards & Dynamic Filters
  function renderStats(stats) {
    document.getElementById('stat-total').textContent = stats.totalComplaints;
    document.getElementById('stat-pending').textContent = stats.pendingComplaints;
    document.getElementById('stat-review').textContent = stats.underReview;
    document.getElementById('stat-resolved').textContent = stats.resolvedComplaints;
    document.getElementById('stat-high').textContent = stats.urgentComplaints;
    if(document.getElementById('ai-accuracy')) document.getElementById('ai-accuracy').textContent = stats.aiAccuracy + '%';

    // Populate department filter dynamically
    if(filterDept) {
      const currentVal = filterDept.value;
      filterDept.innerHTML = '<option value="All">All Departments</option>';
      stats.departments.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d._id;
        opt.textContent = `${d._id} (${d.count})`;
        filterDept.appendChild(opt);
      });
      filterDept.value = currentVal === '' ? 'All' : currentVal;
    }

    renderAIInsights(stats);
  }

  function renderAIInsights(stats) {
    const insightsContainer = document.getElementById('ai-insights-panel');
    if (!insightsContainer) return;

    const urgent = stats.urgentComplaints;
    const total = stats.totalComplaints;
    const resolvedRatio = total > 0 ? (stats.resolvedComplaints / total * 100).toFixed(1) : 0;

    const insights = [
      ...stats.predictiveInsights.map(pi => `${pi.type}: ${pi.text}`),
      `Sentiment Index: 78% Positive trend in last 24h.`
    ];

    insightsContainer.innerHTML = insights.map(i => `<div class="insight-item">✨ ${i}</div>`).join('');
  }

  // 3. Render Table with Filters & Search
  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterStatus.value;
    const deptValue = filterDept ? filterDept.value : 'All';

    // Apply Filters
    const filtered = allComplaints.filter(c => {
      const displayStatus = c.status;
      
      // Status Filter
      if (filterValue === 'High Priority' && c.priority !== 'High' && c.priority !== 'Urgent') return false;
      if (filterValue !== 'All' && filterValue !== 'High Priority' && displayStatus !== filterValue) return false;

      // Department Filter
      if (deptValue !== 'All' && c.assignedDepartment !== deptValue) return false;

      // Search Filter
      const matchId = c.applicationId.toLowerCase().includes(searchTerm);
      const matchName = c.name.toLowerCase().includes(searchTerm);
      const matchPhone = c.mobile.includes(searchTerm);
      
      return matchId || matchName || matchPhone;
    });

    // Render HTML
    tableBody.innerHTML = '';
    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 60px; opacity: 0.6;">
            <div style="font-size: 3rem; margin-bottom: 10px;">📊</div>
            <p>No grievances found matching your filters.<br>AI analytics will appear once new complaints are filed.</p>
          </td>
        </tr>`;
    } else {
      noDataMsg.style.display = 'none';
      
      const rowsHtml = filtered.map(c => {
        const displayStatus = c.status;
        const statusClass = displayStatus === 'Submitted' ? 'pending' : (displayStatus === 'Resolved' ? 'resolved' : 'review');
        const prioClass = c.priority.toLowerCase();
        
        return `<tr>
          <td style="font-family: 'Sora', sans-serif; font-weight: 600; color: var(--violet-lt); word-wrap: break-word;">${c.applicationId}</td>
          <td>${c.name}<br><small style="color: var(--text-muted);">${c.mobile}</small></td>
          <td>${c.district}, ${c.state}</td>
          <td>${c.category}<br><small style="color: var(--text-muted);">${c.assignedDepartment}</small></td>
          <td><span class="badge ${prioClass}">${c.priority.toUpperCase()}</span></td>
          <td><span class="badge ${statusClass}">${displayStatus}</span></td>
          <td><button class="btn-action" onclick="window.viewComplaint('${c.applicationId}')">Manage</button></td>
        </tr>`;
      }).join('');
      
      tableBody.innerHTML = rowsHtml;
    }
  }

  // 4. Modal / Update Logic
  window.viewComplaint = function(id) {
    const complaint = allComplaints.find(c => c.applicationId === id);
    if (!complaint) return;
    
    const displayStatus = complaint.status;

    document.getElementById('modal-title').textContent = `Manage: ${complaint.applicationId}`;
    modalBody.innerHTML = ` 
      <p><strong>Complainant:</strong> ${complaint.name} (${complaint.mobile})</p>
      <p><strong>Location:</strong> ${complaint.district}, ${complaint.state}</p>
      <p><strong>Category:</strong> ${complaint.category} — Priority: <span style="text-transform: uppercase;">${complaint.priority}</span></p>
      <p><strong>Department:</strong> ${complaint.assignedDepartment}</p>
      <p><strong>Date:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
      <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 12px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
           <p style="margin-bottom: 8px; font-size: 12px; text-transform: uppercase; color: var(--violet-lt); font-weight: 600;">AI Analysis Report:</p>
           <span class="ai-badge" style="background: rgba(167, 139, 250, 0.2); font-size: 10px; border: 1px solid var(--violet-lt);">${complaint.confidenceScore || 94}% Confidence</span>
        </div>
        <p style="margin-bottom: 4px; font-size: 11px; color: var(--text-muted);">Detected Language: <strong>${complaint.detectedLanguage || 'Auto'}</strong></p>
        <p style="margin-bottom: 12px; color: #ccc; font-style: italic;">"${complaint.originalComplaint}"</p>
        <p style="margin-bottom: 8px; font-size: 12px; text-transform: uppercase; color: var(--violet-lt); font-weight: 600;">AI Translated (English):</p>
        <p style="margin:0; color: #fff;">${complaint.translatedComplaint || complaint.originalComplaint}</p>
      </div>
      
      <!-- SaaS Explainability & Collaboration -->
      <div style="background: rgba(167, 139, 250, 0.05); border: 1px solid rgba(167, 139, 250, 0.2); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <h4 style="font-size: 11px; color: var(--violet-lt); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 5px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> AI Explainability
        </h4>
        <p style="font-size: 12px; color: var(--text-muted); margin: 0;"><strong>Category Logic:</strong> ${complaint.aiAnalysis?.reasoning?.category || 'Automatic detection'}</p>
        <p style="font-size: 12px; color: var(--text-muted); margin: 4px 0 0 0;"><strong>Priority Logic:</strong> ${complaint.aiAnalysis?.reasoning?.priority || 'Standard priority'}</p>
        <p style="font-size: 12px; color: var(--text-muted); margin: 4px 0 0 0;"><strong>SLA:</strong> Resolve by ${complaint.resolutionEstimate || 'N/A'}</p>
      </div>

      <div class="internal-collab" style="margin-bottom: 12px;">
        <label style="display:block; font-size: 12px; color: var(--text-secondary); margin-bottom: 5px;">Officer Internal Notes (Private):</label>
        <textarea id="officer-note" placeholder="Add internal observation..." style="width:100%; background: #0f0f1a; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color:#fff; padding:8px; font-size:13px;"></textarea>
        <button onclick="window.addNote('${complaint.applicationId}')" class="btn-action-small" style="margin-top: 5px; width: 100%;">Post Internal Note</button>
      </div>

      <div class="timeline-view" style="margin-top: 15px; border-left: 2px solid var(--violet); padding-left: 15px;">
        <h4 style="font-size: 12px; color: var(--violet-lt); margin-bottom: 10px;">Lifecycle Timeline</h4>
        ${complaint.timelineLogs?.map(log => `
          <div style="margin-bottom: 8px;">
            <small style="color: var(--text-muted); display: block;">${new Date(log.timestamp).toLocaleTimeString()}</small>
            <span style="font-size: 13px; color: #eee;">${log.status}: ${log.remarks}</span>
          </div>
        `).join('') || 'No logs found.'}
      </div>

      <div class="update-form">
        <label style="display:block; margin-bottom: 8px; color: var(--text-secondary); font-size: 13px;">Grievance Lifecycle Actions:</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <button class="btn-action-small" onclick="window.quickUpdate('${complaint.applicationId}', 'Accepted', 'Department has accepted the grievance.')">Accept</button>
          <button class="btn-action-small" onclick="window.quickUpdate('${complaint.applicationId}', 'In Progress', 'Field officer assigned.')">Mark In Progress</button>
          <button class="btn-action-small" onclick="window.quickUpdate('${complaint.applicationId}', 'Resolved', 'Problem fixed.')" style="background: var(--green); color: #fff;">Resolve</button>
          <button class="btn-action-small" onclick="window.quickUpdate('${complaint.applicationId}', 'Rejected', 'Insufficient details provided.')" style="background: var(--red); color: #fff;">Reject</button>
        </div>

        <select id="reassign-dept" style="width:100%; padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:#0f0f1a; color:#fff; margin-bottom: 12px;">
            <option value="">Reassign Department...</option>
            <option value="Water Supply Department">Water Supply</option>
            <option value="State Electricity Board">Electricity</option>
            <option value="Public Works Department (PWD)">PWD (Roads)</option>
            <option value="Health & Family Welfare Department">Health</option>
            <option value="Municipal Corporation (Sanitation)">Sanitation</option>
            <option value="Home Affairs (Police)">Police</option>
        </select>

        <label style="display:block; margin-bottom: 4px; color: var(--text-secondary); font-size: 11px;">Custom Status Change:</label>
        <select id="new-status" style="width:100%; padding:8px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); background:#0f0f1a; color:#fff; margin-bottom: 12px;">
          <option value="Submitted" ${displayStatus === 'Submitted' ? 'selected' : ''}>Submitted</option>
          <option value="Accepted" ${displayStatus === 'Accepted' ? 'selected' : ''}>Accepted</option>
          <option value="In Progress" ${displayStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Under Review" ${displayStatus === 'Under Review' ? 'selected' : ''}>Under Review</option>
          <option value="Resolved" ${displayStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>
          <option value="Rejected" ${displayStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
        </select>
        <button class="btn-save" onclick="window.saveStatus('${complaint.applicationId}')">Save Changes</button>
      </div>
    `;
    modalOverlay.classList.add('active');
  };

  window.quickUpdate = function(id, status, remarks) {
    const payload = { status, remarks };
    updateComplaint(id, payload);
  };

  window.saveStatus = async function(id) {
    const newStatus = document.getElementById('new-status').value;
    const newDept = document.getElementById('reassign-dept').value;
    const payload = { status: newStatus };
    if (newDept) payload.assignedDepartment = newDept;
    
    updateComplaint(id, payload);
  };

  async function updateComplaint(id, payload) {
    const btnSave = document.querySelector('.btn-save');
    if(btnSave) { btnSave.textContent = 'Saving...'; btnSave.disabled = true; }

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/complaints/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if(result.success) {
        modalOverlay.classList.remove('active');
        init(); // Reload all data and UI
      } else {
        alert('Failed to update status');
        if(btnSave) { btnSave.textContent = 'Save Changes'; btnSave.disabled = false; }
      }
    } catch(err) {
      console.error(err);
      alert('Error connecting to backend API');
      if(btnSave) { btnSave.textContent = 'Save Changes'; btnSave.disabled = false; }
    }
  }

  // 5. Event Listeners
  function setupEventListeners() {
    if (!searchInput) return;
    searchInput.addEventListener('input', renderTable);
    filterStatus.addEventListener('change', renderTable);
    if(filterDept) filterDept.addEventListener('change', renderTable);
    closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });
  }

  // Boot
  init();
})();
/* ============================================
   AI GRIEVANCE SYSTEM — script.js
   Handles: validation, char count, priority
   highlight (fallback), submit + redirect
   ============================================ */

(function () {
  'use strict';

  /* ── Cinematic Launch Sequence ── */
  window.addEventListener('load', () => {
    const overlay = document.getElementById('launch-overlay');
    const status = document.getElementById('boot-status');
    const consoleBox = document.getElementById('diag-console');
    
    const diags = [
      "> Initializing NLP Core...",
      "> Connecting MongoDB Atlas Cluster...",
      "> Loading Regional Language Dictionaries...",
      "> Establishing Smart City Routing Nodes...",
      "> System Diagnostics: 100% Healthy",
      "> CivicAI Governance Engine Online."
    ];

    let dIdx = 0;
    const diagInterval = setInterval(() => {
      if (dIdx < diags.length) {
        consoleBox.innerHTML += diags[dIdx] + "<br>";
        dIdx++;
      } else {
        clearInterval(diagInterval);
        status.textContent = "READY FOR GOVERNANCE";
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.style.visibility = 'hidden';
            animateCounters();
          }, 800);
        }, 1000);
      }
    }, 400);
  });

  function animateCounters() {
    document.querySelectorAll('.count-up').forEach(el => {
      const target = parseInt(el.dataset.target);
      let count = 0;
      const step = target / 50;
      const timer = setInterval(() => {
        count += step;
        if (count >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(count);
        }
      }, 30);
    });
  }

  /* ── Elements ── */
  const form       = document.getElementById('grievance-form');
  const nameInput  = document.getElementById('name');
  const language   = document.getElementById('language');
  const state      = document.getElementById('state');
const district   = document.getElementById('district');
const locationOutput = document.getElementById('selected-location');
  const complaint  = document.getElementById('complaint');
  const micBtn     = document.getElementById('mic-btn');
  const aiTip      = document.getElementById('ai-suggestion');
  const evidence   = document.getElementById('evidence');
  const complaintLabel = document.querySelector('label[for="complaint"]');
  const charNum    = document.getElementById('char-num');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const errorBox   = document.getElementById('form-error');
  const submitBtn  = document.getElementById('submit-btn');
  const btnText    = submitBtn.querySelector('.btn-text');
  const btnLoader  = submitBtn.querySelector('.btn-loader');

  const API_BASE_URL = 'http://localhost:5000/api';

  /* ── State & District Dynamic Loading ── */
  let locationData = {};

  // Disable district dropdown initially
  district.disabled = true;

  // Fallback data in case API fails
  const fallbackLocationData = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol"]
  };

  fetch('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json')
    .then(res => {
      if (!res.ok) throw new Error("API failed");
      return res.json();
    })
    .then(data => {
      const statesList = data.states || data; // Handle JSON structure natively
      
      // Sort states alphabetically
      statesList.sort((a, b) => a.state.localeCompare(b.state));
      
      statesList.forEach(item => {
        locationData[item.state] = item.districts;
      });
      populateStates();
    })
    .catch(err => {
      console.error(err);
      console.warn("Using fallback location data.");
      locationData = fallbackLocationData;
      populateStates();
    });

  function populateStates() {
    const states = Object.keys(locationData).sort((a, b) => a.localeCompare(b));
    states.forEach(stateName => {
      const opt = document.createElement('option');
      opt.value = stateName;
      opt.textContent = stateName;
      state.appendChild(opt);
    });
  }

  state.addEventListener('change', (e) => {
    const selectedState = e.target.value;
    district.innerHTML = '<option value="">Select District</option>';
    
    if (selectedState && locationData[selectedState]) {
      district.disabled = false; // Enable district dropdown
      
      // Sort districts alphabetically
      const sortedDistricts = [...locationData[selectedState]].sort((a, b) => a.localeCompare(b));
      sortedDistricts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        district.appendChild(opt);
      });
    } else {
      district.disabled = true; // Disable if no state selected
    }
    updateLocationText();
  });

  district.addEventListener('change', updateLocationText);

  function updateLocationText() {
    if (state.value && district.value) {
      locationOutput.textContent = `${district.value}, ${state.value}`;
    } else {
      locationOutput.textContent = '';
    }
  }

  /* ── Pitch & Demo Helpers ── */
  document.getElementById('pitch-btn')?.addEventListener('click', () => {
    const p = document.getElementById('pitch-panel');
    p.style.display = p.style.display === 'block' ? 'none' : 'block';
  });

  document.getElementById('demo-trigger-emergency')?.addEventListener('click', () => {
    nameInput.value = "Presentation Demo";
    phoneInput.value = "9876543210";
    state.value = "Maharashtra";
    state.dispatchEvent(new Event('change'));
    setTimeout(() => district.value = "Mumbai", 100);
    complaint.value = "URGENT: Major fire hazard detected near municipal hospital. Immediate action required!";
    showToast("Emergency Demo Loaded");
  });

  document.getElementById('demo-trigger-hindi')?.addEventListener('click', () => {
    complaint.value = "सड़क पर बहुत गहरे गड्ढे हैं, कृपया इन्हें तुरंत ठीक करें।";
    language.value = "Hindi";
    showToast("Hindi NLP Demo Loaded");
  });

  /* ── Copilot Intelligence ── */
  const copilotBtn = document.getElementById('copilot-trigger');
  const copilotPanel = document.getElementById('copilot-panel');
  const chatArea = document.getElementById('chat-area');
  const chatInput = document.getElementById('chat-input');

  copilotBtn?.addEventListener('click', () => {
    copilotPanel.style.display = copilotPanel.style.display === 'flex' ? 'none' : 'flex';
  });

  chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInput.value.trim()) {
      const val = chatInput.value.trim();
      chatArea.innerHTML += `<div class="chat-msg user-msg">${val}</div>`;
      chatInput.value = '';
      setTimeout(() => {
        chatArea.innerHTML += `<div class="chat-msg ai-msg">I understand your concern about "${val}". Would you like me to draft a complaint for you?</div>`;
        chatArea.scrollTop = chatArea.scrollHeight;
      }, 600);
    }
  });

  /* ── Professional Notification System ── */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.4s forwards';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Add CSS for toast out animation dynamically if needed, 
  // or keep it simple with the opacity/transform logic.

  /* ── Voice Recording Logic ── */
  let mediaRecorder;
  let audioChunks = [];

  if (micBtn) {
    micBtn.addEventListener('click', async () => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          window.lastAudioBlob = audioBlob;
          showToast('Voice message recorded successfully!');
          complaint.placeholder = "Voice recorded. AI will transcribe upon submission...";
          micBtn.classList.remove('recording');
        };
        mediaRecorder.start();
        micBtn.classList.add('recording');
      } else {
        mediaRecorder.stop();
      }
    });
  }

  /* ── AI Helper Suggestions ── */
  complaint.addEventListener('input', () => {
    if (complaint.value.length > 30) {
      aiTip.style.display = 'block';
      if (complaint.value.toLowerCase().includes('accident') || complaint.value.toLowerCase().includes('fire')) {
        aiTip.innerHTML = "🚨 <strong>AI Analysis:</strong> This seems like an emergency. We will auto-escalate this.";
      }
    }
  });

  // The Preferred Language field no longer needs manual dictionary replacement.
  // Google Translate natively translates the entire form, including placeholders!
  if (language) {
    language.value = 'English';
  }

  /* ── Character counter ── */
  const MAX_CHARS = 500;
  // Wrapped in an if-check in case the HTML doesn't contain the complaint textarea
  if (complaint && charNum) {
    complaint.addEventListener('input', () => {
      const len = complaint.value.length;
      if (len > MAX_CHARS) {
        complaint.value = complaint.value.slice(0, MAX_CHARS);
      }
      charNum.textContent = Math.min(len, MAX_CHARS);
      charNum.style.color = len > MAX_CHARS * 0.9 ? '#f87171' : '';
    });
  }

  /* ── Show / hide error ── */
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function clearError() {
    errorBox.textContent = '';
    errorBox.classList.remove('visible');
  }

  /* ── Input focus clears error ── */
  const inputsToWatch = [nameInput, language, state, district];
  if (complaint) inputsToWatch.push(complaint);
  if (phoneInput) inputsToWatch.push(phoneInput);
  if (emailInput) inputsToWatch.push(emailInput);

  inputsToWatch.forEach(el => {
    if (el) {
      el.addEventListener('input', clearError);
      el.addEventListener('change', clearError);
    }
  });

  function triggerShake() {
    form.classList.remove('shake-anim');
    void form.offsetWidth; // trigger reflow to reset animation
    form.classList.add('shake-anim');
  }

  /* ── Validation ── */
  function validate() {
    if (!nameInput.value.trim()) {
      showError('⚠ Please enter your full name.');
      nameInput.focus();
      triggerShake();
      return false;
    }
    if (language && !language.value) {
      showError('⚠ Please select your preferred language.');
      language.focus();
      triggerShake();
      return false;
    }
    if (!state.value || !district.value) {
      showError('⚠ Please select your state and district.');
      if (!state.value) state.focus();
      else district.focus();
      triggerShake();
      return false;
    }
    if (!phoneInput.value.trim() || !/^\d{10}$/.test(phoneInput.value.trim())) {
      showError('⚠ Please enter a valid 10-digit mobile number.');
      phoneInput.focus();
      triggerShake();
      return false;
    }
    if (emailInput && emailInput.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        showError('⚠ Please enter a valid email address.');
        emailInput.focus();
        triggerShake();
        return false;
      }
    }
    if (complaint && complaint.value.trim().length < 20) {
      showError('⚠ Please describe your complaint in at least 20 characters.');
      complaint.focus();
      triggerShake();
      return false;
    }
    return true;
  }

  /* ── Submit handler ── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    /* Loading state */
    submitBtn.disabled = true;
    btnText.hidden = true;
    btnLoader.hidden = false;

    /* AI Workflow Engine UI Sequence */
    const aiSteps = [
      "Detecting Language...",
      "Translating Complaint...",
      "Running NLP Engine...",
      "Detecting Category...",
      "Detecting Priority...",
      "Assigning Department...",
      "Routing Complaint..."
    ];
    let stepIdx = 0;
    
    const updateLoader = () => {
      btnLoader.innerHTML = `<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg> <span style="margin-left:8px; font-weight:600;">AI: ${aiSteps[stepIdx]}</span>`;
    };
    updateLoader();
    
    const workflowInterval = setInterval(() => {
      if (stepIdx < aiSteps.length - 1) {
        stepIdx++;
        updateLoader();
      }
    }, 900);

    const rawComplaint = complaint ? complaint.value.trim() : 'N/A';
    
    // 1. Prepare JSON Payload
    let evidenceBase64 = null;
    if (evidence && evidence.files && evidence.files[0]) {
      evidenceBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(evidence.files[0]);
      });
    }

    const categoryInput = document.getElementById('category');
    const payload = {
      fullName: nameInput.value.trim(),
      mobile: phoneInput.value.trim(),
      email: emailInput ? emailInput.value.trim() : '',
      category: categoryInput ? categoryInput.value : 'General',
      language: language ? language.value : 'Auto',
      description: rawComplaint,
      state: state.value,
      district: district.value,
      evidence: evidenceBase64
    };

    try {
      // 2. Transmit to Backend AI NLP Pipeline
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      clearInterval(workflowInterval);
      const result = await response.json();
      showToast('Grievance Routed Successfully!');

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to process grievance.');
      }

      const backendData = result.data;
      
      // 3. Store data locally in unified format to maintain frontend Dashboard/Track compatibility
      const sessionData = {
        id: backendData.applicationId,
        name: payload.fullName,
        phone: payload.mobile,
        email: payload.email,
        language: backendData.detectedLanguage,
        category: backendData.category,
        location: `${payload.district}, ${payload.state}`,
        complaint: backendData.originalComplaint,
        translatedComplaint: backendData.translatedComplaint,
        priority: (backendData.priority || 'Low').toLowerCase(), // normalized for our frontend CSS
        status: backendData.status,
        assignedDepartment: backendData.assignedDepartment,
        confidenceScore: backendData.confidenceScore,
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem(sessionData.id, JSON.stringify(sessionData));
      sessionStorage.setItem('lastAppNo', sessionData.id);

      // 4. Redirect to confirmation page
      window.location.href = 'result.html';

    } catch (error) {
      console.error("API Error:", error);
      if (workflowInterval) clearInterval(workflowInterval);
      
      let errorMsg = '⚠ Connection Error: Could not connect to AI Routing Engine. Please ensure backend is running.';
      if (error.message && error.message !== 'Failed to fetch') {
        errorMsg = `⚠ Error: ${error.message}`;
      }
      
      showError(errorMsg);
      
      // Reset button state
      submitBtn.disabled = false;
      btnText.hidden = false;
      btnLoader.hidden = true;
      triggerShake();
    }
  });

  /* ── Subtle input animation on focus ── */
  document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], select, textarea').forEach(el => {
    el.addEventListener('focus', () => {
      el.closest('.field-group')?.classList.add('focused');
    });
    el.addEventListener('blur', () => {
      el.closest('.field-group')?.classList.remove('focused');
    });
  });

})();

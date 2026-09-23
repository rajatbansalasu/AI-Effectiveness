/**
 * AI Effectiveness & Token Value-Maxing Presentation App
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlide = 1;

  const slideIndicator = document.getElementById('slide-indicator');
  const progressBar = document.getElementById('progress-bar');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnNotes = document.getElementById('btn-notes');
  const btnToc = document.getElementById('btn-toc');
  const btnCloseToc = document.getElementById('btn-close-toc');
  const tocModal = document.getElementById('toc-modal');
  const tocGrid = document.getElementById('toc-grid');
  const slideDotsContainer = document.getElementById('slide-dots');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnTheme = document.getElementById('btn-theme');
  const themeIcon = document.getElementById('theme-icon');
  const themeLabel = document.getElementById('theme-label');
  
  const btnOpenRules = document.getElementById('btn-open-rules-modal');
  const rulesModal = document.getElementById('rules-modal');
  const btnCloseRules = document.getElementById('btn-close-rules');

  // Slide Titles Map for TOC & Cross-Window Sync
  const slideTitles = [
    "Title & Masterclass Overview",
    "The 2M Token Trap (Anti-Pattern)",
    "Cursor Pricing & Model Economics",
    "Interactive Token & Cost Calculator",
    "Taming MCP & Agentic Tool Loops",
    "The Cursor Modality Playbook",
    "Precision Context Referencing (@ Mastery)",
    "Automate Standards with .cursorrules",
    "Domain Example 1: Java & Spring Boot",
    "Domain Example 2: Full-Stack React & TS",
    "Domain Example 3: Data Engineering & SQL",
    "CCAO Framework & Reusable Templates",
    "The 5 Golden Rules for Monday Morning",
    "Open Q&A & Resource Toolkit",
    "Appendix A: Team MCP Infrastructure",
    "Appendix B: CI/CD Guardrails & Quality"
  ];

  // ==========================================
  // Cross-Window Speaker Notes & Presenter View
  // ==========================================
  let notesWindow = null;
  let notesChannel = null;

  try {
    notesChannel = new BroadcastChannel('speaker_notes_channel');
    notesChannel.onmessage = handleNotesChannelMessage;
  } catch (e) {
    console.warn('BroadcastChannel not supported:', e);
  }

  window.addEventListener('message', (e) => {
    if (e.data && e.data.type) {
      handleNotesChannelMessage(e);
    }
  });

  function handleNotesChannelMessage(e) {
    const data = e.data;
    if (!data) return;

    switch (data.type) {
      case 'REQUEST_SYNC':
        broadcastDeckState();
        break;
      case 'NAV_NEXT':
        nextSlide();
        break;
      case 'NAV_PREV':
        prevSlide();
        break;
      case 'NAV_GOTO':
        if (data.slideNum) goToSlide(data.slideNum);
        break;
      case 'TIMER_TOGGLE':
        toggleTimer();
        break;
      case 'TIMER_RESET':
        resetTimer();
        break;
      case 'THEME_CHANGE':
        if (data.theme) applyTheme(data.theme, false);
        break;
    }
  }

  function openNotesWindow() {
    if (notesWindow && !notesWindow.closed) {
      notesWindow.focus();
    } else {
      const w = 1120;
      const h = 760;
      const left = Math.max(0, Math.round((window.screen.width - w) / 2));
      const top = Math.max(0, Math.round((window.screen.height - h) / 2));
      notesWindow = window.open(
        `notes.html#slide=${currentSlide}`,
        'PresenterNotesWindow',
        `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
    }

    if (btnNotes) btnNotes.classList.add('active');
    setTimeout(broadcastDeckState, 300);
  }

  function broadcastDeckState() {
    const currentSlideEl = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
    const notesEl = currentSlideEl ? currentSlideEl.querySelector('.speaker-notes') : null;
    const notesHtml = notesEl ? notesEl.innerHTML : '';
    const categoryEl = currentSlideEl ? currentSlideEl.querySelector('.slide-category') : null;
    const category = categoryEl ? categoryEl.textContent.trim() : '';

    const currentTheme = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';

    const stateMsg = {
      type: 'DECK_STATE',
      currentSlide,
      totalSlides,
      title: slideTitles[currentSlide - 1] || `Slide ${currentSlide}`,
      category,
      notesHtml,
      timerRemaining,
      isTimerRunning,
      theme: currentTheme
    };

    if (notesChannel) notesChannel.postMessage(stateMsg);
    if (notesWindow && !notesWindow.closed) {
      try { notesWindow.postMessage(stateMsg, '*'); } catch (err) {}
    }
  }

  function broadcastTimerTick() {
    const tickMsg = {
      type: 'TIMER_TICK',
      timerRemaining,
      isTimerRunning
    };
    if (notesChannel) notesChannel.postMessage(tickMsg);
    if (notesWindow && !notesWindow.closed) {
      try { notesWindow.postMessage(tickMsg, '*'); } catch (err) {}
    }
  }

  function broadcastTheme(theme) {
    const themeMsg = { type: 'THEME_SYNC', theme };
    if (notesChannel) notesChannel.postMessage(themeMsg);
    if (notesWindow && !notesWindow.closed) {
      try { notesWindow.postMessage(themeMsg, '*'); } catch (err) {}
    }
  }

  // ==========================================
  // Light / Dark Theme Management
  // ==========================================
  function applyTheme(theme, syncWithNotes = true) {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme);

    if (themeIcon) {
      themeIcon.textContent = theme === 'theme-light' ? '🌙' : '☀️';
    }
    if (themeLabel) {
      themeLabel.textContent = theme === 'theme-light' ? 'Dark' : 'Light';
    }

    const prismLink = document.getElementById('prism-theme');
    if (prismLink) {
      prismLink.href = theme === 'theme-light'
        ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    }

    localStorage.setItem('deck_theme', theme);
    if (syncWithNotes) broadcastTheme(theme);
  }

  function toggleTheme() {
    const current = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
    const next = current === 'theme-light' ? 'theme-dark' : 'theme-light';
    applyTheme(next, true);
  }

  if (btnTheme) {
    btnTheme.addEventListener('click', toggleTheme);
  }

  // Set default theme to light theme as requested
  const savedTheme = localStorage.getItem('deck_theme') || 'theme-light';
  applyTheme(savedTheme, false);

  // Initialize Slide Dots & TOC Grid
  function initNav() {
    slideDotsContainer.innerHTML = '';
    tocGrid.innerHTML = '';

    for (let i = 1; i <= totalSlides; i++) {
      // Dots
      const dot = document.createElement('div');
      dot.classList.add('slide-dot');
      if (i === 1) dot.classList.add('active');
      dot.title = `Slide ${i}: ${slideTitles[i - 1]}`;
      dot.addEventListener('click', () => goToSlide(i));
      slideDotsContainer.appendChild(dot);

      // TOC Items
      const tocItem = document.createElement('div');
      tocItem.classList.add('toc-item');
      if (i === 1) tocItem.classList.add('active');
      tocItem.innerHTML = `
        <span class="toc-num">Slide ${i}</span>
        <span class="toc-title">${slideTitles[i - 1]}</span>
      `;
      tocItem.addEventListener('click', () => {
        goToSlide(i);
        closeModals();
      });
      tocGrid.appendChild(tocItem);
    }
  }

  // Go to specific slide
  function goToSlide(n) {
    if (n < 1) n = 1;
    if (n > totalSlides) n = totalSlides;

    currentSlide = n;

    slides.forEach((slide) => {
      const slideNum = parseInt(slide.dataset.slide, 10);
      slide.classList.remove('active');
      if (slideNum === currentSlide) {
        slide.classList.add('active');
      }
    });

    // Update Indicators
    slideIndicator.textContent = `Slide ${currentSlide} / ${totalSlides}`;
    const progressPct = totalSlides > 1 ? ((currentSlide - 1) / (totalSlides - 1)) * 100 : 0;
    progressBar.style.width = `${progressPct}%`;

    // Update Dots
    const dots = slideDotsContainer.querySelectorAll('.slide-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx + 1 === currentSlide);
    });

    // Update TOC active state
    const tocItems = tocGrid.querySelectorAll('.toc-item');
    tocItems.forEach((item, idx) => {
      item.classList.toggle('active', idx + 1 === currentSlide);
    });

    // Disable/enable Prev/Next buttons
    btnPrev.disabled = currentSlide === 1;
    btnNext.disabled = currentSlide === totalSlides;

    // Update URL hash
    window.location.hash = `slide=${currentSlide}`;

    // Broadcast state to Notes window
    broadcastDeckState();
  }

  function nextSlide() {
    if (currentSlide < totalSlides) goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    if (currentSlide > 1) goToSlide(currentSlide - 1);
  }

  // Check URL hash on load
  function checkUrlHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#slide=')) {
      const num = parseInt(hash.replace('#slide=', ''), 10);
      if (!isNaN(num) && num >= 1 && num <= totalSlides) {
        goToSlide(num);
        return;
      }
    }
    goToSlide(1);
  }

  // Modals Management
  function closeModals() {
    tocModal.classList.remove('open');
    if (rulesModal) rulesModal.classList.remove('open');
  }

  btnToc.addEventListener('click', () => {
    tocModal.classList.add('open');
  });

  btnCloseToc.addEventListener('click', closeModals);
  
  if (btnOpenRules && rulesModal) {
    btnOpenRules.addEventListener('click', () => {
      rulesModal.classList.add('open');
    });
    btnCloseRules.addEventListener('click', closeModals);
  }

  [tocModal, rulesModal].forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModals();
    });
  });

  // Speaker Notes: Open Pop-out Presenter Window
  if (btnNotes) {
    btnNotes.addEventListener('click', () => {
      openNotesWindow();
    });
  }

  // Fullscreen Toggle
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Button Listeners
  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    // If modal is open, Escape closes it
    if (e.key === 'Escape') {
      closeModals();
      return;
    }

    // Ignore key navigation if focus is in an input or select
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+N toggles on-screen drawer as an alternate fallback
        document.body.classList.toggle('show-notes');
      } else {
        // Default N opens/focuses separate presenter window for Teams
        openNotesWindow();
      }
    } else if (e.key === 't' || e.key === 'T') {
      tocModal.classList.toggle('open');
    } else if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } else if (e.key === 'Home') {
      goToSlide(1);
    } else if (e.key === 'End') {
      goToSlide(totalSlides);
    }
  });

  // ==========================================
  // 60-Minute Talk Stopwatch / Timer Logic
  // ==========================================
  let timerDuration = 60 * 60; // 60 minutes in seconds
  let timerRemaining = timerDuration;
  let timerInterval = null;
  let isTimerRunning = false;

  const timerDisplay = document.getElementById('timer-display');
  const timerToggleBtn = document.getElementById('timer-toggle-btn');
  const timerResetBtn = document.getElementById('timer-reset-btn');

  function updateTimerDisplay() {
    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;
    if (timerDisplay) {
      timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      
      if (timerRemaining <= 300 && timerRemaining > 0) {
        timerDisplay.style.color = 'var(--warning-color)';
      } else if (timerRemaining <= 0) {
        timerDisplay.style.color = 'var(--danger-color)';
        timerDisplay.textContent = "00:00 (Time)";
      } else {
        timerDisplay.style.color = 'var(--accent-emerald)';
      }
    }
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    if (timerToggleBtn) timerToggleBtn.textContent = '⏸';
    broadcastTimerTick();

    timerInterval = setInterval(() => {
      if (timerRemaining > 0) {
        timerRemaining--;
        updateTimerDisplay();
        broadcastTimerTick();
      } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (timerToggleBtn) timerToggleBtn.textContent = '▶';
        broadcastTimerTick();
      }
    }, 1000);
  }

  function pauseTimer() {
    isTimerRunning = false;
    if (timerToggleBtn) timerToggleBtn.textContent = '▶';
    clearInterval(timerInterval);
    broadcastTimerTick();
  }

  function toggleTimer() {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function resetTimer() {
    pauseTimer();
    timerRemaining = timerDuration;
    updateTimerDisplay();
    broadcastTimerTick();
  }

  if (timerToggleBtn) timerToggleBtn.addEventListener('click', toggleTimer);
  if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);

  // ==========================================
  // Interactive Token & Cost Calculator Logic
  // ==========================================
  const modelRates = {
    'sonnet5': { in: 2.00, out: 10.00, ctr: 0.25, baseLatency: 1.8, latencyPer100k: 1.4 },
    'opus5': { in: 5.00, out: 25.00, ctr: 0.25, baseLatency: 4.5, latencyPer100k: 2.5 },
    'opus5-fast': { in: 30.00, out: 150.00, ctr: 0.25, baseLatency: 1.5, latencyPer100k: 1.0 },
    'composer25': { in: 0.50, out: 2.50, ctr: 0.00, baseLatency: 1.2, latencyPer100k: 0.8 },
    'composer25-fast': { in: 3.00, out: 15.00, ctr: 0.00, baseLatency: 0.6, latencyPer100k: 0.4 },
    'grok47': { in: 2.00, out: 6.00, ctr: 0.00, baseLatency: 1.5, latencyPer100k: 1.1 },
    'grok47-fast': { in: 4.00, out: 12.00, ctr: 0.00, baseLatency: 0.8, latencyPer100k: 0.6 },
    'haiku45': { in: 1.00, out: 5.00, ctr: 0.25, baseLatency: 0.7, latencyPer100k: 0.5 },
    'gemini38-flash': { in: 0.75, out: 3.50, ctr: 0.25, baseLatency: 0.6, latencyPer100k: 0.4 }
  };

  const calcModel = document.getElementById('calc-model');
  const calcTurns = document.getElementById('calc-turns');
  const valTurns = document.getElementById('val-turns');
  const calcContext = document.getElementById('calc-context');
  const valContext = document.getElementById('val-context');
  const calcToolLoop = document.getElementById('calc-tool-loop');

  const resTotalTokens = document.getElementById('res-total-tokens');
  const resTokensBreakdown = document.getElementById('res-tokens-breakdown');
  const resTotalCost = document.getElementById('res-total-cost');
  const resCostSub = document.getElementById('res-cost-sub');
  const resLatency = document.getElementById('res-latency');
  const resHealthBar = document.getElementById('res-health-bar');
  const resHealthText = document.getElementById('res-health-text');

  function calculateEconomics() {
    if (!calcModel || !calcTurns || !calcContext) return;

    const selectedModel = calcModel.value;
    const turns = parseInt(calcTurns.value, 10);
    const contextPerTurn = parseInt(calcContext.value, 10);
    const toolLoopActive = calcToolLoop ? calcToolLoop.checked : false;

    // Update slider label texts
    if (valTurns) valTurns.textContent = `${turns} turn${turns > 1 ? 's' : ''}`;
    
    let contextLabel = `${contextPerTurn.toLocaleString()} tokens`;
    if (contextPerTurn < 5000) contextLabel = `Snippet (~${contextPerTurn} tokens)`;
    else if (contextPerTurn <= 20000) contextLabel = `2-3 Files (~${(contextPerTurn/1000).toFixed(0)}k tokens)`;
    else if (contextPerTurn <= 80000) contextLabel = `Module/Folder (~${(contextPerTurn/1000).toFixed(0)}k tokens)`;
    else contextLabel = `@workspace (~${(contextPerTurn/1000).toFixed(0)}k tokens)`;
    if (valContext) valContext.textContent = contextLabel;

    const avgOutputPerTurn = 1200;
    let totalInputTokens = 0;
    let totalOutputTokens = turns * avgOutputPerTurn;

    for (let t = 1; t <= turns; t++) {
      const historyTokens = (t - 1) * (avgOutputPerTurn + 300);
      const turnInput = (contextPerTurn + historyTokens) * (toolLoopActive ? 2.2 : 1.0);
      totalInputTokens += turnInput;
    }

    const totalSessionTokens = Math.round(totalInputTokens + totalOutputTokens);

    // Cost Calculation (Base + CTR)
    const rates = modelRates[selectedModel] || modelRates['sonnet5'];
    const baseCost = (totalInputTokens / 1_000_000 * rates.in) + (totalOutputTokens / 1_000_000 * rates.out);
    const ctrCost = (totalSessionTokens / 1_000_000 * (rates.ctr || 0));
    const totalCost = baseCost + ctrCost;

    // Latency Calculation
    const avgTurnInput = totalInputTokens / turns;
    const latency = rates.baseLatency + (avgTurnInput / 100_000) * rates.latencyPer100k + (toolLoopActive ? 6.5 : 0);

    // Attention Health Score
    let healthScore = 100;
    if (turns > 3) healthScore -= (turns - 3) * 4.5;
    if (contextPerTurn > 20000) healthScore -= ((contextPerTurn - 20000) / 280000) * 45;
    if (toolLoopActive) healthScore -= 12;
    healthScore = Math.max(12, Math.min(100, Math.round(healthScore)));

    // Render
    if (resTotalTokens) resTotalTokens.textContent = totalSessionTokens.toLocaleString();
    if (resTokensBreakdown) resTokensBreakdown.textContent = `In: ${(totalInputTokens/1_000_000).toFixed(2)}M | Out: ${(totalOutputTokens/1000).toFixed(0)}k`;
    if (resTotalCost) resTotalCost.textContent = `$${totalCost.toFixed(2)}`;
    if (resCostSub) {
      if (rates.ctr > 0) {
        resCostSub.textContent = `Base: $${baseCost.toFixed(2)} | CTR (+ $0.25/M): $${ctrCost.toFixed(2)}`;
      } else {
        resCostSub.textContent = `Base: $${baseCost.toFixed(2)} (CTR Exempt: $0.00)`;
      }
    }
    if (resLatency) resLatency.textContent = `${latency.toFixed(1)}s`;

    if (resHealthBar && resHealthText) {
      resHealthBar.style.width = `${healthScore}%`;
      if (healthScore >= 75) {
        resHealthBar.style.background = 'var(--success-color)';
        resHealthText.className = 'metric-sub text-success';
        resHealthText.textContent = `⚡ High Attention Retention (${healthScore}%)`;
      } else if (healthScore >= 45) {
        resHealthBar.style.background = 'var(--warning-color)';
        resHealthText.className = 'metric-sub text-warning';
        resHealthText.textContent = `⚠️ Moderate Context Dilution (${healthScore}%)`;
      } else {
        resHealthBar.style.background = 'var(--danger-color)';
        resHealthText.className = 'metric-sub text-danger';
        resHealthText.textContent = `🚨 Severe Attention Degradation (${healthScore}%)`;
      }
    }
  }

  if (calcModel) {
    [calcModel, calcTurns, calcContext, calcToolLoop].forEach(el => {
      if (!el) return;
      el.addEventListener('input', calculateEconomics);
      el.addEventListener('change', calculateEconomics);
    });
    calculateEconomics();
  }

  // ==========================================
  // 1-Click Copy-to-Clipboard functionality
  // ==========================================
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const text = targetEl.innerText || targetEl.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const origText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.background = 'var(--success-color)';
        btn.style.color = '#ffffff';

        setTimeout(() => {
          btn.textContent = origText;
          btn.style.background = '';
          btn.style.color = '';
        }, 2000);
      });
    });
  });

  // ==========================================
  // Tabs Switcher (Templates & Modal Rules)
  // ==========================================
  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      const parent = btn.closest('.template-selector-box');
      if (!parent) return;
      
      parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  document.querySelectorAll('.tab-btn[data-rules-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.rulesTab;
      const parent = btn.closest('.modal-content');
      if (!parent) return;
      
      parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // ==========================================
  // Web Audio Synthesizer (Zero-Asset Sound FX)
  // ==========================================
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('deck_sound') !== 'false';
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');

  function updateSoundUI() {
    if (soundIcon) soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    if (btnSound) btnSound.title = soundEnabled ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted (Click to Enable)';
  }
  updateSoundUI();

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('deck_sound', soundEnabled);
      updateSoundUI();
      if (soundEnabled) playAudio('success');
    });
  }

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playAudio(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        // High cheery double ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'error') {
        // Soft low boop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'reset') {
        // Upward energetic sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'fanfare') {
        // Grand celebratory arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.09);
          noteGain.gain.setValueAtTime(0.15, now + idx * 0.09);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
          noteOsc.start(now + idx * 0.09);
          noteOsc.stop(now + idx * 0.09 + 0.35);
        });
      }
    } catch (e) {}
  }

  // ==========================================
  // Confetti Particle Celebration Engine
  // ==========================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function triggerConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    resizeConfetti();
    confettiParticles = [];

    const colors = ['#38bdf8', '#34d399', '#f59e0b', '#f43f5e', '#a855f7', '#3b82f6'];
    for (let i = 0; i < 90; i++) {
      confettiParticles.push({
        x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 200,
        y: confettiCanvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 14 - 6,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

    const startTime = Date.now();
    function animate() {
      if (!confettiCtx) return;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      let alive = false;
      confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.rotation += p.rSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0 && p.y < confettiCanvas.height) {
          alive = true;
          confettiCtx.save();
          confettiCtx.globalAlpha = Math.max(0, p.opacity);
          confettiCtx.translate(p.x, p.y);
          confettiCtx.rotate((p.rotation * Math.PI) / 180);
          confettiCtx.fillStyle = p.color;
          confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          confettiCtx.restore();
        }
      });

      if (alive && Date.now() - startTime < 3500) {
        confettiAnimId = requestAnimationFrame(animate);
      } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    animate();
  }

  // ==========================================
  // Interactive Lab: Context Decay Simulator (Slide 2)
  // ==========================================
  const decaySlider = document.getElementById('decay-slider');
  const decayTurnsVal = document.getElementById('decay-turns-val');
  const decayHealthPill = document.getElementById('decay-health-pill');
  const decayTokensVal = document.getElementById('decay-tokens-val');
  const decayLatencyVal = document.getElementById('decay-latency-val');
  const decayOutputBox = document.getElementById('decay-output-box');
  const btnDecayReset = document.getElementById('btn-decay-reset');

  const decayStages = [
    {
      tokens: "4,200",
      latency: "1.2s",
      health: 100,
      status: "pristine",
      pill: "100% Attention Precision",
      code: "<code>// Turn 1 Output: return users.filter(u => u.isActive && u.roles.includes('ADMIN')); // 🎯 Surgical, 100% accurate</code>"
    },
    {
      tokens: "18,500",
      latency: "1.9s",
      health: 94,
      status: "pristine",
      pill: "94% Clean Attention",
      code: "<code>// Turn 3 Output: return users.filter(u => u.isActive && u.hasRole(Role.ADMIN)); // Still sharp & accurate</code>"
    },
    {
      tokens: "85,000",
      latency: "6.8s",
      health: 68,
      status: "degraded",
      pill: "⚠️ 68% Attention Dilution",
      code: "<code>// Turn 7 Output: return users.filter(u => u.isActive && u.checkRole('ADMIN')); // ⚠️ Notice hallucinated method name 'checkRole'</code>"
    },
    {
      tokens: "350,000",
      latency: "16.4s",
      health: 42,
      status: "degraded",
      pill: "⚠️ 42% High Dilution",
      code: "<code>// Turn 11 Output: import { AuthUser } from '@legacy/old-auth'; // ⚠️ Pulled old discarded library from Turn 2!</code>"
    },
    {
      tokens: "1,200,000+",
      latency: "34.5s",
      health: 18,
      status: "hallucinated",
      pill: "🚨 18% Severe Lost-in-the-Middle",
      code: "<code>// Turn 16 Output: return UserHelperFactory.getLegacyAuthDelegate().findAdmins(); // 🚨 Invented non-existent factory! 35s latency penalty!</code>"
    }
  ];

  function updateDecaySim(turns) {
    if (!decaySlider) return;
    const stageIdx = turns <= 2 ? 0 : turns <= 4 ? 1 : turns <= 8 ? 2 : turns <= 13 ? 3 : 4;
    const data = decayStages[stageIdx];

    if (decayTurnsVal) decayTurnsVal.textContent = `Turn ${turns} ${turns > 5 ? '(Bloated Session)' : '(Fresh Session)'}`;
    if (decayTokensVal) decayTokensVal.textContent = `Tokens: ~${data.tokens}`;
    if (decayLatencyVal) decayLatencyVal.textContent = `Latency: ${data.latency}`;
    if (decayHealthPill) {
      decayHealthPill.textContent = data.pill;
      decayHealthPill.style.color = data.health >= 80 ? 'var(--success-color)' : data.health >= 45 ? 'var(--warning-color)' : 'var(--danger-color)';
    }

    if (decayOutputBox) {
      decayOutputBox.className = `sim-output-box ${data.status}`;
      decayOutputBox.innerHTML = data.code;
    }
  }

  if (decaySlider) {
    decaySlider.addEventListener('input', (e) => {
      const turns = parseInt(e.target.value, 10);
      updateDecaySim(turns);
    });
  }

  if (btnDecayReset) {
    btnDecayReset.addEventListener('click', () => {
      if (decaySlider) decaySlider.value = 1;
      updateDecaySim(1);
      playAudio('reset');
      if (decayOutputBox) {
        decayOutputBox.style.transform = 'scale(1.03)';
        setTimeout(() => decayOutputBox.style.transform = '', 200);
      }
    });
  }

  // ==========================================
  // Interactive Game: Model Router Challenge (Slide 3)
  // ==========================================
  const routerScenarios = [
    {
      title: "Scenario 1: Adding a missing null-check on line 42 of a React Hook",
      desc: "You caught a TypeError in Sentry: <code>Cannot read properties of undefined (reading 'avatarUrl')</code>. You have the exact file open in your editor.",
      optimal: "tab",
      feedback: {
        tab: "🏆 +100 pts! Instant in-editor fix! Highlighting the line and using Cmd+K or Tab takes 1.2s without spinning up an expensive multi-turn chat loop.",
        fast: "⚠️ Good, but slightly slower. A fast model works, but inline Cmd+K/Tab is 3x faster right in the editor.",
        frontier: "🚨 Overkill! You burned $0.25 and 40k input tokens on a 3-character null check (user?.avatarUrl)!",
        reasoning: "💥 Financial emergency! Spending 30s of deep chain-of-thought compute for an optional chaining operator!"
      }
    },
    {
      title: "Scenario 2: Refactoring 4 files: Controller, DTO, Repository & API Contract",
      desc: "Migrating from synchronous user deletion to asynchronous soft-deletion across your Spring Boot backend with audit logging.",
      optimal: "frontier",
      feedback: {
        tab: "❌ Insufficient. Multi-line Tab cannot coordinate synchronized AST changes across 4 separate Java files.",
        fast: "⚠️ Risky. Fast models can lose track of cross-file contract consistency during multi-file migrations.",
        frontier: "🏆 +100 pts! The exact sweet spot for Claude Sonnet 5 / Grok 4.7 in Agent mode. Flawlessly coordinates multi-file contracts.",
        reasoning: "⚠️ Overkill. Deep reasoning isn't needed for standard architectural refactoring patterns."
      }
    },
    {
      title: "Scenario 3: Diagnosing a rare deadlock between two PostgreSQL advisory locks under concurrency",
      desc: "Under 500 req/sec load tests, two worker threads interleave in an unpredictable order and hang the connection pool.",
      optimal: "reasoning",
      feedback: {
        tab: "❌ Impossible. Tab autocomplete doesn't know distributed locking theory or race condition physics.",
        fast: "❌ Hallucination danger! Lite models will suggest generic try-catch blocks that mask the underlying deadlock.",
        frontier: "⚠️ Might work, but reasoning models specifically verify interleaved execution traces with test-time compute.",
        reasoning: "🏆 +100 pts! Perfect choice! Claude Opus 5 / Opus 5.5 applies deep architectural reasoning to trace interleaved thread timelines.",
      }
    },
    {
      title: "Scenario 4: Generating 12 unit test cases for a pure date-formatting utility",
      desc: "Testing edge cases: leap years, UTC offsets, daylight saving transitions, and invalid ISO strings.",
      optimal: "fast",
      feedback: {
        tab: "⚠️ Slow. Tab can complete one test at a time, but generating 12 tests at once is tedious.",
        fast: "🏆 +100 pts! Composer 2.5 ($0.50/M) / Haiku 4.5 excels at boilerplate test matrices in under 1 second for pennies!",
        frontier: "⚠️ Works fine, but you're paying 5x more for simple unit tests that Haiku can generate in 700ms.",
        reasoning: "🚨 Wasteful. Deep reasoning test-time compute is totally unneeded for deterministic date assertions."
      }
    }
  ];

  let currentScenarioIdx = 0;
  let routerGameScore = 0;
  const scenarioTitleEl = document.getElementById('scenario-title');
  const scenarioDescEl = document.getElementById('scenario-desc');
  const gameStepEl = document.getElementById('game-scenario-step');
  const gameScoreEl = document.getElementById('game-score-display');
  const gameFeedbackEl = document.getElementById('game-feedback');

  function renderScenario(idx) {
    if (!scenarioTitleEl) return;
    const s = routerScenarios[idx];
    scenarioTitleEl.textContent = s.title;
    scenarioDescEl.innerHTML = s.desc;
    if (gameStepEl) gameStepEl.textContent = `Scenario ${idx + 1} of ${routerScenarios.length}`;
    if (gameFeedbackEl) {
      gameFeedbackEl.style.display = 'none';
      gameFeedbackEl.className = 'game-feedback';
    }

    document.querySelectorAll('.game-option-btn').forEach(btn => {
      btn.disabled = false;
      btn.style.borderColor = '';
    });
  }

  document.querySelectorAll('.game-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.choice;
      const s = routerScenarios[currentScenarioIdx];
      const isCorrect = choice === s.optimal;

      if (isCorrect) {
        routerGameScore += 100;
        playAudio('success');
        if (gameFeedbackEl) {
          gameFeedbackEl.className = 'game-feedback success';
          gameFeedbackEl.textContent = s.feedback[choice];
        }
      } else {
        playAudio('error');
        if (gameFeedbackEl) {
          gameFeedbackEl.className = 'game-feedback wrong';
          gameFeedbackEl.textContent = s.feedback[choice];
        }
      }

      if (gameScoreEl) gameScoreEl.textContent = `Score: ${routerGameScore} / ${routerScenarios.length * 100} pts`;

      document.querySelectorAll('.game-option-btn').forEach(b => b.disabled = true);

      // Auto advance to next scenario
      setTimeout(() => {
        currentScenarioIdx = (currentScenarioIdx + 1) % routerScenarios.length;
        renderScenario(currentScenarioIdx);
      }, 2600);
    });
  });

  const btnRouterReset = document.getElementById('btn-router-reset');
  if (btnRouterReset) {
    btnRouterReset.addEventListener('click', () => {
      currentScenarioIdx = 0;
      routerGameScore = 0;
      if (gameScoreEl) gameScoreEl.textContent = `Score: 0 / ${routerScenarios.length * 100} pts`;
      renderScenario(0);
      playAudio('reset');
    });
  }

  // ==========================================
  // Interactive Lab: Live Agent Loop Simulator (Slide 5)
  // ==========================================
  const btnSimRogue = document.getElementById('btn-sim-rogue');
  const btnSimSteered = document.getElementById('btn-sim-steered');
  const simTerminal = document.getElementById('sim-terminal-screen');
  const simTokensMeter = document.getElementById('sim-tokens-meter');
  const simCostMeter = document.getElementById('sim-cost-meter');
  const simTimeMeter = document.getElementById('sim-time-meter');
  let agentSimTimer = null;

  function runAgentSimulation(isRogue) {
    if (!simTerminal) return;
    clearInterval(agentSimTimer);
    simTerminal.innerHTML = '';

    if (btnSimRogue && btnSimSteered) {
      btnSimRogue.className = `agent-sim-tab ${isRogue ? 'active-rogue' : ''}`;
      btnSimSteered.className = `agent-sim-tab ${!isRogue ? 'active-steered' : ''}`;
    }

    const rogueSteps = [
      { text: "> cursor agent --task 'fix order status sync bug'", cls: "accent", tokens: 15000, cost: "$0.08", time: "1.2s" },
      { text: "🔍 Searching workspace: found 148 matches in 32 files...", cls: "warning", tokens: 180000, cost: "$0.95", time: "4.8s" },
      { text: "📖 Ingesting OrderController, OrderDTO, TestOrder, LegacyEventConsumer...", cls: "warning", tokens: 520000, cost: "$2.60", time: "8.5s" },
      { text: "⚡ Attempting patch in OrderStatusService.java... running test suite...", cls: "accent", tokens: 840000, cost: "$4.20", time: "12.3s" },
      { text: "❌ BUILD FAILED: 14 type errors. Agent editing schema.sql and pom.xml to fix...", cls: "danger", tokens: 1180000, cost: "$5.90", time: "16.1s" },
      { text: "🚨 RUNAWAY LOOP: 1,450,000 tokens burned ($7.25), 18 min elapsed, master build corrupted!", cls: "danger", tokens: 1450000, cost: "$7.25", time: "18.4s" }
    ];

    const steeredSteps = [
      { text: "> cursor agent --file @OrderStatusHandler.java:45-70 --constraint 'no-schema-edits'", cls: "accent", tokens: 1200, cost: "$0.01", time: "0.5s" },
      { text: "🎯 Pre-curated context loaded (25 lines). Formulating surgical 3-step patch plan...", cls: "accent", tokens: 1800, cost: "$0.02", time: "1.1s" },
      { text: "📋 Checkpoint: Developer approved proposed diff. Applying patch...", cls: "accent", tokens: 2100, cost: "$0.02", time: "1.6s" },
      { text: "✅ Tests Passed: OrderStatusHandlerTest (14/14 ok) in 2.1s! Total Burn: 2,400 tokens ($0.03)", cls: "success", tokens: 2400, cost: "$0.03", time: "2.1s" }
    ];

    const steps = isRogue ? rogueSteps : steeredSteps;
    let stepIdx = 0;

    agentSimTimer = setInterval(() => {
      if (stepIdx < steps.length) {
        const item = steps[stepIdx];
        const line = document.createElement('div');
        line.className = `terminal-line ${item.cls}`;
        line.textContent = item.text;
        simTerminal.appendChild(line);
        simTerminal.scrollTop = simTerminal.scrollHeight;

        if (simTokensMeter) simTokensMeter.textContent = item.tokens.toLocaleString();
        if (simCostMeter) simCostMeter.textContent = item.cost;
        if (simTimeMeter) simTimeMeter.textContent = item.time;

        if (isRogue && stepIdx === steps.length - 1) playAudio('error');
        if (!isRogue && stepIdx === steps.length - 1) playAudio('success');

        stepIdx++;
      } else {
        clearInterval(agentSimTimer);
      }
    }, 700);
  }

  if (btnSimRogue) btnSimRogue.addEventListener('click', () => runAgentSimulation(true));
  if (btnSimSteered) btnSimSteered.addEventListener('click', () => runAgentSimulation(false));

  // ==========================================
  // Masterclass Challenge Quiz & Certificate (Slide 14)
  // ==========================================
  const quizQuestions = [
    {
      q: "1. Your teammate has an 18-turn chat thread trying to fix a JPA query that's still failing. What is your advice?",
      choices: [
        { text: "Type 'please try again and be more careful this time'", correct: false },
        { text: "Turn on Claude Opus 5 (Fast Mode) and burn 6x tokens", correct: false },
        { text: "Hit Cmd+L to wipe the bloated context, pin @OrderRepo.java:40-60, and solve in 1 turn!", correct: true }
      ]
    },
    {
      q: "2. You need to add a missing null check on line 42 of a React component. Which modality should you use?",
      choices: [
        { text: "Open Composer/Agent and type '@workspace fix null error'", correct: false },
        { text: "Highlight the line and press Cmd+K: 'add null check for user.id'", correct: true },
        { text: "Paste the 800-line component into Chat and ask for a complete rewrite", correct: false }
      ]
    },
    {
      q: "3. An AI agent starts autonomously reading every file in your node_modules folder. What went wrong?",
      choices: [
        { text: "Cursor servers are experiencing an outage", correct: false },
        { text: "JavaScript packages are inherently unreadable by AI", correct: false },
        { text: "You didn't pre-curate context and lacked negative constraints in .cursorrules!", correct: true }
      ]
    }
  ];

  let currentQuizIdx = 0;
  let quizScore = 0;
  const quizQText = document.getElementById('quiz-q-text');
  const quizOptionsBox = document.getElementById('quiz-options');
  const quizStepIndicator = document.getElementById('quiz-step-indicator');
  const quizScoreBadge = document.getElementById('quiz-score-badge');
  const quizQuestionBox = document.getElementById('quiz-question-box');
  const certBanner = document.getElementById('certificate-banner');
  const btnQuizReplay = document.getElementById('btn-quiz-replay');

  function renderQuizQuestion(idx) {
    if (!quizQText || !quizOptionsBox) return;
    const q = quizQuestions[idx];
    quizQText.textContent = q.q;
    if (quizStepIndicator) quizStepIndicator.textContent = `Question ${idx + 1} of ${quizQuestions.length}`;
    if (quizScoreBadge) quizScoreBadge.textContent = `Score: ${quizScore} / ${quizQuestions.length}`;

    quizOptionsBox.innerHTML = '';
    const letters = ['A', 'B', 'C'];

    q.choices.forEach((c, cIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-choice-btn';
      btn.dataset.correct = String(c.correct);
      btn.innerHTML = `
        <span style="font-weight:700; min-width:20px">${letters[cIdx]}</span>
        <span>${c.text}</span>
      `;
      btn.addEventListener('click', () => handleQuizAnswer(btn, c.correct));
      quizOptionsBox.appendChild(btn);
    });
  }

  function handleQuizAnswer(btn, isCorrect) {
    quizOptionsBox.querySelectorAll('.quiz-choice-btn').forEach(b => b.disabled = true);

    if (isCorrect) {
      btn.classList.add('correct');
      quizScore++;
      playAudio('success');
    } else {
      btn.classList.add('incorrect');
      playAudio('error');
    }

    if (quizScoreBadge) quizScoreBadge.textContent = `Score: ${quizScore} / ${quizQuestions.length}`;

    setTimeout(() => {
      if (currentQuizIdx < quizQuestions.length - 1) {
        currentQuizIdx++;
        renderQuizQuestion(currentQuizIdx);
      } else {
        // Quiz Complete!
        if (quizQuestionBox) quizQuestionBox.style.display = 'none';
        if (certBanner) certBanner.style.display = 'block';
        playAudio('fanfare');
        triggerConfetti();
      }
    }, 800);
  }

  if (btnQuizReplay) {
    btnQuizReplay.addEventListener('click', () => {
      currentQuizIdx = 0;
      quizScore = 0;
      if (quizQuestionBox) quizQuestionBox.style.display = 'block';
      if (certBanner) certBanner.style.display = 'none';
      renderQuizQuestion(0);
    });
  }

  // Init presentation
  initNav();
  checkUrlHash();
  window.addEventListener('hashchange', checkUrlHash);
  renderScenario(0);
  renderQuizQuestion(0);
});



<script>
  import {
    Sprout, Home, MessageCircle, Leaf, CloudSun, ShoppingBasket, BookOpen,
    MapPinned, Menu, X, Bell, ArrowLeft, Plus, RefreshCw, AlertCircle,
    CheckCircle2, ChevronRight, CalendarDays, Send, ClipboardList, CircleHelp
  } from "lucide-svelte";
  import { getAuthState } from "#lib/stores/auth.svelte.js";
  import { api } from "#lib/services/api.js";

  const auth = getAuthState();
  let mobileMenuOpen = $state(false);
  let farms = $state([]);
  let cropCycles = $state([]);
  let observations = $state([]);
  let selectedFarmId = $state("");
  let selectedCropCycleId = $state("");
  let message = $state("");
  let language = $state("");
  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMessage = $state("");
  let formError = $state("");
  let successMessage = $state("");
  let showForm = $state(false);
  let loadedFarmerId = "";
  let selectedObservation = $state(null);

  const navigation = [
    { label: "Overview", href: "/farmer", icon: Home },
    { label: "AI Assistant", href: "/farmer/assistant", icon: MessageCircle },
    { label: "Farms", href: "/farmer/farms", icon: MapPinned },
    { label: "Crops & Crop Cycles", href: "/farmer/crop-cycles", icon: Sprout },
    { label: "Observations", href: "/farmer/observations", icon: BookOpen },
    { label: "Crop Advice", href: "/farmer/crops", icon: Leaf },
    { label: "Weather", href: "/farmer/weather", icon: CloudSun },
    { label: "Market Prices", href: "/farmer/market", icon: ShoppingBasket },
  ];

  $effect(() => {
    const farmerId = auth.user?.farmerId;
    if (auth.isInitialized && farmerId && farmerId !== loadedFarmerId) {
      loadedFarmerId = farmerId;
      loadData(farmerId);
    } else if (auth.isInitialized && !farmerId) {
      isLoading = false;
      errorMessage = "Your account is not linked to a farmer profile. Please contact the AgriMama team.";
    }
  });

  async function loadData(farmerId) {
    isLoading = true;
    errorMessage = "";
    try {
      const [farmResponse, observationResponse] = await Promise.all([
        api.get(`/farmers/${encodeURIComponent(farmerId)}/farms`),
        api.get("/observations/me"),
      ]);
      farms = Array.isArray(farmResponse?.farms) ? farmResponse.farms : [];
      observations = Array.isArray(observationResponse?.observations) ? observationResponse.observations : [];
      if (!farms.some((farm) => farm.id === selectedFarmId)) selectedFarmId = farms[0]?.id || "";
      await loadCycles(selectedFarmId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Could not load your observations.";
    } finally {
      isLoading = false;
    }
  }

  async function loadCycles(farmId) {
    selectedCropCycleId = "";
    cropCycles = [];
    if (!farmId) return;
    try {
      const response = await api.get(`/farms/${encodeURIComponent(farmId)}/crop-cycles`);
      cropCycles = Array.isArray(response?.cropCycles) ? response.cropCycles : [];
      selectedCropCycleId = cropCycles.find((cycle) => cycle.status === "active")?.id || cropCycles[0]?.id || "";
    } catch (error) {
      formError = error instanceof Error ? error.message : "Could not load crop cycles for this farm.";
    }
  }

  async function handleFarmChange(event) {
    selectedFarmId = event.currentTarget.value;
    formError = "";
    await loadCycles(selectedFarmId);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    formError = "";
    successMessage = "";
    if (!selectedFarmId) { formError = "Please select a farm."; return; }
    if (!selectedCropCycleId) { formError = "Please select a crop cycle."; return; }
    if (!message.trim()) { formError = "Please describe what you have observed."; return; }

    isSaving = true;
    try {
      const response = await api.post("/observations", {
        farmId: selectedFarmId,
        cropCycleId: selectedCropCycleId,
        message: message.trim(),
        ...(language ? { language } : {}),
      });
      successMessage = response?.status === "awaiting_clarification"
        ? "Your observation was received. AgriMama needs a little more information; check the observation details below."
        : "Your observation was submitted and advice has been generated.";
      message = "";
      showForm = false;
      await loadData(auth.user?.farmerId);
    } catch (error) {
      formError = error instanceof Error ? error.message : "Could not submit your observation.";
    } finally {
      isSaving = false;
    }
  }

  async function handleLogout() {
    try { await auth.logout(); } finally { window.location.href = "/login"; }
  }

  function formatDate(value) {
    if (!value) return "Date not available";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date not available" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function titleCase(value) {
    return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
</script>

<svelte:head>
  <title>Observations | AgriMama</title>
  <meta name="description" content="Report crop observations and review previous reports." />
</svelte:head>

<div class="farmer-app">
  <aside class:open={mobileMenuOpen} class="sidebar">
    <div class="brand"><div class="brand-icon"><Sprout size={25} /></div><div><h1>AgriMama</h1><span>Farmer Portal</span></div><button class="close-menu" onclick={() => (mobileMenuOpen = false)} aria-label="Close menu"><X size={20} /></button></div>
    <div class="nav-label">MENU</div>
    <nav>{#each navigation as item}<a href={item.href} class:active={item.label === "Observations"} onclick={() => (mobileMenuOpen = false)}><item.icon size={19} /><span>{item.label}</span>{#if item.label === "AI Assistant"}<span class="new-tag">AI</span>{/if}</a>{/each}</nav>
    <div class="sidebar-bottom"><div class="help-card"><MessageCircle size={20} /><strong>Need help?</strong><p>We're here to support your farming journey.</p><a href="/farmer/assistant">Get assistance <ChevronRight size={14} /></a></div><button class="profile" onclick={handleLogout}><div class="avatar">{auth.user?.name?.charAt(0)?.toUpperCase() || "F"}</div><div class="profile-info"><strong>{auth.user?.name || "Farmer"}</strong><span>Farmer account</span></div><span class="logout-label">Logout</span></button></div>
  </aside>
  {#if mobileMenuOpen}<button class="mobile-overlay" aria-label="Close navigation" onclick={() => (mobileMenuOpen = false)}></button>{/if}
  <main class="main-content">
    <header class="topbar"><button class="menu-button" onclick={() => (mobileMenuOpen = true)} aria-label="Open navigation"><Menu size={23} /></button><div class="breadcrumb"><a href="/farmer">Farmer Portal</a><span>/</span><strong>Observations</strong></div><div class="topbar-actions"><button class="notification-button" aria-label="Notifications"><Bell size={20} /></button><div class="topbar-user"><div class="avatar small">{auth.user?.name?.charAt(0)?.toUpperCase() || "F"}</div><span>{auth.user?.name || "Farmer"}</span></div></div></header>
    <div class="page-content">
      <div class="page-intro"><div><a class="back-link" href="/farmer"><ArrowLeft size={15} /> Back to overview</a><p class="eyebrow">FARM MONITORING</p><h2>Observations</h2><p class="intro-copy">Record what is happening on your crops and review previous reports.</p></div><button class="primary-button" onclick={() => { showForm = !showForm; formError = ""; }}>{#if showForm}<X size={17} /> Cancel{:else}<Plus size={18} /> Report observation{/if}</button></div>
      <section class="summary-row">
        <div class="summary-card"><div class="summary-icon"><ClipboardList size={22} /></div><div><span>TOTAL OBSERVATIONS</span><strong>{observations.length}</strong><small>Reports submitted</small></div></div>
        <div class="summary-card"><div class="summary-icon"><CheckCircle2 size={22} /></div><div><span>WITH ADVICE</span><strong>{observations.filter((item) => item.recommendations?.length).length}</strong><small>Recommendations available</small></div></div>
        <div class="summary-card"><div class="summary-icon"><CircleHelp size={22} /></div><div><span>FOLLOW-UP</span><strong>{observations.filter((item) => !item.recommendations?.length).length}</strong><small>May need more information</small></div></div>
      </section>
      {#if successMessage}<div class="notice success"><CheckCircle2 size={17} />{successMessage}</div>{/if}
      {#if showForm}
        <section class="form-panel"><div class="panel-title"><div><h3>Report a crop observation</h3><p>Describe the issue in your own words. AgriMama will interpret it and suggest next steps.</p></div></div>
          <form onsubmit={handleSubmit}>
            <div class="form-grid">
              <label>Farm<select value={selectedFarmId} onchange={handleFarmChange} required><option value="" disabled>Select a farm</option>{#each farms as farm (farm.id)}<option value={farm.id}>{farm.name || "Unnamed farm"}</option>{/each}</select></label>
              <label>Crop cycle<select bind:value={selectedCropCycleId} required><option value="" disabled>Select a crop cycle</option>{#each cropCycles as cycle (cycle.id)}<option value={cycle.id}>{titleCase(cycle.crop)}{cycle.variety ? ` · ${cycle.variety}` : ""}</option>{/each}</select></label>
              <label>Language <span>(optional)</span><select bind:value={language}><option value="">Use your preferred language</option><option value="english">English</option><option value="swahili">Kiswahili</option><option value="dholuo">Dholuo</option></select></label>
            </div>
            <label class="message-label">What have you observed?<textarea bind:value={message} rows="5" maxlength="5000" placeholder="For example: The leaves on my maize plants are turning yellow and I have noticed small insects underneath..." required></textarea><small>{message.length}/5000 characters</small></label>
            {#if formError}<div class="notice error"><AlertCircle size={17} />{formError}</div>{/if}
            <div class="form-actions"><button type="button" class="secondary-button" onclick={() => { showForm = false; formError = ""; }}>Cancel</button><button type="submit" class="primary-button" disabled={isSaving || farms.length === 0 || cropCycles.length === 0}>{#if isSaving}<RefreshCw size={16} class="spin" /> Submitting...{:else}<Send size={16} /> Submit observation{/if}</button></div>
          </form>
        </section>
      {/if}
      <section class="history-section">
        <div class="section-heading"><div><h3>Observation history</h3><p>Your submitted crop reports and their latest advice.</p></div><button class="refresh-button" onclick={() => loadData(auth.user?.farmerId)} disabled={isLoading}><RefreshCw size={15} /> Refresh</button></div>
        {#if isLoading}<div class="state-panel"><RefreshCw size={24} class="spin" /><strong>Loading your observations...</strong><p>Please wait while we retrieve your reports.</p></div>
        {:else if errorMessage}<div class="state-panel error-state"><AlertCircle size={25} /><strong>We couldn't load your observations</strong><p>{errorMessage}</p><button class="secondary-button" onclick={() => loadData(auth.user?.farmerId)}>Try again</button></div>
        {:else if farms.length === 0}<div class="state-panel"><MapPinned size={26} /><strong>No farms registered</strong><p>Register a farm and crop cycle before reporting an observation.</p><a class="primary-button" href="/farmer/farms">Go to Farms <ChevronRight size={16} /></a></div>
        {:else if observations.length === 0}<div class="state-panel"><ClipboardList size={26} /><strong>No observations yet</strong><p>When you notice something on your crops, report it here to receive guidance.</p><button class="primary-button" onclick={() => (showForm = true)}><Plus size={16} /> Report your first observation</button></div>
        {:else}
          <div class="observation-list">{#each observations as item (item.id)}
            <article class="observation-card">
              <div class="observation-top"><div class="observation-symbol"><Leaf size={20} /></div><div class="observation-main"><h4>{titleCase(item.category || "Crop observation")}</h4><p>{item.farm?.name || "Farm"} · {item.cropCycle ? titleCase(item.cropCycle.crop) : "Crop not available"} · {formatDate(item.observedAt)}</p></div><span class:pending={!item.recommendations?.length} class="status-pill">{item.recommendations?.length ? "Advice available" : "Awaiting follow-up"}</span></div>
              <p class="observation-text">{item.observation}</p>
              {#if item.recommendations?.length}<div class="recommendation-preview"><strong>AgriMama advice</strong>{#each item.recommendations as recommendation}<p>{recommendation.recommendation}</p><small>Priority: {titleCase(recommendation.priority)}{recommendation.requiresHumanReview ? " · Human review required" : ""}</small>{/each}</div>{/if}
              <button class="text-button" onclick={() => (selectedObservation = selectedObservation?.id === item.id ? null : item)}>{selectedObservation?.id === item.id ? "Hide details" : "View details"} <ChevronRight size={14} /></button>
              {#if selectedObservation?.id === item.id}<div class="detail-panel"><p><strong>Observation:</strong> {item.observation}</p><p><strong>Source:</strong> {titleCase(item.source)}</p><p><strong>Language:</strong> {item.language || "Not specified"}</p>{#if item.recommendations?.length}{#each item.recommendations as recommendation}<p><strong>Reason:</strong> {recommendation.reason || "Not provided"}</p>{/each}{:else}<p>No recommendation is linked yet. This observation may be awaiting clarification or review.</p>{/if}</div>{/if}
            </article>
          {/each}</div>
        {/if}
      </section>
      <footer class="footer"><span>© {new Date().getFullYear()} AgriMama</span><span>Growing stronger farms together.</span></footer>
    </div>
  </main>
</div>

<style>

/* =========================================
   AGRIMAMA OBSERVATIONS PAGE
   ========================================= */

:global(*) {
  box-sizing: border-box;
}

:global(html),
:global(body) {
  margin: 0;
  min-height: 100%;
}

:global(body) {
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #34483a;
  background: #f7f9f6;
  font-size: 14px;
}

/* =========================================
   MAIN APPLICATION
   ========================================= */

.farmer-app {
  min-height: 100vh;
  background: #f7f9f6;
  color: #34483a;
  font-family: inherit;
}

.main-content {
  min-height: 100vh;
  margin-left: 255px;
}

/* =========================================
   SIDEBAR
   ========================================= */

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  width: 255px;
  padding: 25px 17px 16px;
  background: #fff;
  border-right: 1px solid #e9eee8;
  transition: transform 0.25s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 8px 28px;
}

.brand-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #e8f5e9;
  color: #28794b;
}

.brand h1 {
  margin: 0;
  color: #28583a;
  font-size: 19px;
  font-weight: 800;
}

.brand span {
  color: #96a198;
  font-size: 10px;
}

.close-menu {
  display: none;
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #526357;
  cursor: pointer;
}

.nav-label {
  padding: 0 12px 11px;
  color: #a0aaa2;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

nav {
  display: grid;
  gap: 5px;
}

nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  color: #718075;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

nav a:hover {
  background: #f4f8f3;
  color: #28794b;
}

nav a.active {
  background: #eaf4eb;
  color: #28794b;
  font-weight: 750;
}

.new-tag {
  margin-left: auto;
  padding: 3px 6px;
  border-radius: 5px;
  background: #eee9ff;
  color: #7958bb;
  font-size: 8px;
  font-weight: 800;
}

.sidebar-bottom {
  margin-top: auto;
}

.help-card {
  padding: 15px;
  border: 1px solid #e9eee8;
  border-radius: 11px;
  background: #fbfcfa;
}

.help-card strong {
  display: block;
  margin-top: 8px;
  font-size: 11px;
}

.help-card p {
  color: #89958c;
  font-size: 10px;
  line-height: 1.6;
}

.help-card a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #28794b;
  font-size: 10px;
  font-weight: 700;
  text-decoration: none;
}

/* =========================================
   FARMER PROFILE
   ========================================= */

.profile {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 15px 5px 0;
  margin-top: 15px;
  border: 0;
  border-top: 1px solid #edf0ec;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #e4f0e5;
  color: #28794b;
  font-size: 13px;
  font-weight: 800;
}

.profile-info {
  display: grid;
  min-width: 0;
}

.profile-info strong {
  overflow: hidden;
  color: #526357;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-info span {
  color: #9aa49c;
  font-size: 9px;
}

.logout-label {
  margin-left: auto;
  color: #89958c;
  font-size: 9px;
}

/* =========================================
   TOP BAR
   ========================================= */

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 38px;
  border-bottom: 1px solid #e9eee8;
  background: #fff;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a0aaa2;
  font-size: 11px;
}

.breadcrumb a {
  color: #849187;
  text-decoration: none;
}

.breadcrumb strong {
  color: #425647;
}

.topbar-actions,
.topbar-user {
  display: flex;
  align-items: center;
  gap: 17px;
}

.notification-button,
.menu-button {
  border: 0;
  background: transparent;
  color: #718075;
  cursor: pointer;
}

.topbar-user {
  gap: 9px;
  color: #647368;
  font-size: 10px;
}

.avatar.small {
  width: 32px;
  height: 32px;
  font-size: 11px;
}

.menu-button {
  display: none;
}

/* =========================================
   PAGE CONTENT
   ========================================= */

.page-content {
  width: 100%;
  max-width: 1450px;
  padding: 34px 38px;
  margin: 0 auto;
}

.page-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 19px;
  color: #7b8c7e;
  font-size: 11px;
  text-decoration: none;
}

.back-link:hover {
  color: #28794b;
}

.eyebrow {
  margin: 0 0 7px;
  color: #7c9a80;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.page-intro h2 {
  margin: 0;
  color: #294332;
  font-size: 27px;
  font-weight: 800;
}

.intro-copy {
  margin: 7px 0 0;
  color: #87948a;
  font-size: 12px;
  line-height: 1.6;
}

/* =========================================
   BUTTONS
   ========================================= */

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 15px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.primary-button {
  background: #28794b;
  color: #fff;
}

.primary-button:hover {
  background: #21653e;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  border-color: #e0e8df;
  background: #fff;
  color: #647368;
}

.secondary-button:hover {
  background: #f5f8f4;
  border-color: #cbdacb;
}

/* =========================================
   SUMMARY CARDS
   ========================================= */

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e7eee5;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(35, 70, 43, 0.025);
}

.summary-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 11px;
  background: #eaf4eb;
  color: #28794b;
}

.summary-card div:last-child {
  display: grid;
  gap: 4px;
}

.summary-card span {
  color: #91a095;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.summary-card strong {
  color: #294332;
  font-size: 24px;
  font-weight: 800;
}

.summary-card small {
  color: #98a39a;
  font-size: 10px;
}

/* =========================================
   NOTIFICATIONS
   ========================================= */

.notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  margin-top: 16px;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1.5;
}

.notice.success {
  background: #edf7ee;
  color: #28794b;
}

.notice.error {
  background: #fff0ed;
  color: #a94d42;
}

/* =========================================
   OBSERVATION FORM
   ========================================= */

.form-panel {
  padding: 24px;
  margin-top: 22px;
  border: 1px solid #e7eee5;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 3px 12px rgba(35, 70, 43, 0.035);
}

.panel-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.panel-title h3 {
  margin: 0;
  color: #34483a;
  font-size: 16px;
  font-weight: 750;
}

.panel-title p {
  margin: 6px 0 0;
  color: #909b92;
  font-size: 11px;
  line-height: 1.6;
}

/* Form fields */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.form-grid label,
.message-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  color: #53665a;
  font-size: 11px;
  font-weight: 700;
}

.form-grid label span {
  color: #9aa49c;
  font-weight: 400;
}

.form-grid input,
.form-grid select,
.message-label textarea {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid #e1e9df;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #425647;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-grid select {
  cursor: pointer;
}

.form-grid input:focus,
.form-grid select:focus,
.message-label textarea:focus {
  border-color: #70a77e;
  box-shadow: 0 0 0 3px rgba(40, 121, 75, 0.08);
}

.message-label {
  margin-top: 20px;
}

.message-label textarea {
  min-height: 125px;
  resize: vertical;
  line-height: 1.7;
}

.message-label textarea::placeholder {
  color: #a5afa7;
}

.message-label small {
  color: #9aa49c;
  font-size: 10px;
  font-weight: 400;
  text-align: right;
}

/* Form actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* =========================================
   OBSERVATION HISTORY
   ========================================= */

.history-section {
  padding: 23px;
  margin-top: 25px;
  border: 1px solid #e7eee5;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(35, 70, 43, 0.025);
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.section-heading h3 {
  margin: 0;
  color: #34483a;
  font-size: 16px;
  font-weight: 750;
}

.section-heading p {
  margin: 5px 0 0;
  color: #98a39a;
  font-size: 11px;
}

/* Refresh button */
.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid #e4ebe2;
  border-radius: 7px;
  background: #fff;
  color: #748477;
  font-family: inherit;
  font-size: 10px;
  cursor: pointer;
}

.refresh-button:hover {
  background: #f5f8f4;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: wait;
}

/* Observation list */
.observation-list {
  display: grid;
  gap: 15px;
}

.observation-card {
  min-width: 0;
  padding: 19px;
  border: 1px solid #e8eee6;
  border-radius: 11px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.observation-card:hover {
  border-color: #d4e3d3;
  box-shadow: 0 3px 10px rgba(35, 70, 43, 0.035);
}

/* Observation card heading */
.observation-top {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.observation-symbol {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 43px;
  height: 43px;
  border-radius: 11px;
  background: #edf6ee;
  color: #39875a;
}

.observation-main {
  flex: 1;
  min-width: 0;
}

.observation-main h4 {
  margin: 0;
  color: #34483a;
  font-size: 13px;
  font-weight: 750;
}

.observation-main p {
  margin: 5px 0 0;
  color: #929d94;
  font-size: 10px;
  line-height: 1.5;
}

/* Status badges */
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: 20px;
  background: #edf7ee;
  color: #438255;
  font-size: 9px;
  font-weight: 750;
  white-space: nowrap;
}

.status-pill.pending {
  background: #fff5e5;
  color: #9b762d;
}

/* Observation description */
.observation-text {
  margin: 17px 0;
  color: #647368;
  font-size: 12px;
  line-height: 1.8;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

/* =========================================
   AGRIMAMA RECOMMENDATION
   ========================================= */

.recommendation-preview {
  padding: 16px;
  margin-top: 13px;
  border: 1px solid #e4eee1;
  border-left: 3px solid #6da77b;
  border-radius: 9px;
  background: #f5f9f3;
}

.recommendation-preview strong {
  display: block;
  color: #39734b;
  font-size: 11px;
  font-weight: 800;
}

.recommendation-preview p {
  margin: 9px 0;
  color: #53665a;
  font-size: 11px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.recommendation-preview small {
  display: block;
  color: #89958c;
  font-size: 10px;
  line-height: 1.6;
}

/* View details button */
.text-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 0 2px;
  border: 0;
  background: transparent;
  color: #28794b;
  font-family: inherit;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
}

.text-button:hover {
  color: #185b34;
}

/* Expanded details */
.detail-panel {
  padding: 14px 16px;
  margin-top: 13px;
  border-left: 3px solid #8db596;
  border-radius: 0 8px 8px 0;
  background: #f8faf7;
}

.detail-panel p {
  margin: 7px 0;
  color: #68786c;
  font-size: 10px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.detail-panel strong {
  color: #425647;
}

/* =========================================
   LOADING, EMPTY AND ERROR STATES
   ========================================= */

.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  padding: 30px;
  border: 1px dashed #dfe8dd;
  border-radius: 12px;
  background: #fbfdfb;
  color: #7b9a80;
  text-align: center;
}

.state-panel strong {
  margin-top: 13px;
  color: #526357;
  font-size: 13px;
}

.state-panel p {
  max-width: 370px;
  margin: 8px 0 17px;
  color: #929d94;
  font-size: 11px;
  line-height: 1.7;
}

.error-state {
  color: #bd6258;
}

.error-state strong {
  color: #a94d42;
}

/* =========================================
   FOOTER
   ========================================= */

.footer {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 22px 0 8px;
  margin-top: 28px;
  border-top: 1px solid #e9eee8;
  color: #9aa49c;
  font-size: 10px;
}

/* =========================================
   MOBILE OVERLAY
   ========================================= */

.mobile-overlay {
  display: none;
}

/* Loading animation */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================
   TABLET RESPONSIVENESS
   ========================================= */

@media (max-width: 1050px) {
  .page-content {
    padding: 28px 25px;
  }

  .topbar {
    padding: 0 25px;
  }

  .summary-row {
    gap: 11px;
  }

  .summary-card {
    padding: 15px;
  }
}

/* =========================================
   MOBILE RESPONSIVENESS
   ========================================= */

@media (max-width: 760px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .close-menu {
    display: block;
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(20, 35, 25, 0.4);
  }

  .main-content {
    margin-left: 0;
  }

  .menu-button {
    display: block;
  }

  .topbar {
    height: 62px;
    padding: 0 17px;
  }

  .topbar-user span {
    display: none;
  }

  .topbar-actions {
    gap: 10px;
  }

  .page-content {
    padding: 24px 17px;
  }

  .page-intro {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-row {
    grid-template-columns: 1fr;
  }

  .summary-card {
    padding: 16px;
  }

  .form-panel,
  .history-section {
    padding: 18px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .observation-top {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .observation-main {
    flex-basis: calc(100% - 60px);
  }

  .status-pill {
    margin-left: 56px;
  }

  .form-actions {
    flex-wrap: wrap;
  }

  .footer {
    flex-direction: column;
    gap: 7px;
  }
}

/* =========================================
   SMALL MOBILE SCREENS
   ========================================= */

@media (max-width: 420px) {
  .page-content {
    padding: 20px 13px;
  }

  .topbar {
    padding: 0 13px;
  }

  .page-intro h2 {
    font-size: 23px;
  }

  .form-panel,
  .history-section {
    padding: 15px;
  }

  .observation-card {
    padding: 14px;
  }

  .observation-top {
    gap: 9px;
  }

  .observation-main h4 {
    font-size: 12px;
  }

  .status-pill {
    margin-left: 52px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>

<script>
  import {
    Sprout, Home, MessageCircle, Leaf, CloudSun, ShoppingBasket, BookOpen,
    MapPinned, Menu, X, Bell, ArrowLeft, Plus, RefreshCw,
    AlertCircle, CheckCircle2, ChevronRight, CalendarDays, Wheat
  } from "lucide-svelte";
  import { getAuthState } from "#lib/stores/auth.svelte.js";
  import { api } from "#lib/services/api.js";

  const auth = getAuthState();

  let mobileMenuOpen = $state(false);
  let farms = $state([]);
  let cropCycles = $state([]);
  let selectedFarmId = $state("");
  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMessage = $state("");
  let formError = $state("");
  let successMessage = $state("");
  let showForm = $state(false);
  let crop = $state("maize");
  let variety = $state("");
  let plantingDate = $state("");
  let currentStage = $state("");
  let status = $state("active");
  let loadedFarmerId = "";

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
      loadFarmData(farmerId);
    } else if (auth.isInitialized && !farmerId) {
      isLoading = false;
      errorMessage = "Your account is not linked to a farmer profile. Please contact the AgriMama team.";
    }
  });

  /** @param {string} farmerId */
  async function loadFarmData(farmerId) {
    isLoading = true;
    errorMessage = "";
    try {
      const farmResponse = await api.get(`/farmers/${encodeURIComponent(farmerId)}/farms`);
      farms = Array.isArray(farmResponse?.farms) ? farmResponse.farms : [];

      if (farms.length === 0) {
        selectedFarmId = "";
        cropCycles = [];
        return;
      }

      if (!farms.some((farm) => farm.id === selectedFarmId)) {
        selectedFarmId = farms[0].id;
      }

      await loadCropCyclesForFarm(selectedFarmId);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Could not load your farms and crop cycles.";
    } finally {
      isLoading = false;
    }
  }

  /** @param {string} farmId */
  async function loadCropCyclesForFarm(farmId) {
    if (!farmId) {
      cropCycles = [];
      return;
    }

    errorMessage = "";
    try {
      const response = await api.get(`/farms/${encodeURIComponent(farmId)}/crop-cycles`);
      cropCycles = Array.isArray(response?.cropCycles) ? response.cropCycles : [];
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Could not load crop cycles for this farm.";
      cropCycles = [];
    }
  }

  async function handleFarmChange(event) {
    selectedFarmId = event.currentTarget.value;
    await loadCropCyclesForFarm(selectedFarmId);
  }

  async function handleCreateCropCycle(event) {
    event.preventDefault();
    formError = "";
    successMessage = "";

    if (!selectedFarmId) {
      formError = "Select a farm before registering a crop cycle.";
      return;
    }
    if (!crop.trim()) {
      formError = "Enter or select a crop.";
      return;
    }
    if (!plantingDate) {
      formError = "Choose the planting date.";
      return;
    }

    isSaving = true;
    try {
      const response = await api.post("/crop-cycles", {
        farmId: selectedFarmId,
        crop: crop.trim(),
        variety: variety.trim() || undefined,
        plantingDate,
        currentStage: currentStage.trim() || undefined,
        status,
      });

      if (response?.cropCycle) {
        cropCycles = [response.cropCycle, ...cropCycles];
      } else {
        await loadCropCyclesForFarm(selectedFarmId);
      }

      successMessage = response?.message || "Crop cycle registered successfully.";
      variety = "";
      plantingDate = "";
      currentStage = "";
      status = "active";
      showForm = false;
    } catch (error) {
      formError = error instanceof Error ? error.message : "Could not register this crop cycle.";
    } finally {
      isSaving = false;
    }
  }

  async function handleLogout() {
    try {
      await auth.logout();
    } finally {
      window.location.href = "/login";
    }
  }

  function formatDate(value) {
    if (!value) return "Date not available";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? "Date not available"
      : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function titleCase(value) {
    return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
</script>

<svelte:head>
  <title>Crops & Crop Cycles | AgriMama</title>
  <meta name="description" content="Manage crops and crop cycles across your farms." />
</svelte:head>

<div class="farmer-app">
  <aside class:open={mobileMenuOpen} class="sidebar">
    <div class="brand">
      <div class="brand-icon"><Sprout size={25} /></div>
      <div><h1>AgriMama</h1><span>Farmer Portal</span></div>
      <button class="close-menu" onclick={() => (mobileMenuOpen = false)} aria-label="Close menu"><X size={20} /></button>
    </div>
    <div class="nav-label">MENU</div>
    <nav>
      {#each navigation as item}
        <a href={item.href} class:active={item.label === "Crops & Crop Cycles"} onclick={() => (mobileMenuOpen = false)}>
          <item.icon size={19} /><span>{item.label}</span>
          {#if item.label === "AI Assistant"}<span class="new-tag">AI</span>{/if}
        </a>
      {/each}
    </nav>
    <div class="sidebar-bottom">
      <div class="help-card">
        <div class="help-icon"><MessageCircle size={20} /></div>
        <strong>Need help?</strong>
        <p>We're here to support your farming journey.</p>
        <a href="/farmer/assistant">Get assistance <ChevronRight size={14} /></a>
      </div>
      <button class="profile" onclick={handleLogout}>
        <div class="avatar">{auth.user?.name?.charAt(0)?.toUpperCase() || "F"}</div>
        <div class="profile-info"><strong>{auth.user?.name || "Farmer"}</strong><span>Farmer account</span></div>
        <span class="logout-label">Logout</span>
      </button>
    </div>
  </aside>

  {#if mobileMenuOpen}
    <button class="mobile-overlay" aria-label="Close navigation" onclick={() => (mobileMenuOpen = false)}></button>
  {/if}

  <main class="main-content">
    <header class="topbar">
      <button class="menu-button" onclick={() => (mobileMenuOpen = true)} aria-label="Open navigation"><Menu size={23} /></button>
      <div class="breadcrumb"><a href="/farmer">Farmer Portal</a><span>/</span><strong>Crops & Crop Cycles</strong></div>
      <div class="topbar-actions">
        <button class="notification-button" aria-label="Notifications"><Bell size={20} /></button>
        <div class="topbar-user"><div class="avatar small">{auth.user?.name?.charAt(0)?.toUpperCase() || "F"}</div><span>{auth.user?.name || "Farmer"}</span></div>
      </div>
    </header>

    <div class="page-content">
      <div class="page-intro">
        <div>
          <a class="back-link" href="/farmer"><ArrowLeft size={15} /> Back to overview</a>
          <p class="eyebrow">CROP MANAGEMENT</p>
          <h2>Crops & Crop Cycles</h2>
          <p class="intro-copy">Keep track of what you are growing on each of your farms.</p>
        </div>
        <button class="primary-button" onclick={() => { showForm = !showForm; formError = ""; }}>
          {#if showForm}<X size={17} /> Cancel{:else}<Plus size={18} /> Add crop cycle{/if}
        </button>
      </div>

      <section class="summary-row">
        <div class="summary-card">
          <div class="summary-icon"><MapPinned size={22} /></div>
          <div><span>YOUR FARMS</span><strong>{farms.length}</strong><small>Registered farms</small></div>
        </div>
        <div class="summary-card">
          <div class="summary-icon"><Sprout size={22} /></div>
          <div><span>CROP CYCLES</span><strong>{cropCycles.length}</strong><small>On selected farm</small></div>
        </div>
        <div class="summary-card">
          <div class="summary-icon"><Wheat size={22} /></div>
          <div><span>ACTIVE CYCLES</span><strong>{cropCycles.filter((cycle) => cycle.status === "active").length}</strong><small>Currently growing</small></div>
        </div>
      </section>

      {#if successMessage}
        <div class="notice success"><CheckCircle2 size={17} />{successMessage}</div>
      {/if}

      <section class="farm-selector-panel">
        <div>
          <h3>Select a farm</h3>
          <p>Crop cycles are organised separately for each farm.</p>
        </div>
        {#if farms.length > 0}
          <select value={selectedFarmId} onchange={handleFarmChange} aria-label="Select a farm">
            {#each farms as farm (farm.id)}
              <option value={farm.id}>{farm.name || "Unnamed farm"}</option>
            {/each}
          </select>
        {/if}
      </section>

      {#if showForm}
        <section class="form-panel">
          <div class="panel-title"><div><h3>Register a crop cycle</h3><p>Enter the crop and planting details for the selected farm.</p></div></div>
          <form onsubmit={handleCreateCropCycle}>
            <div class="form-grid">
              <label>Farm
                <select bind:value={selectedFarmId} required>
                  <option value="" disabled>Select a farm</option>
                  {#each farms as farm (farm.id)}
                    <option value={farm.id}>{farm.name || "Unnamed farm"}</option>
                  {/each}
                </select>
              </label>
              <label>Crop
                <select bind:value={crop} required>
                  <option value="maize">Maize</option>
                  <option value="beans">Beans</option>
                  <option value="beans">Sweet Potatoes</option>
                  <option value="sorghum">Sorghum</option>
                  <option value="cassava">Cassava</option>
                  <option value="groundnuts">Groundnuts</option>
                  <option value="rice">Rice</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>Variety <span>(optional)</span><input bind:value={variety} maxlength="150" placeholder="e.g. H6213" /></label>
              <label>Planting date<input bind:value={plantingDate} type="date" required /></label>
              <label>Current growth stage <span>(optional)</span><input bind:value={currentStage} maxlength="100" placeholder="e.g. Germination, flowering" /></label>
              <label>Cycle status
                <select bind:value={status}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
            </div>
            {#if formError}<div class="notice error"><AlertCircle size={17} />{formError}</div>{/if}
            <div class="form-actions">
              <button type="button" class="secondary-button" onclick={() => { showForm = false; formError = ""; }}>Cancel</button>
              <button type="submit" class="primary-button" disabled={isSaving || farms.length === 0}>
                {#if isSaving}<RefreshCw size={16} class="spin" /> Saving...{:else}<Plus size={17} /> Save crop cycle{/if}
              </button>
            </div>
          </form>
        </section>
      {/if}

      <section class="cycles-section">
        <div class="section-heading">
          <div><h3>Crop cycles</h3><p>{farms.find((farm) => farm.id === selectedFarmId)?.name || "Selected farm"} · {cropCycles.length} {cropCycles.length === 1 ? "cycle" : "cycles"}</p></div>
          <button class="refresh-button" onclick={() => loadFarmData(auth.user?.farmerId)} disabled={isLoading}><RefreshCw size={15} /> Refresh</button>
        </div>

        {#if isLoading}
          <div class="state-panel"><RefreshCw size={24} class="spin" /><strong>Loading your crop cycles...</strong><p>Please wait while we retrieve your farm records.</p></div>
        {:else if errorMessage}
          <div class="state-panel error-state"><AlertCircle size={25} /><strong>We couldn't load your crop cycles</strong><p>{errorMessage}</p><button class="secondary-button" onclick={() => loadFarmData(auth.user?.farmerId)}>Try again</button></div>
        {:else if farms.length === 0}
          <div class="state-panel empty-state"><div class="empty-icon"><MapPinned size={28} /></div><strong>No farms registered yet</strong><p>Register a farm before adding crop cycles.</p><a class="primary-button" href="/farmer/farms">Go to Farms <ChevronRight size={16} /></a></div>
        {:else if cropCycles.length === 0}
          <div class="state-panel empty-state"><div class="empty-icon"><Sprout size={28} /></div><strong>No crop cycles on this farm yet</strong><p>Add the crops you are growing here. You can manage separate crop cycles for each farm.</p><button class="primary-button" onclick={() => (showForm = true)}><Plus size={17} /> Add first crop cycle</button></div>
        {:else}
          <div class="cycles-grid">
            {#each cropCycles as cycle (cycle.id)}
              <article class="cycle-card">
                <div class="cycle-card-top">
                  <div class="crop-icon"><Sprout size={22} /></div>
                  <span class:completed={cycle.status === "completed"} class="status-pill">{titleCase(cycle.status)}</span>
                </div>
                <h4>{titleCase(cycle.crop)}</h4>
                <p class="variety">{cycle.variety || "Variety not specified"}</p>
                <div class="cycle-detail"><CalendarDays size={16} /><span>Planted {formatDate(cycle.plantingDate)}</span></div>
                <div class="cycle-detail"><Leaf size={16} /><span>{cycle.currentStage ? titleCase(cycle.currentStage) : "Growth stage not recorded"}</span></div>
                <div class="cycle-card-footer"><span>{farms.find((farm) => farm.id === cycle.farmId)?.name || "Selected farm"}</span><span>Crop cycle</span></div>
              </article>
            {/each}
          </div>
        {/if}
      </section>
      <footer class="footer"><span>© {new Date().getFullYear()} AgriMama</span><span>Growing stronger farms together.</span></footer>
    </div>
  </main>
</div>

<style>
  :global(*) { box-sizing: border-box; }
  .farmer-app { min-height: 100vh; background: #f7f9f6; color: #34483a; font-family: inherit; }
  .sidebar { position: fixed; inset: 0 auto 0 0; z-index: 30; display: flex; flex-direction: column; width: 255px; padding: 25px 17px 16px; background: #fff; border-right: 1px solid #e9eee8; }
  .brand { display: flex; align-items: center; gap: 11px; padding: 0 8px 28px; }.brand-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: #e8f5e9; color: #28794b; }.brand h1 { margin: 0; color: #28583a; font-size: 19px; font-weight: 800; }.brand span { color: #96a198; font-size: 10px; }.close-menu { display: none; margin-left: auto; border: 0; background: transparent; color: #526357; }
  .nav-label { padding: 0 12px 11px; color: #a0aaa2; font-size: 9px; font-weight: 800; letter-spacing: 1.2px; } nav { display: grid; gap: 5px; } nav a { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: #718075; font-size: 12px; font-weight: 600; text-decoration: none; } nav a:hover { background: #f4f8f3; color: #28794b; } nav a.active { background: #eaf4eb; color: #28794b; font-weight: 750; }.new-tag { margin-left: auto; padding: 3px 6px; border-radius: 5px; background: #eee9ff; color: #7958bb; font-size: 8px; font-weight: 800; }
  .sidebar-bottom { margin-top: auto; }.help-card { padding: 15px; border: 1px solid #e9eee8; border-radius: 11px; background: #fbfcfa; }.help-icon { color: #39875a; }.help-card strong { display: block; margin-top: 8px; font-size: 11px; }.help-card p { color: #89958c; font-size: 10px; line-height: 1.6; }.help-card a { display: inline-flex; align-items: center; gap: 4px; color: #28794b; font-size: 10px; font-weight: 700; text-decoration: none; }
  .profile { display: flex; align-items: center; gap: 9px; width: 100%; padding: 15px 5px 0; margin-top: 15px; border: 0; border-top: 1px solid #edf0ec; background: transparent; text-align: left; cursor: pointer; }.avatar { display: grid; place-items: center; flex: 0 0 auto; width: 35px; height: 35px; border-radius: 50%; background: #e4f0e5; color: #28794b; font-size: 13px; font-weight: 800; }.profile-info { display: grid; min-width: 0; }.profile-info strong { overflow: hidden; color: #526357; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }.profile-info span { color: #9aa49c; font-size: 9px; }.logout-label { margin-left: auto; color: #89958c; font-size: 9px; }
  .main-content { min-height: 100vh; margin-left: 255px; }.topbar { display: flex; align-items: center; justify-content: space-between; height: 70px; padding: 0 38px; border-bottom: 1px solid #e9eee8; background: #fff; }.breadcrumb { display: flex; align-items: center; gap: 10px; color: #a0aaa2; font-size: 11px; }.breadcrumb a { color: #849187; text-decoration: none; }.breadcrumb strong { color: #425647; }.topbar-actions,.topbar-user { display: flex; align-items: center; gap: 17px; }.notification-button,.menu-button { border: 0; background: transparent; color: #718075; }.topbar-user { gap: 9px; color: #647368; font-size: 10px; }.avatar.small { width: 32px; height: 32px; font-size: 11px; }.menu-button { display: none; }
  .page-content { max-width: 1450px; padding: 34px 38px; margin: 0 auto; }.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; }.back-link { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 19px; color: #7b8c7e; font-size: 10px; text-decoration: none; }.eyebrow { margin: 0 0 7px; color: #7c9a80; font-size: 9px; font-weight: 800; letter-spacing: 1.1px; }.page-intro h2 { margin: 0; color: #294332; font-size: 27px; font-weight: 800; }.intro-copy { margin: 7px 0 0; color: #87948a; font-size: 12px; }
  .primary-button,.secondary-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; padding: 0 14px; border: 1px solid transparent; border-radius: 8px; font-size: 11px; font-weight: 750; cursor: pointer; text-decoration: none; }.primary-button { background: #28794b; color: white; }.primary-button:hover { background: #21653e; }.primary-button:disabled { opacity: .6; cursor: wait; }.secondary-button { border-color: #e0e8df; background: #fff; color: #647368; }
  .summary-row { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }.summary-card { display: flex; align-items: center; gap: 13px; padding: 16px; border: 1px solid #e7eee5; border-radius: 12px; background: #fff; }.summary-icon { display: grid; place-items: center; flex: 0 0 auto; width: 42px; height: 42px; border-radius: 11px; background: #eaf4eb; color: #28794b; }.summary-card div:last-child { display: grid; gap: 2px; }.summary-card span { color: #91a095; font-size: 8px; font-weight: 800; letter-spacing: .8px; }.summary-card strong { color: #294332; font-size: 23px; }.summary-card small { color: #98a39a; font-size: 9px; }
  .notice { display: flex; align-items: center; gap: 9px; padding: 11px 13px; margin-top: 16px; border-radius: 8px; font-size: 11px; }.notice.success { background: #edf7ee; color: #28794b; }.notice.error { background: #fff1ef; color: #b54b3f; }
  .farm-selector-panel,.form-panel,.cycle-card { border: 1px solid #e8eee6; border-radius: 12px; background: #fff; }.farm-selector-panel { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 17px 20px; margin-top: 22px; }.farm-selector-panel h3,.panel-title h3,.section-heading h3 { margin: 0; color: #34483a; font-size: 14px; font-weight: 750; }.farm-selector-panel p,.panel-title p,.section-heading p { margin: 5px 0 0; color: #909b92; font-size: 10px; }.farm-selector-panel select,.form-grid select,.form-grid input { min-height: 40px; padding: 0 11px; border: 1px solid #e2e9e0; border-radius: 7px; background: #fff; color: #425647; font: inherit; font-size: 11px; }.farm-selector-panel select { width: min(100%, 280px); }
  .form-panel { padding: 21px; margin-top: 18px; }.form-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 15px; margin-top: 20px; }.form-grid label { display: grid; gap: 7px; color: #586a5d; font-size: 10px; font-weight: 700; }.form-grid label span { color: #a0aaa2; font-weight: 400; }.form-grid input,.form-grid select { width: 100%; }.form-grid input:focus,.form-grid select:focus { outline: 1px solid #69a77a; border-color: #69a77a; }.form-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 19px; }
  .cycles-section { margin-top: 30px; }.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 15px; }.refresh-button { display: inline-flex; align-items: center; gap: 6px; padding: 7px 9px; border: 1px solid #e5ece3; border-radius: 7px; background: #fff; color: #718075; font-size: 9px; cursor: pointer; }.refresh-button:disabled { opacity: .5; }.cycles-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 15px; }.cycle-card { padding: 18px; }.cycle-card-top { display: flex; align-items: center; justify-content: space-between; }.crop-icon,.empty-icon { display: grid; place-items: center; width: 43px; height: 43px; border-radius: 10px; background: #edf6ee; color: #39875a; }.status-pill { padding: 5px 9px; border-radius: 20px; background: #edf7ee; color: #438255; font-size: 8px; font-weight: 750; }.status-pill.completed { background: #eef0f2; color: #66736a; }.cycle-card h4 { margin: 15px 0 3px; color: #34483a; font-size: 15px; }.variety { margin: 0 0 13px; color: #98a39a; font-size: 10px; }.cycle-detail { display: flex; align-items: center; gap: 8px; margin-top: 9px; color: #7e8d81; font-size: 10px; }.cycle-detail :global(svg) { color: #8da18f; }.cycle-card-footer { display: flex; justify-content: space-between; gap: 10px; padding-top: 13px; margin-top: 15px; border-top: 1px solid #edf1eb; color: #a0aaa2; font-size: 9px; }
  .state-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 230px; padding: 28px; border: 1px dashed #dfe8dd; border-radius: 12px; background: #fff; color: #7b9a80; text-align: center; }.state-panel strong { margin-top: 12px; color: #526357; font-size: 12px; }.state-panel p { max-width: 350px; margin: 7px 0 15px; color: #929d94; font-size: 10px; line-height: 1.7; }.empty-icon { width: 55px; height: 55px; border-radius: 50%; }.error-state { color: #bd6258; }.footer { display: flex; justify-content: space-between; gap: 15px; padding: 22px 0 8px; margin-top: 25px; border-top: 1px solid #e9eee8; color: #9aa49c; font-size: 9px; }
  .mobile-overlay { display: none; }.spin { animation: spin 1s linear infinite; }@keyframes spin { to { transform: rotate(360deg); } }
  @media(max-width:1050px) { .page-content { padding: 28px 25px; }.topbar { padding: 0 25px; } }
  @media(max-width:900px) { .summary-row { grid-template-columns: 1fr 1fr; }.summary-card:last-child { grid-column: 1 / -1; } }
  @media(max-width:760px) { .sidebar { transform: translateX(-100%); transition: transform .25s ease; }.sidebar.open { transform: translateX(0); }.close-menu { display: block; }.mobile-overlay { position: fixed; inset: 0; z-index: 20; display: block; border: 0; background: #14231966; }.main-content { margin-left: 0; }.menu-button { display: block; }.topbar { height: 62px; padding: 0 17px; }.topbar-user span { display: none; }.page-content { padding: 24px 17px; }.page-intro { align-items: flex-start; flex-direction: column; }.cycles-grid { grid-template-columns: 1fr; }.farm-selector-panel { align-items: flex-start; flex-direction: column; }.farm-selector-panel select { width: 100%; } }
  @media(max-width:480px) { .form-grid,.summary-row { grid-template-columns: 1fr; }.summary-card:last-child { grid-column: auto; }.footer { flex-direction: column; } }
</style>

<script>
  import { onMount } from "svelte";
  import {
    Sprout, Home, MessageCircle, Leaf, CloudSun, ShoppingBasket,
    MapPin, Menu, X, Bell, ArrowLeft, Plus, Ruler, MapPinned,
    RefreshCw, AlertCircle, CheckCircle2, ChevronRight, MessageSquare, BookOpen
  } from "lucide-svelte";
  import { getAuthState } from "#lib/stores/auth.svelte.js";
  import { api } from "#lib/services/api.js";

  const auth = getAuthState();
  let mobileMenuOpen = $state(false);
  let farms = $state([]);
  let isLoading = $state(true);
  let isSaving = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");
  let showForm = $state(false);
  let formError = $state("");
  let name = $state("");
  let sizeAcres = $state("");
  let latitude = $state("");
  let longitude = $state("");
  let loadedFarmerId = "";

  const navigation = [
    { label: "Overview", href: "/farmer", icon: Home },
    { label: "AI Assistant", href: "/farmer/assistant", icon: MessageCircle },
    { label: "Farms", href: "/farmer/farms", icon: MapPinned },
    { label: "Crops & Crop Cycles", href: "/farmer/crop-cycles", icon: Sprout },
    { label: "Crop Advice", href: "/farmer/crops", icon: Leaf },
    { label: "Observations", href: "/farmer/observations", icon: BookOpen },
    { label: "Conversations", href: "/farmer/conversations", icon: MessageSquare },
    { label: "Weather", href: "/farmer/weather", icon: CloudSun },
    { label: "Market Prices", href: "/farmer/market", icon: ShoppingBasket },
  ];

  $effect(() => {
    const farmerId = auth.user?.farmerId;
    if (auth.isInitialized && farmerId && farmerId !== loadedFarmerId) {
      loadedFarmerId = farmerId;
      loadFarms(farmerId);
    } else if (auth.isInitialized && !farmerId) {
      isLoading = false;
      errorMessage = "Your account is not linked to a farmer profile. Please contact the AgriMama team.";
    }
  });

  /** @param {string} farmerId */
  async function loadFarms(farmerId) {
    isLoading = true;
    errorMessage = "";
    try {
      const response = await api.get(`/farmers/${encodeURIComponent(farmerId)}/farms`);
      farms = Array.isArray(response?.farms) ? response.farms : [];
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Could not load your farms.";
    } finally {
      isLoading = false;
    }
  }

  async function handleCreateFarm(event) {
    event.preventDefault();
    formError = "";
    successMessage = "";

    const farmerId = auth.user?.farmerId;
    if (!farmerId) {
      formError = "Your account is not linked to a farmer profile.";
      return;
    }
    if (sizeAcres && (!Number.isFinite(Number(sizeAcres)) || Number(sizeAcres) <= 0)) {
      formError = "Enter a valid farm size greater than zero.";
      return;
    }
    if (latitude && (!Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90)) {
      formError = "Latitude must be between -90 and 90.";
      return;
    }
    if (longitude && (!Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180)) {
      formError = "Longitude must be between -180 and 180.";
      return;
    }

    const body = {
      farmerId,
      name: name.trim() || undefined,
      sizeAcres: sizeAcres ? Number(sizeAcres) : undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    };

    isSaving = true;
    try {
      const response = await api.post("/farms", body);
      if (response?.farm) farms = [response.farm, ...farms];
      successMessage = response?.message || "Farm registered successfully.";
      name = "";
      sizeAcres = "";
      latitude = "";
      longitude = "";
      showForm = false;
    } catch (error) {
      formError = error instanceof Error ? error.message : "Could not register the farm.";
    } finally {
      isSaving = false;
    }
  }

  /** @param {string | number | null | undefined} value */
  function formatCoordinate(value) {
    if (value === null || value === undefined || value === "") return "Not added";
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(5) : "Not added";
  }

  async function handleLogout() {
    try { await auth.logout(); }
    finally { window.location.href = "/login"; }
  }
</script>

<svelte:head>
  <title>Farms | AgriMama</title>
  <meta name="description" content="View and manage your registered farms in AgriMama." />
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
        <a href={item.href} class:active={item.label === "Farms"} onclick={() => (mobileMenuOpen = false)}>
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
      <div class="breadcrumb"><a href="/farmer">Farmer Portal</a><span>/</span><strong>Farms</strong></div>
      <div class="topbar-actions">
        <button class="notification-button" aria-label="Notifications"><Bell size={20} /></button>
        <div class="topbar-user"><div class="avatar small">{auth.user?.name?.charAt(0)?.toUpperCase() || "F"}</div><span>{auth.user?.name || "Farmer"}</span></div>
      </div>
    </header>

    <div class="page-content">
      <div class="page-intro">
        <div>
          <a class="back-link" href="/farmer"><ArrowLeft size={15} /> Back to overview</a>
          <p class="eyebrow">YOUR FARMING LAND</p>
          <h2>Farms</h2>
          <p class="intro-copy">View and manage the farms registered to your AgriMama account.</p>
        </div>
        <button class="primary-button" onclick={() => { showForm = !showForm; formError = ""; }}>
          {#if showForm}<X size={17} /> Cancel{:else}<Plus size={18} /> Add a farm{/if}
        </button>
      </div>

      <section class="summary-card">
        <div class="summary-icon"><MapPinned size={22} /></div>
        <div><span>REGISTERED FARMS</span><strong>{farms.length}</strong><small>{farms.length === 1 ? "farm in your account" : "farms in your account"}</small></div>
      </section>

      {#if successMessage}
        <div class="notice success"><CheckCircle2 size={17} />{successMessage}</div>
      {/if}

      {#if showForm}
        <section class="form-panel">
          <div class="panel-title"><div><h3>Register a farm</h3><p>Add the details of another farm you manage.</p></div></div>
          <form onsubmit={handleCreateFarm}>
            <div class="form-grid">
              <label>Farm name <span>(optional)</span><input bind:value={name} maxlength="150" placeholder="e.g. Green Valley Farm" /></label>
              <label>Farm size (acres) <span>(optional)</span><input bind:value={sizeAcres} type="number" min="0.01" step="0.01" placeholder="e.g. 2.5" /></label>
              <label>Latitude <span>(optional)</span><input bind:value={latitude} type="number" min="-90" max="90" step="any" placeholder="e.g. -0.0917" /></label>
              <label>Longitude <span>(optional)</span><input bind:value={longitude} type="number" min="-180" max="180" step="any" placeholder="e.g. 34.7680" /></label>
            </div>
            {#if formError}<div class="notice error"><AlertCircle size={17} />{formError}</div>{/if}
            <div class="form-actions"><button type="button" class="secondary-button" onclick={() => (showForm = false)}>Cancel</button><button type="submit" class="primary-button" disabled={isSaving}>{#if isSaving}<RefreshCw size={16} class="spin" /> Saving...{:else}<Plus size={17} /> Save farm{/if}</button></div>
          </form>
        </section>
      {/if}

      <section class="farms-section">
        <div class="section-heading"><div><h3>Your registered farms</h3><p>Each farm can have its own crops and crop cycles.</p></div><button class="refresh-button" onclick={() => auth.user?.farmerId && loadFarms(auth.user.farmerId)} disabled={isLoading}><RefreshCw size={15} /> Refresh</button></div>

        {#if isLoading}
          <div class="state-panel"><RefreshCw size={24} class="spin" /><strong>Loading your farms...</strong><p>Please wait while we retrieve your farm records.</p></div>
        {:else if errorMessage}
          <div class="state-panel error-state"><AlertCircle size={25} /><strong>We couldn't load your farms</strong><p>{errorMessage}</p><button class="secondary-button" onclick={() => auth.user?.farmerId && loadFarms(auth.user.farmerId)}>Try again</button></div>
        {:else if farms.length === 0}
          <div class="state-panel empty-state"><div class="empty-icon"><Sprout size={28} /></div><strong>No farms registered yet</strong><p>Register your first farm to start organising its crops, crop cycles and farming advice.</p><button class="primary-button" onclick={() => (showForm = true)}><Plus size={17} /> Register your first farm</button></div>
        {:else}
          <div class="farms-grid">
            {#each farms as farm (farm.id)}
              <article class="farm-card">
                <div class="farm-card-top"><div class="farm-icon"><Sprout size={22} /></div><span class="farm-status">Registered</span></div>
                <h4>{farm.name || "Unnamed farm"}</h4>
                <div class="farm-detail"><Ruler size={16} /><span>{farm.sizeAcres ? `${Number(farm.sizeAcres).toLocaleString()} acres` : "Farm size not added"}</span></div>
                <div class="farm-detail"><MapPin size={16} /><span>{farm.latitude != null && farm.longitude != null ? `${formatCoordinate(farm.latitude)}, ${formatCoordinate(farm.longitude)}` : "Location coordinates not added"}</span></div>
                <div class="farm-card-footer"><span>Added {farm.createdAt ? new Date(farm.createdAt).toLocaleDateString() : "Date unavailable"}</span><span>Manage crop cycles</span></div>
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
  .brand { display: flex; align-items: center; gap: 11px; padding: 0 8px 28px; }
  .brand-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: #e8f5e9; color: #28794b; }
  .brand h1 { margin: 0; color: #28583a; font-size: 19px; font-weight: 800; }.brand span { color: #96a198; font-size: 10px; }
  .close-menu { display: none; margin-left: auto; border: 0; background: transparent; color: #526357; }
  .nav-label { padding: 0 12px 11px; color: #a0aaa2; font-size: 9px; font-weight: 800; letter-spacing: 1.2px; }
  nav { display: grid; gap: 5px; } nav a { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: #718075; font-size: 12px; font-weight: 600; text-decoration: none; } nav a:hover { background: #f4f8f3; color: #28794b; } nav a.active { background: #eaf4eb; color: #28794b; font-weight: 750; }
  .new-tag { margin-left: auto; padding: 3px 6px; border-radius: 5px; background: #eee9ff; color: #7958bb; font-size: 8px; font-weight: 800; }
  .sidebar-bottom { margin-top: auto; }.help-card { padding: 15px; border: 1px solid #e9eee8; border-radius: 11px; background: #fbfcfa; }.help-icon { color: #39875a; }.help-card strong { display: block; margin-top: 8px; font-size: 11px; }.help-card p { color: #89958c; font-size: 10px; line-height: 1.6; }.help-card a { display: inline-flex; align-items: center; gap: 4px; color: #28794b; font-size: 10px; font-weight: 700; text-decoration: none; }
  .profile { display: flex; align-items: center; gap: 9px; width: 100%; padding: 15px 5px 0; margin-top: 15px; border: 0; border-top: 1px solid #edf0ec; background: transparent; text-align: left; cursor: pointer; }.avatar { display: grid; place-items: center; flex: 0 0 auto; width: 35px; height: 35px; border-radius: 50%; background: #e4f0e5; color: #28794b; font-size: 13px; font-weight: 800; }.profile-info { display: grid; min-width: 0; }.profile-info strong { overflow: hidden; color: #526357; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }.profile-info span { color: #9aa49c; font-size: 9px; }.logout-label { margin-left: auto; color: #89958c; font-size: 9px; }
  .main-content { min-height: 100vh; margin-left: 255px; }.topbar { display: flex; align-items: center; justify-content: space-between; height: 70px; padding: 0 38px; border-bottom: 1px solid #e9eee8; background: #fff; }.breadcrumb { display: flex; align-items: center; gap: 10px; color: #a0aaa2; font-size: 11px; }.breadcrumb a { color: #849187; text-decoration: none; }.breadcrumb strong { color: #425647; }.topbar-actions,.topbar-user { display: flex; align-items: center; gap: 17px; }.notification-button,.menu-button { border: 0; background: transparent; color: #718075; }.topbar-user { gap: 9px; color: #647368; font-size: 10px; }.avatar.small { width: 32px; height: 32px; font-size: 11px; }.menu-button { display: none; }
  .page-content { max-width: 1450px; padding: 34px 38px; margin: 0 auto; }.page-intro { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; }.back-link { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 19px; color: #7b8c7e; font-size: 10px; text-decoration: none; }.eyebrow { margin: 0 0 7px; color: #7c9a80; font-size: 9px; font-weight: 800; letter-spacing: 1.1px; }.page-intro h2 { margin: 0; color: #294332; font-size: 27px; font-weight: 800; }.intro-copy { margin: 7px 0 0; color: #87948a; font-size: 12px; }
  .primary-button,.secondary-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; padding: 0 14px; border: 1px solid transparent; border-radius: 8px; font-size: 11px; font-weight: 750; cursor: pointer; }.primary-button { background: #28794b; color: white; }.primary-button:hover { background: #21653e; }.primary-button:disabled { opacity: .6; cursor: wait; }.secondary-button { border-color: #e0e8df; background: #fff; color: #647368; }
  .summary-card { display: flex; align-items: center; gap: 15px; width: min(100%, 310px); padding: 17px 20px; border: 1px solid #e7eee5; border-radius: 12px; background: #fff; }.summary-icon { display: grid; place-items: center; width: 43px; height: 43px; border-radius: 11px; background: #eaf4eb; color: #28794b; }.summary-card div:last-child { display: grid; gap: 2px; }.summary-card span { color: #91a095; font-size: 8px; font-weight: 800; letter-spacing: .8px; }.summary-card strong { color: #294332; font-size: 23px; }.summary-card small { color: #98a39a; font-size: 9px; }
  .notice { display: flex; align-items: center; gap: 9px; padding: 11px 13px; margin-top: 16px; border-radius: 8px; font-size: 11px; }.notice.success { background: #edf7ee; color: #28794b; }.notice.error { background: #fff1ef; color: #b54b3f; }
  .form-panel,.farm-card { border: 1px solid #e8eee6; border-radius: 12px; background: #fff; }.form-panel { padding: 21px; margin-top: 20px; }.panel-title h3,.section-heading h3 { margin: 0; color: #34483a; font-size: 15px; font-weight: 750; }.panel-title p,.section-heading p { margin: 5px 0 0; color: #909b92; font-size: 10px; }.form-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 15px; margin-top: 20px; }.form-grid label { display: grid; gap: 7px; color: #586a5d; font-size: 10px; font-weight: 700; }.form-grid label span { color: #a0aaa2; font-weight: 400; }.form-grid input { width: 100%; min-height: 40px; padding: 0 11px; border: 1px solid #e2e9e0; border-radius: 7px; outline: none; color: #425647; font: inherit; font-weight: 400; }.form-grid input:focus { border-color: #69a77a; }.form-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 19px; }
  .farms-section { margin-top: 30px; }.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 15px; }.refresh-button { display: inline-flex; align-items: center; gap: 6px; padding: 7px 9px; border: 1px solid #e5ece3; border-radius: 7px; background: #fff; color: #718075; font-size: 9px; cursor: pointer; }.refresh-button:disabled { opacity: .5; }.farms-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 15px; }.farm-card { padding: 18px; }.farm-card-top { display: flex; align-items: center; justify-content: space-between; }.farm-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 10px; background: #edf6ee; color: #39875a; }.farm-status { padding: 5px 8px; border-radius: 20px; background: #edf7ee; color: #438255; font-size: 8px; font-weight: 750; }.farm-card h4 { margin: 15px 0 12px; color: #34483a; font-size: 14px; }.farm-detail { display: flex; align-items: center; gap: 8px; margin-top: 9px; color: #7e8d81; font-size: 10px; }.farm-detail :global(svg) { color: #8da18f; }.farm-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 14px; margin-top: 16px; border-top: 1px solid #edf1eb; color: #a0aaa2; font-size: 9px; }.farm-card-footer a { display: inline-flex; align-items: center; gap: 3px; color: #28794b; font-size: 9px; font-weight: 750; text-decoration: none; }
  .state-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 230px; padding: 28px; border: 1px dashed #dfe8dd; border-radius: 12px; background: #fff; color: #7b9a80; text-align: center; }.state-panel strong { margin-top: 12px; color: #526357; font-size: 12px; }.state-panel p { max-width: 330px; margin: 7px 0 15px; color: #929d94; font-size: 10px; line-height: 1.7; }.empty-icon { display: grid; place-items: center; width: 55px; height: 55px; border-radius: 50%; background: #edf6ee; color: #39875a; }.error-state { color: #bd6258; }.footer { display: flex; justify-content: space-between; gap: 15px; padding: 22px 0 8px; margin-top: 25px; border-top: 1px solid #e9eee8; color: #9aa49c; font-size: 9px; }
  .mobile-overlay { display: none; }.spin { animation: spin 1s linear infinite; }@keyframes spin { to { transform: rotate(360deg); } }
  @media(max-width:1050px) { .page-content { padding: 28px 25px; }.topbar { padding: 0 25px; } }
  @media(max-width:760px) { .sidebar { transform: translateX(-100%); transition: transform .25s ease; }.sidebar.open { transform: translateX(0); }.close-menu { display: block; }.mobile-overlay { position: fixed; inset: 0; z-index: 20; display: block; border: 0; background: #14231966; }.main-content { margin-left: 0; }.menu-button { display: block; }.topbar { height: 62px; padding: 0 17px; }.topbar-user span { display: none; }.page-content { padding: 24px 17px; }.page-intro { align-items: flex-start; flex-direction: column; }.farms-grid { grid-template-columns: 1fr; } }
  @media(max-width:480px) { .form-grid { grid-template-columns: 1fr; }.footer { flex-direction: column; }.farm-card-footer { align-items: flex-start; flex-direction: column; } }
</style>

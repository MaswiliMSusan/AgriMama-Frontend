<script>
  import {
    Sprout, Leaf, MapPinned, Plus, RefreshCw, X,
    AlertCircle, CheckCircle2, ChevronRight, CalendarDays, Wheat
  } from "lucide-svelte";
  import { getAuthState } from "#lib/stores/auth.svelte.js";
  import { api } from "#lib/services/api.js";

  const auth = getAuthState();

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
  <title>Crops &amp; Crop Cycles | AgriMama</title>
  <meta name="description" content="Manage crops and crop cycles across your farms." />
</svelte:head>

<div class="page-intro">
        <div>
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

<style>

  .page-intro { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:24px; }
  .eyebrow { margin:0 0 7px; color:#66866d; font-size:11px; font-weight:800; letter-spacing:1.1px; }
  .page-intro h2 { margin:0; color:#173f28; font-size:28px; font-weight:800; }
  .intro-copy { margin:8px 0 0; color:#526357; font-size:14px; line-height:1.6; }
  .primary-button,.secondary-button { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:42px; padding:0 16px; border:1px solid transparent; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; text-decoration:none; }
  .primary-button { background:#28794b; color:#fff; }.primary-button:hover { background:#21653e; }.primary-button:disabled { opacity:.6; cursor:wait; }
  .secondary-button { border-color:#dce6dc; background:#fff; color:#405448; }
  .summary-row { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
  .summary-card { display:flex; align-items:center; gap:14px; padding:18px; border:1px solid #e5ece3; border-radius:12px; background:#fff; }
  .summary-icon { display:grid; place-items:center; flex:0 0 auto; width:44px; height:44px; border-radius:11px; background:#eaf4eb; color:#28794b; }
  .summary-card div:last-child { display:grid; gap:3px; }.summary-card span { color:#66786a; font-size:10px; font-weight:800; letter-spacing:.8px; }.summary-card strong { color:#173f28; font-size:25px; }.summary-card small { color:#526357; font-size:12px; }
  .notice { display:flex; align-items:center; gap:9px; padding:12px 14px; margin-top:16px; border-radius:8px; font-size:13px; }.notice.success { background:#edf7ee; color:#28794b; }.notice.error { background:#fff1ef; color:#b54b3f; }
  .farm-selector-panel,.form-panel,.cycle-card { border:1px solid #e5ece3; border-radius:12px; background:#fff; }
  .farm-selector-panel { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:19px 21px; margin-top:22px; }
  .farm-selector-panel h3,.panel-title h3,.section-heading h3 { margin:0; color:#263b2d; font-size:16px; font-weight:750; }
  .farm-selector-panel p,.panel-title p,.section-heading p { margin:5px 0 0; color:#526357; font-size:13px; }
  .farm-selector-panel select,.form-grid select,.form-grid input { min-height:42px; padding:0 12px; border:1px solid #dce6dc; border-radius:7px; background:#fff; color:#263b2d; font:inherit; font-size:13px; }
  .farm-selector-panel select { width:min(100%,300px); }
  .form-panel { padding:22px; margin-top:18px; }.form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; margin-top:20px; }
  .form-grid label { display:grid; gap:8px; color:#405448; font-size:13px; font-weight:700; }.form-grid label span { color:#718075; font-weight:400; }.form-grid input,.form-grid select { width:100%; }
  .form-grid input:focus,.form-grid select:focus { outline:1px solid #69a77a; border-color:#69a77a; }.form-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
  .cycles-section { margin-top:30px; }.section-heading { display:flex; align-items:center; justify-content:space-between; gap:15px; margin-bottom:16px; }
  .refresh-button { display:inline-flex; align-items:center; gap:7px; padding:8px 11px; border:1px solid #e0e8df; border-radius:7px; background:#fff; color:#405448; font-size:12px; cursor:pointer; }.refresh-button:disabled { opacity:.5; }
  .cycles-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }.cycle-card { padding:20px; }
  .cycle-card-top { display:flex; align-items:center; justify-content:space-between; }.crop-icon,.empty-icon { display:grid; place-items:center; width:44px; height:44px; border-radius:10px; background:#edf6ee; color:#39875a; }
  .status-pill { padding:6px 10px; border-radius:20px; background:#edf7ee; color:#438255; font-size:11px; font-weight:750; }.status-pill.completed { background:#eef0f2; color:#526357; }
  .cycle-card h4 { margin:16px 0 4px; color:#263b2d; font-size:18px; }.variety { margin:0 0 14px; color:#526357; font-size:13px; }
  .cycle-detail { display:flex; align-items:center; gap:8px; margin-top:10px; color:#405448; font-size:13px; }.cycle-detail :global(svg) { color:#66866d; }
  .cycle-card-footer { display:flex; justify-content:space-between; gap:10px; padding-top:14px; margin-top:16px; border-top:1px solid #edf1eb; color:#66786a; font-size:11px; }
  .state-panel { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:230px; padding:28px; border:1px dashed #dfe8dd; border-radius:12px; background:#fff; color:#7b9a80; text-align:center; }
  .state-panel strong { margin-top:12px; color:#263b2d; font-size:15px; }.state-panel p { max-width:380px; margin:8px 0 16px; color:#526357; font-size:13px; line-height:1.7; }
  .empty-icon { width:55px; height:55px; border-radius:50%; }.error-state { color:#bd6258; }
  .spin { animation:spin 1s linear infinite; } @keyframes spin { to { transform:rotate(360deg); } }
  @media(max-width:900px) { .summary-row { grid-template-columns:1fr 1fr; }.summary-card:last-child { grid-column:1 / -1; } }
  @media(max-width:760px) { .page-intro { align-items:flex-start; flex-direction:column; }.cycles-grid { grid-template-columns:1fr; }.farm-selector-panel { align-items:flex-start; flex-direction:column; }.farm-selector-panel select { width:100%; } }
  @media(max-width:480px) { .form-grid,.summary-row { grid-template-columns:1fr; }.summary-card:last-child { grid-column:auto; } }
</style>

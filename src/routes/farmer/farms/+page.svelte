<script>
  import {
    Sprout, MapPin, X, Plus, Ruler, MapPinned,
    RefreshCw, AlertCircle, CheckCircle2
  } from "lucide-svelte";
  import { getAuthState } from "#lib/stores/auth.svelte.js";
  import { api } from "#lib/services/api.js";

  const auth = getAuthState();

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
      successMessage = response?.message || "Farm ctreated successfully.";
      name = "";
      sizeAcres = "";
      latitude = "";
      longitude = "";
      showForm = false;
    } catch (error) {
      formError = error instanceof Error ? error.message : "Could not create the farm.";
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
</script>

<svelte:head>
  <title>Farms | AgriMama</title>
  <meta name="description" content="View and manage your created farms in AgriMama." />
</svelte:head>

<div class="farms-page">
<div class="page-intro">
      <div>
        <p class="eyebrow">YOUR FARMING LAND</p>
        <h2>Farms</h2>
        <p class="intro-copy">View and manage the farms created to your AgriMama account.</p>
      </div>
      <button class="primary-button" onclick={() => { showForm = !showForm; formError = ""; }}>
        {#if showForm}<X size={17} /> Cancel{:else}<Plus size={18} /> Add a farm{/if}
      </button>
    </div>

    <section class="summary-card">
      <div class="summary-icon"><MapPinned size={22} /></div>
      <div><span>MY FARMS</span><strong>{farms.length}</strong><small>{farms.length === 1 ? "farm in your account" : "farms in your account"}</small></div>
    </section>

    {#if successMessage}
      <div class="notice success"><CheckCircle2 size={17} />{successMessage}</div>
    {/if}

    {#if showForm}
      <section class="form-panel">
        <div class="panel-title"><div><h3>Create a farm</h3><p>Add the details of another farm you manage.</p></div></div>
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
      <div class="section-heading"><div><h3>Your farms</h3><p>Each farm can have its own crops and crop cycles.</p></div><button class="refresh-button" onclick={() => auth.user?.farmerId && loadFarms(auth.user.farmerId)} disabled={isLoading}><RefreshCw size={15} /> Refresh</button></div>

      {#if isLoading}
        <div class="state-panel"><RefreshCw size={24} class="spin" /><strong>Loading your farms...</strong><p>Please wait while we retrieve your farm records.</p></div>
      {:else if errorMessage}
        <div class="state-panel error-state"><AlertCircle size={25} /><strong>We couldn't load your farms</strong><p>{errorMessage}</p><button class="secondary-button" onclick={() => auth.user?.farmerId && loadFarms(auth.user.farmerId)}>Try again</button></div>
      {:else if farms.length === 0}
        <div class="state-panel empty-state"><div class="empty-icon"><Sprout size={28} /></div><strong>No farms created yet</strong><p>Create your first farm to start organising its crops, crop cycles and farming advice.</p><button class="primary-button" onclick={() => (showForm = true)}><Plus size={17} /> Create your first farm</button></div>
      {:else}
        <div class="farms-grid">
          {#each farms as farm (farm.id)}
            <article class="farm-card">
              <div class="farm-card-top"><div class="farm-icon"><Sprout size={22} /></div><span class="farm-status">Created</span></div>
              <h4>{farm.name || "Unnamed farm"}</h4>
              <div class="farm-detail"><Ruler size={16} /><span>{farm.sizeAcres ? `${Number(farm.sizeAcres).toLocaleString()} acres` : "Farm size not added"}</span></div>
              <div class="farm-detail"><MapPin size={16} /><span>{farm.latitude != null && farm.longitude != null ? `${formatCoordinate(farm.latitude)}, ${formatCoordinate(farm.longitude)}` : "Location coordinates not added"}</span></div>
              <div class="farm-card-footer"><span>Added {farm.createdAt ? new Date(farm.createdAt).toLocaleDateString() : "Date unavailable"}</span><span>Manage crop cycles</span></div>
            </article>
          {/each}
        </div>
      {/if}
    </section>
</div>

<style>

  .farms-page {
    width: 100%;
    color: #263b2d;
    font-family: inherit;
  }

  .page-intro {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
  }

  .eyebrow {
    margin: 0 0 8px;
    color: #64866b;
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 1px;
  }

  .page-intro h2 {
    margin: 0;
    color: #173f28;
    font-size: 30px;
    font-weight: 750;
    line-height: 1.2;
  }

  .intro-copy {
    margin: 9px 0 0;
    color: #526357;
    font-size: 15px;
    line-height: 1.6;
  }

  .primary-button, .secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid transparent;
    border-radius: 8px;
    font: inherit;
    font-size: 14px;
    font-weight: 650;
    cursor: pointer;
  }

  .primary-button { background: #28794b; color: #fff; }
  .primary-button:hover { background: #21653e; }
  .primary-button:disabled { opacity: .6; cursor: wait; }
  .secondary-button { border-color: #dce6dc; background: #fff; color: #405448; }

  .summary-card {
    display: flex;
    align-items: center;
    gap: 16px;
    width: min(100%, 330px);
    padding: 20px;
    border: 1px solid #e3ebe2;
    border-radius: 12px;
    background: #fff;
  }

  .summary-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 11px;
    background: #eaf4eb;
    color: #28794b;
  }

  .summary-card div:last-child { display: grid; gap: 3px; }
  .summary-card span { color: #526357; font-size: 11px; font-weight: 750; letter-spacing: .7px; }
  .summary-card strong { color: #173f28; font-size: 26px; }
  .summary-card small { color: #647368; font-size: 12px; }

  .notice {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 15px;
    margin-top: 18px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
  }
  .notice.success { background: #edf7ee; color: #246b3d; }
  .notice.error { background: #fff1ef; color: #a63f35; }

  .form-panel, .farm-card {
    border: 1px solid #e3ebe2;
    border-radius: 12px;
    background: #fff;
  }
  .form-panel { padding: 24px; margin-top: 22px; }
  .panel-title h3, .section-heading h3 {
    margin: 0;
    color: #173f28;
    font-size: 18px;
    font-weight: 700;
  }
  .panel-title p, .section-heading p {
    margin: 6px 0 0;
    color: #526357;
    font-size: 14px;
    line-height: 1.5;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    margin-top: 22px;
  }
  .form-grid label {
    display: grid;
    gap: 8px;
    color: #405448;
    font-size: 14px;
    font-weight: 650;
  }
  .form-grid label span { color: #718075; font-weight: 400; }
  .form-grid input {
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid #dce6dc;
    border-radius: 7px;
    outline: none;
    background: #fff;
    color: #263b2d;
    font: inherit;
    font-size: 14px;
    font-weight: 400;
  }
  .form-grid input:focus { border-color: #69a77a; box-shadow: 0 0 0 3px #28794b18; }
  .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }

  .farms-section { margin-top: 34px; }
  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 17px;
  }
  .refresh-button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 11px;
    border: 1px solid #dce6dc;
    border-radius: 7px;
    background: #fff;
    color: #405448;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  .refresh-button:disabled { opacity: .5; cursor: wait; }
  .farms-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 17px; }
  .farm-card { padding: 21px; }
  .farm-card-top { display: flex; align-items: center; justify-content: space-between; }
  .farm-icon {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 10px;
    background: #edf6ee;
    color: #28794b;
  }
  .farm-status {
    padding: 6px 10px;
    border-radius: 20px;
    background: #edf7ee;
    color: #28794b;
    font-size: 12px;
    font-weight: 650;
  }
  .farm-card h4 { margin: 17px 0 14px; color: #173f28; font-size: 17px; }
  .farm-detail {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 11px;
    color: #526357;
    font-size: 14px;
  }
  .farm-detail :global(svg) { color: #64866b; }
  .farm-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 15px;
    margin-top: 18px;
    border-top: 1px solid #edf1eb;
    color: #647368;
    font-size: 12px;
  }

  .state-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 245px;
    padding: 30px;
    border: 1px dashed #d7e3d6;
    border-radius: 12px;
    background: #fff;
    color: #64866b;
    text-align: center;
  }
  .state-panel strong { margin-top: 13px; color: #263b2d; font-size: 16px; }
  .state-panel p { max-width: 380px; margin: 8px 0 17px; color: #526357; font-size: 14px; line-height: 1.6; }
  .empty-icon {
    display: grid;
    place-items: center;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #edf6ee;
    color: #28794b;
  }
  .error-state { color: #b54b3f; }

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .farms-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .page-intro { align-items: flex-start; flex-direction: column; }
    .form-grid { grid-template-columns: 1fr; }
    .section-heading { align-items: flex-start; }
    .farm-card-footer { align-items: flex-start; flex-direction: column; }
  }

</style>

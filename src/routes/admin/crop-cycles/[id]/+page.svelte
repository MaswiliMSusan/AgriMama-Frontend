
<script>
  import { page } from "$app/state";

  import {
    ArrowLeft,
    Sprout,
    Wheat,
    UserRound,
    CalendarDays,
    MapPin,
    CheckCircle2,
    Clock3,
    Tractor,
    RefreshCw,
    AlertCircle
  } from "lucide-svelte";

  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"
  ).replace(/\/$/, "");

  let cropCycle = $state(null);
  let loading = $state(true);
  let errorMessage = $state("");

  const cropCycleId = $derived(page.params.id);

  let farm = $derived(cropCycle?.farm || null);
  let farmer = $derived(farm?.farmer || null);

  function formatDate(value) {
    if (!value) return "Not recorded";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not recorded";

    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function statusClass(status) {
    if (status === "active") return "status-active";
    if (status === "completed") return "status-completed";
    return "status-unknown";
  }

  async function loadCropCycle(id) {
    if (!id) {
      cropCycle = null;
      errorMessage = "Crop cycle ID is missing from the page URL.";
      loading = false;
      return;
    }

    loading = true;
    errorMessage = "";
    cropCycle = null;

    try {
      const response = await fetch(
        `${API_BASE}/admin/crop-cycles/${encodeURIComponent(id)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json"
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to retrieve crop-cycle details."
        );
      }

      cropCycle = result.cropCycle;
    } catch (error) {
      console.error("Failed to load crop cycle:", error);

      errorMessage =
        error.message || "Unable to load crop-cycle details.";
    } finally {
      loading = false;
    }
  }

  // React to route parameter changes using SvelteKit's current page state.
  $effect(() => {
    const id = cropCycleId;

    if (id) {
      loadCropCycle(id);
    } else {
      cropCycle = null;
      errorMessage = "Crop cycle ID is missing from the page URL.";
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>
    {cropCycle
      ? `${cropCycle.crop || "Crop"} | AgriMama`
      : "Crop Cycle Details | AgriMama"}
  </title>

  <meta
    name="description"
    content="View crop-cycle, farm and farmer details in AgriMama."
  />
</svelte:head>

<div class="detail-page">

  <!-- Navigation -->
  <div class="top-navigation">
    <a href="/admin/crop-cycles" class="back-link">
      <ArrowLeft size={17} />
      Back to Crop Management
    </a>

    <button
      class="refresh-button"
      onclick={() => loadCropCycle(cropCycleId)}
      disabled={loading || !cropCycleId}
    >
      <RefreshCw size={15} class={loading ? "spinning" : ""} />
      Refresh
    </button>
  </div>

  {#if loading}

    <div class="loading-card">
      <div class="loading-spinner"></div>
      <p>Loading crop-cycle details...</p>
    </div>

  {:else if errorMessage}

    <div class="error-card">
      <div class="error-icon">
        <AlertCircle size={25} />
      </div>

      <h2>Unable to load crop cycle</h2>
      <p>{errorMessage}</p>

      <button
        class="retry-button"
        onclick={() => loadCropCycle(cropCycleId)}
      >
        Try again
      </button>
    </div>

  {:else if cropCycle}

    <!-- Crop cycle heading -->
    <section class="profile-header">
      <div class="profile-heading-main">
        <div class="crop-avatar">
          <Sprout size={30} />
        </div>

        <div>
          <div class="eyebrow">CROP CYCLE PROFILE</div>

          <h1>{cropCycle.crop || "Unknown crop"}</h1>

          <p>
            {cropCycle.variety
              ? `Variety: ${cropCycle.variety}`
              : "Variety not specified"}
          </p>
        </div>
      </div>

      <span class={`status-badge ${statusClass(cropCycle.status)}`}>
        {#if cropCycle.status === "completed"}
          <CheckCircle2 size={15} />
        {:else}
          <Sprout size={15} />
        {/if}

        {formatStatus(cropCycle.status)}
      </span>
    </section>

    <!-- Overview cards -->
    <section class="overview-grid">
      <div class="overview-card">
        <div class="overview-icon planting-icon">
          <CalendarDays size={21} />
        </div>

        <div>
          <div class="overview-label">Planting date</div>
          <div class="overview-value">
            {formatDate(cropCycle.plantingDate)}
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-icon stage-icon">
          <Clock3 size={21} />
        </div>

        <div>
          <div class="overview-label">Current stage</div>
          <div class="overview-value">
            {cropCycle.currentStage || "Not recorded"}
          </div>
        </div>
      </div>

      <div class="overview-card">
        <div class="overview-icon farm-icon">
          <Tractor size={21} />
        </div>

        <div>
          <div class="overview-label">Farm</div>
          <div class="overview-value">
            {farm?.name || "Farm unavailable"}
          </div>
        </div>
      </div>
    </section>

    <div class="details-grid">

      <!-- Crop information -->
      <section class="details-card">
        <div class="section-heading">
          <div class="section-icon">
            <Wheat size={19} />
          </div>

          <div>
            <h2>Crop information</h2>
            <p>Details of this registered crop cycle</p>
          </div>
        </div>

        <div class="information-list">
          <div class="information-row">
            <span>Crop</span>
            <strong>{cropCycle.crop || "Not recorded"}</strong>
          </div>

          <div class="information-row">
            <span>Variety</span>
            <strong>{cropCycle.variety || "Not specified"}</strong>
          </div>

          <div class="information-row">
            <span>Planting date</span>
            <strong>{formatDate(cropCycle.plantingDate)}</strong>
          </div>

          <div class="information-row">
            <span>Current stage</span>
            <strong>{cropCycle.currentStage || "Not recorded"}</strong>
          </div>

          <div class="information-row">
            <span>Status</span>
            <strong>
              <span class={`status-badge small ${statusClass(cropCycle.status)}`}>
                {formatStatus(cropCycle.status)}
              </span>
            </strong>
          </div>

          <div class="information-row">
            <span>Record created</span>
            <strong>{formatDate(cropCycle.createdAt)}</strong>
          </div>

          <div class="information-row">
            <span>Last updated</span>
            <strong>{formatDate(cropCycle.updatedAt)}</strong>
          </div>
        </div>
      </section>

      <!-- Farm information -->
      <section class="details-card">
        <div class="section-heading">
          <div class="section-icon">
            <Tractor size={19} />
          </div>

          <div>
            <h2>Farm information</h2>
            <p>Farm associated with this crop cycle</p>
          </div>
        </div>

        {#if farm}
          <div class="information-list">
            <div class="information-row">
              <span>Farm name</span>
              <strong>{farm.name || "Not recorded"}</strong>
            </div>

            <div class="information-row">
              <span>Farm size</span>
              <strong>
                {farm.sizeAcres != null
                  ? `${farm.sizeAcres} acres`
                  : "Not recorded"}
              </strong>
            </div>

            <div class="information-row">
              <span>GPS latitude</span>
              <strong>{farm.latitude ?? "Not recorded"}</strong>
            </div>

            <div class="information-row">
              <span>GPS longitude</span>
              <strong>{farm.longitude ?? "Not recorded"}</strong>
            </div>

            <div class="information-row">
              <span>Farm ID</span>
              <strong class="id-value">{farm.id}</strong>
            </div>
          </div>

          {#if farm.latitude != null && farm.longitude != null}
            <a
              class="map-link"
              href={`https://www.google.com/maps?q=${encodeURIComponent(`${farm.latitude},${farm.longitude}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={16} />
              View farm location on Google Maps
            </a>
          {/if}

          <a
            class="farm-link"
            href={`/admin/farms/${farm.id}`}
          >
            View farm profile
            <ArrowLeft size={14} class="arrow-right" />
          </a>

        {:else}
          <div class="empty-information">
            <Tractor size={25} />
            <p>Farm information is unavailable.</p>
          </div>
        {/if}
      </section>

      <!-- Farmer information -->
      <section class="details-card farmer-card">
        <div class="section-heading">
          <div class="section-icon">
            <UserRound size={19} />
          </div>

          <div>
            <h2>Farmer information</h2>
            <p>Farmer who owns the associated farm</p>
          </div>
        </div>

        {#if farmer}
          <div class="farmer-profile">
            <div class="farmer-avatar">
              <UserRound size={25} />
            </div>

            <div>
              <h3>{farmer.name || "Unknown farmer"}</h3>
              <p>Registered AgriMama farmer</p>
            </div>
          </div>

          <div class="information-list">
            <div class="information-row">
              <span>Full name</span>
              <strong>{farmer.name || "Not recorded"}</strong>
            </div>

            <div class="information-row">
              <span>Phone number</span>
              <strong>{farmer.phone || "Not recorded"}</strong>
            </div>

            <div class="information-row">
              <span>Preferred language</span>
              <strong>{farmer.preferredLanguage || "Not recorded"}</strong>
            </div>

            <div class="information-row">
              <span>Farmer ID</span>
              <strong class="id-value">{farmer.id}</strong>
            </div>
          </div>

          <a
            class="farm-link"
            href={`/admin/farmers/${farmer.id}`}
          >
            View farmer profile
            <ArrowLeft size={14} class="arrow-right" />
          </a>

        {:else}
          <div class="empty-information">
            <UserRound size={25} />
            <p>Farmer information is unavailable.</p>
          </div>
        {/if}
      </section>
    </div>

    <p class="page-note">
      This is a read-only crop-cycle profile. Changes to crop records
      should continue through the existing farmer-facing workflows.
    </p>

  {/if}
</div>

<style>
  .detail-page {
    display: grid;
    gap: 20px;
  }

  .top-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .back-link,
  .refresh-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #28794B;
    font-size: 13px;
    font-weight: 650;
    text-decoration: none;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  .refresh-button {
    padding: 9px 13px;
    border: 1px solid #DCE8DD;
    border-radius: 8px;
    background: white;
    cursor: pointer;
  }

  .refresh-button:disabled {
    opacity: .6;
    cursor: wait;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .profile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 23px;
    border: 1px solid #E5ECE5;
    border-radius: 13px;
    background: white;
  }

  .profile-heading-main {
    display: flex;
    align-items: center;
    gap: 17px;
  }

  .crop-avatar {
    display: grid;
    place-items: center;
    width: 65px;
    height: 65px;
    flex-shrink: 0;
    border-radius: 15px;
    background: #EDF6EE;
    color: #28794B;
  }

  .eyebrow {
    margin-bottom: 6px;
    color: #28794B;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.2px;
  }

  h1 {
    margin: 0 0 5px;
    color: #173F28;
    font-size: 27px;
    text-transform: capitalize;
  }

  .profile-heading-main p {
    margin: 0;
    color: #68776C;
    font-size: 12px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 11px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  .status-active {
    background: #EDF6EE;
    color: #28794B;
  }

  .status-completed {
    background: #EAF1ED;
    color: #526D5B;
  }

  .status-unknown {
    background: #F2F3F2;
    color: #68776C;
  }

  .status-badge.small {
    padding: 5px 8px;
    font-size: 10px;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .overview-card {
    display: flex;
    align-items: center;
    gap: 13px;
    min-width: 0;
    padding: 17px;
    border: 1px solid #E5ECE5;
    border-radius: 11px;
    background: white;
  }

  .overview-icon,
  .section-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 10px;
    background: #EDF6EE;
    color: #28794B;
  }

  .stage-icon {
    background: #F3F5EA;
    color: #778A3C;
  }

  .farm-icon {
    background: #EEF3F0;
    color: #526D5B;
  }

  .overview-label {
    margin-bottom: 5px;
    color: #68776C;
    font-size: 11px;
  }

  .overview-value {
    overflow-wrap: anywhere;
    color: #173F28;
    font-size: 14px;
    font-weight: 750;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 17px;
    align-items: start;
  }

  .details-card {
    min-width: 0;
    padding: 21px;
    border: 1px solid #E5ECE5;
    border-radius: 12px;
    background: white;
  }

  .farmer-card {
    grid-column: 1 / -1;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 17px;
    border-bottom: 1px solid #EDF1ED;
  }

  .section-heading h2 {
    margin: 0 0 5px;
    color: #173F28;
    font-size: 15px;
  }

  .section-heading p {
    margin: 0;
    color: #849087;
    font-size: 11px;
  }

  .information-list {
    display: grid;
  }

  .information-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 15px;
    padding: 13px 0;
    border-bottom: 1px solid #F0F3F0;
  }

  .information-row:last-child {
    border-bottom: 0;
  }

  .information-row > span {
    flex-shrink: 0;
    color: #68776C;
    font-size: 11px;
  }

  .information-row > strong {
    max-width: 65%;
    color: #26382C;
    font-size: 11px;
    font-weight: 650;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .id-value {
    font-family: monospace;
    font-size: 10px !important;
  }

  .map-link,
  .farm-link {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 12px;
    padding: 10px 12px;
    border-radius: 7px;
    background: #F2F7F2;
    color: #28794B;
    font-size: 11px;
    font-weight: 650;
    text-decoration: none;
  }

  .map-link:hover,
  .farm-link:hover {
    background: #EAF3EB;
  }

  .farm-link {
    justify-content: space-between;
    margin-top: 9px;
  }

  .arrow-right {
    transform: rotate(180deg);
  }

  .farmer-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 0;
  }

  .farmer-avatar {
    display: grid;
    place-items: center;
    width: 47px;
    height: 47px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #EDF6EE;
    color: #28794B;
  }

  .farmer-profile h3 {
    margin: 0 0 5px;
    color: #173F28;
    font-size: 14px;
  }

  .farmer-profile p {
    margin: 0;
    color: #849087;
    font-size: 11px;
  }

  .empty-information {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 130px;
    color: #849087;
    text-align: center;
  }

  .empty-information p {
    font-size: 12px;
  }

  .loading-card,
  .error-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 25px;
    border: 1px solid #E5ECE5;
    border-radius: 13px;
    background: white;
    text-align: center;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #E5ECE5;
    border-top-color: #28794B;
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }

  .loading-card p,
  .error-card p {
    color: #68776C;
    font-size: 12px;
    line-height: 1.6;
  }

  .error-icon {
    color: #B64C43;
  }

  .error-card h2 {
    color: #173F28;
    font-size: 17px;
  }

  .retry-button {
    padding: 9px 15px;
    border: 0;
    border-radius: 7px;
    background: #28794B;
    color: white;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
  }

  .page-note {
    margin: 0;
    color: #68776C;
    font-size: 11px;
    line-height: 1.6;
  }

  @media (max-width: 800px) {
    .overview-grid {
      grid-template-columns: 1fr;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .farmer-card {
      grid-column: auto;
    }
  }

  @media (max-width: 550px) {
    .profile-header {
      align-items: flex-start;
      flex-direction: column;
      padding: 17px;
    }

    .profile-heading-main {
      gap: 12px;
    }

    .crop-avatar {
      width: 53px;
      height: 53px;
    }

    h1 {
      font-size: 22px;
    }

    .details-card {
      padding: 16px;
    }

    .information-row {
      gap: 9px;
    }
  }
</style>

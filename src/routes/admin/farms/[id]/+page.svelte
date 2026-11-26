<script>
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import {
    ArrowLeft,
    Sprout,
    UserRound,
    Phone,
    Languages,
    MapPin,
    Ruler,
    CalendarDays,
    Wheat,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock3
  } from "lucide-svelte";

  const API_BASE = (
    import.meta.env.VITE_API_URL || "http://localhost:7000"
  ).replace(/\/$/, "");

  let farm = $state(null);
  let loading = $state(true);
  let errorMessage = $state("");

  const farmId = $derived(page.params.id);

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function formatAcres(value) {
    if (value === null || value === undefined || value === "") return "Not recorded";
    const number = Number(value);
    return Number.isFinite(number)
      ? `${number.toLocaleString("en-KE", { maximumFractionDigits: 2 })} acres`
      : "Not recorded";
  }

  function formatCoordinate(value, digits = 6) {
    if (value === null || value === undefined || value === "") return "Not recorded";
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : "Not recorded";
  }

  function languageLabel(value) {
    const labels = {
      en: "English",
      english: "English",
      sw: "Kiswahili",
      kiswahili: "Kiswahili",
      luo: "Dholuo",
      dholuo: "Dholuo"
    };

    return labels[(value || "").toLowerCase()] || value || "Not set";
  }

  function statusClass(value) {
    const status = (value || "").toLowerCase();
    if (["active", "growing", "completed", "harvested"].includes(status)) return "status-positive";
    if (["inactive", "cancelled", "failed"].includes(status)) return "status-muted";
    return "status-neutral";
  }

  function titleCase(value) {
    if (!value) return "Not set";
    return String(value)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  async function loadFarm() {
    loading = true;
    errorMessage = "";

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/farms/${encodeURIComponent(farmId)}`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Farm request failed (${response.status})`);
      }

      farm = result.farm || null;

      if (!farm) {
        throw new Error("The farm record was not included in the response.");
      }
    } catch (error) {
      console.error("Failed to load farm profile:", error);
      errorMessage = error.message || "Unable to load this farm. Please try again.";
      farm = null;
    } finally {
      loading = false;
    }
  }

  onMount(loadFarm);
</script>

<svelte:head>
  <title>AgriMama | Farm Details</title>
  <meta name="description" content="Farm profile and crop cycle details" />
</svelte:head>

<div class="farm-detail-page">
  <a class="back-link" href="/admin/farms">
    <ArrowLeft size={17} />
    Back to farms
  </a>

  {#if loading}
    <section class="state-panel">
      <RefreshCw size={25} class="spinning" />
      <strong>Loading farm details…</strong>
      <p>Please wait while the farm record is retrieved.</p>
    </section>
  {:else if errorMessage}
    <section class="state-panel error-state" role="alert">
      <div class="state-icon"><AlertCircle size={25} /></div>
      <strong>Unable to load farm</strong>
      <p>{errorMessage}</p>
      <button class="primary-button" onclick={loadFarm}>
        <RefreshCw size={15} /> Try again
      </button>
    </section>
  {:else if farm}
    <div class="page-heading">
      <div>
        <div class="eyebrow">FARM MANAGEMENT</div>
        <h1>{farm.name || "Unnamed farm"}</h1>
        <p>Farm profile, registered owner and crop cycle information.</p>
      </div>
      <span class="record-badge"><Sprout size={14} /> Farm record</span>
    </div>

    <section class="overview-grid">
      <article class="overview-card">
        <div class="overview-icon"><Ruler size={20} /></div>
        <div>
          <span class="overview-label">Farm size</span>
          <strong>{formatAcres(farm.sizeAcres)}</strong>
        </div>
      </article>

      <article class="overview-card">
        <div class="overview-icon"><Wheat size={20} /></div>
        <div>
          <span class="overview-label">Crop cycles</span>
          <strong>{farm.cropCycles?.length || 0}</strong>
        </div>
      </article>

      <article class="overview-card">
        <div class="overview-icon"><CalendarDays size={20} /></div>
        <div>
          <span class="overview-label">Date registered</span>
          <strong>{formatDate(farm.createdAt)}</strong>
        </div>
      </article>
    </section>

    <section class="content-card">
      <div class="section-heading">
        <div class="section-icon"><Sprout size={19} /></div>
        <div>
          <h2>Farm information</h2>
          <p>Basic details and recorded location.</p>
        </div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <span>Farm name</span>
          <strong>{farm.name || "Not provided"}</strong>
        </div>
        <div class="detail-item">
          <span>Farm size</span>
          <strong>{formatAcres(farm.sizeAcres)}</strong>
        </div>
        <div class="detail-item">
          <span>Latitude</span>
          <strong>{formatCoordinate(farm.latitude)}</strong>
        </div>
        <div class="detail-item">
          <span>Longitude</span>
          <strong>{formatCoordinate(farm.longitude)}</strong>
        </div>
        <div class="detail-item">
          <span>Location accuracy</span>
          <strong>
            {farm.locationAccuracyMeters == null
              ? "Not recorded"
              : `${Number(farm.locationAccuracyMeters).toLocaleString("en-KE")} metres`}
          </strong>
        </div>
        <div class="detail-item">
          <span>Last updated</span>
          <strong>{formatDate(farm.updatedAt)}</strong>
        </div>
      </div>

      {#if farm.latitude != null && farm.longitude != null}
        <a
          class="map-link"
          href={`https://www.google.com/maps?q=${encodeURIComponent(`${farm.latitude},${farm.longitude}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MapPin size={15} />
          View coordinates on Google Maps
        </a>
      {:else}
        <div class="location-note">
          <MapPin size={15} />
          GPS coordinates have not been recorded for this farm.
        </div>
      {/if}
    </section>

    <section class="content-card">
      <div class="section-heading">
        <div class="section-icon"><UserRound size={19} /></div>
        <div>
          <h2>Farm owner</h2>
          <p>Farmer account associated with this farm.</p>
        </div>
      </div>

      {#if farm.farmer}
        <div class="owner-panel">
          <div class="owner-avatar"><UserRound size={23} /></div>
          <div class="owner-main">
            <strong>{farm.farmer.name || "Unnamed farmer"}</strong>
            <span>Registered farmer</span>
          </div>
          <a class="owner-link" href={`/admin/farmers/${farm.farmer.id}`}>
            View farmer profile
          </a>
        </div>

        <div class="details-grid owner-details">
          <div class="detail-item">
            <span>Phone number</span>
            <strong class="with-icon">
              <Phone size={14} />
              {farm.farmer.phone || "Not provided"}
            </strong>
          </div>
          <div class="detail-item">
            <span>Preferred language</span>
            <strong class="with-icon">
              <Languages size={14} />
              {languageLabel(farm.farmer.preferredLanguage)}
            </strong>
          </div>
          <div class="detail-item">
            <span>Farmer ID</span>
            <strong class="id-value">{farm.farmer.id}</strong>
          </div>
        </div>
      {:else}
        <div class="inline-empty">
          <AlertCircle size={17} />
          Farmer information is not available for this farm record.
        </div>
      {/if}
    </section>

    <section class="content-card">
      <div class="section-heading crop-heading">
        <div class="section-icon"><Wheat size={19} /></div>
        <div>
          <h2>Crop cycles</h2>
          <p>Planting records associated with this farm.</p>
        </div>
        <span class="count-badge">{farm.cropCycles?.length || 0} records</span>
      </div>

      {#if farm.cropCycles?.length}
        <div class="crop-list">
          {#each farm.cropCycles as cycle (cycle.id)}
            <article class="crop-item">
              <div class="crop-avatar"><Wheat size={20} /></div>
              <div class="crop-main">
                <strong>{titleCase(cycle.crop)}</strong>
                <span>{cycle.variety ? `Variety: ${cycle.variety}` : "Variety not specified"}</span>
              </div>
              <div class="crop-date">
                <span>Planting date</span>
                <strong>{formatDate(cycle.plantingDate)}</strong>
              </div>
              <div class="crop-stage">
                <span>Current stage</span>
                <strong>{titleCase(cycle.currentStage)}</strong>
              </div>
              <span class={`status-pill ${statusClass(cycle.status)}`}>
                {#if (cycle.status || "").toLowerCase() === "active"}
                  <CheckCircle2 size={13} />
                {:else}
                  <Clock3 size={13} />
                {/if}
                {titleCase(cycle.status)}
              </span>
            </article>
          {/each}
        </div>
      {:else}
        <div class="crop-empty">
          <div class="empty-icon"><Wheat size={24} /></div>
          <strong>No crop cycles recorded</strong>
          <p>Crop planting records for this farm will appear here when available.</p>
        </div>
      {/if}
    </section>

    <p class="page-note">
      This is a read-only farm profile. Farm and crop-cycle records are displayed
      from the AgriMama backend and are not modified on this page.
    </p>
  {/if}
</div>

<style>
  .farm-detail-page { display: grid; gap: 20px; }
  .back-link { display: inline-flex; align-items: center; gap: 7px; width: fit-content; color: #28794B; font-size: 12px; font-weight: 700; text-decoration: none; }
  .back-link:hover { text-decoration: underline; }
  .page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 15px; }
  .eyebrow { margin-bottom: 8px; color: #28794B; font-size: 11px; font-weight: 800; letter-spacing: 1.4px; }
  h1 { margin: 0 0 7px; color: #173F28; font-size: 29px; letter-spacing: -.7px; }
  .page-heading p, .section-heading p { margin: 0; color: #68776C; font-size: 12px; line-height: 1.6; }
  .record-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 11px; border: 1px solid #DCE8DD; border-radius: 20px; background: white; color: #28794B; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .overview-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; }
  .overview-card { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 16px; border: 1px solid #E5ECE5; border-radius: 11px; background: white; }
  .overview-icon, .section-icon { display: grid; place-items: center; flex-shrink: 0; width: 41px; height: 41px; border-radius: 10px; background: #EDF6EE; color: #28794B; }
  .overview-label { display: block; margin-bottom: 5px; color: #68776C; font-size: 11px; }
  .overview-card strong { display: block; color: #173F28; font-size: 15px; overflow-wrap: anywhere; }
  .content-card { min-width: 0; padding: 21px 22px; border: 1px solid #E5ECE5; border-radius: 12px; background: white; }
  .section-heading { display: flex; align-items: center; gap: 11px; margin-bottom: 20px; }
  .section-heading h2 { margin: 0 0 4px; color: #173F28; font-size: 16px; }
  .details-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 25px; }
  .detail-item { min-width: 0; }
  .detail-item > span { display: block; margin-bottom: 6px; color: #849087; font-size: 10px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
  .detail-item > strong { display: block; color: #26382C; font-size: 12px; font-weight: 650; overflow-wrap: anywhere; }
  .with-icon { display: flex !important; align-items: center; gap: 7px; }
  .with-icon svg { flex-shrink: 0; color: #849087; }
  .id-value { font-size: 10px !important; }
  .map-link, .location-note { display: inline-flex; align-items: center; gap: 7px; margin-top: 20px; font-size: 11px; }
  .map-link { color: #28794B; font-weight: 700; text-decoration: none; }
  .map-link:hover { text-decoration: underline; }
  .location-note { color: #849087; }
  .owner-panel { display: flex; align-items: center; gap: 12px; padding: 13px; border: 1px solid #EAF0EA; border-radius: 9px; background: #FAFCFA; }
  .owner-avatar, .crop-avatar { display: grid; place-items: center; flex-shrink: 0; width: 42px; height: 42px; border-radius: 50%; background: #EDF6EE; color: #28794B; }
  .owner-main { min-width: 0; }
  .owner-main strong { display: block; color: #26382C; font-size: 13px; }
  .owner-main span { display: block; margin-top: 4px; color: #849087; font-size: 10px; }
  .owner-link { margin-left: auto; color: #28794B; font-size: 11px; font-weight: 700; text-decoration: none; white-space: nowrap; }
  .owner-link:hover { text-decoration: underline; }
  .owner-details { margin-top: 20px; }
  .inline-empty { display: flex; align-items: center; gap: 8px; color: #8B6A31; font-size: 12px; }
  .crop-heading { margin-bottom: 17px; }
  .count-badge { margin-left: auto; padding: 6px 9px; border-radius: 7px; background: #F0F6F0; color: #28794B; font-size: 10px; font-weight: 700; white-space: nowrap; }
  .crop-list { display: grid; }
  .crop-item { display: grid; grid-template-columns: auto minmax(120px, 1.2fr) minmax(110px, .8fr) minmax(110px, .8fr) auto; align-items: center; gap: 13px; padding: 14px 0; border-top: 1px solid #EDF1ED; }
  .crop-item:first-child { border-top: 0; }
  .crop-avatar { width: 38px; height: 38px; }
  .crop-main strong, .crop-date strong, .crop-stage strong { display: block; color: #26382C; font-size: 11px; }
  .crop-main span, .crop-date span, .crop-stage span { display: block; margin-bottom: 5px; color: #849087; font-size: 10px; }
  .crop-main span { margin: 4px 0 0; }
  .status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; white-space: nowrap; }
  .status-positive { background: #EAF7ED; color: #28794B; }
  .status-muted { background: #F0F2F0; color: #68776C; }
  .status-neutral { background: #FFF5E8; color: #93651F; }
  .crop-empty { display: flex; flex-direction: column; align-items: center; padding: 25px 12px; text-align: center; }
  .empty-icon { display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 10px; border-radius: 12px; background: #F0F6F0; color: #28794B; }
  .crop-empty strong { color: #26382C; font-size: 12px; }
  .crop-empty p { max-width: 320px; margin: 6px 0 0; color: #849087; font-size: 11px; line-height: 1.6; }
  .page-note { margin: 0; color: #68776C; font-size: 11px; line-height: 1.6; }
  .state-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; min-height: 280px; padding: 25px; border: 1px solid #E5ECE5; border-radius: 12px; background: white; color: #28794B; text-align: center; }
  .state-panel strong { color: #26382C; font-size: 14px; }
  .state-panel p { max-width: 430px; margin: 0; color: #68776C; font-size: 12px; line-height: 1.6; }
  .error-state { color: #A4423A; }
  .state-icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 12px; background: #FFF1F0; color: #A4423A; }
  .primary-button { display: inline-flex; align-items: center; gap: 7px; margin-top: 8px; padding: 9px 13px; border: 0; border-radius: 7px; background: #28794B; color: white; font-size: 11px; font-weight: 700; cursor: pointer; }
  .spinning { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 850px) {
    .details-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .crop-item { grid-template-columns: auto 1fr 1fr; }
    .crop-stage { grid-column: 2; }
    .crop-item .status-pill { grid-column: 3; grid-row: 2; justify-self: start; }
  }
  @media (max-width: 560px) {
    .page-heading { align-items: flex-start; flex-direction: column; }
    .overview-grid { grid-template-columns: 1fr; }
    .content-card { padding: 17px 15px; }
    .details-grid { grid-template-columns: 1fr 1fr; gap: 17px 12px; }
    .owner-panel { flex-wrap: wrap; }
    .owner-link { width: 100%; margin-left: 54px; }
    .crop-item { grid-template-columns: auto 1fr; gap: 10px; }
    .crop-date, .crop-stage, .crop-item .status-pill { grid-column: 2; grid-row: auto; }
    .crop-date, .crop-stage { display: flex; align-items: baseline; gap: 7px; }
    .crop-date span, .crop-stage span { margin: 0; }
  }
</style>

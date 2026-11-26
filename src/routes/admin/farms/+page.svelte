<script>
  import { onMount } from "svelte";
  import { Search, Sprout, UserRound, Phone, MapPin, Ruler, ChevronLeft, ChevronRight, Eye, RefreshCw, X, Wheat } from "lucide-svelte";

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:7000").replace(/\/$/, "");

  let farms = $state([]);
  let loading = $state(true);
  let errorMessage = $state("");
  let searchInput = $state("");
  let appliedSearch = $state("");
  let page = $state(1);
  const limit = 20;
  let pagination = $state({ total: 0, page: 1, limit, totalPages: 0 });
  const hasFilters = $derived(Boolean(appliedSearch));

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function formatAcres(value) {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    return Number.isFinite(number) ? `${number.toLocaleString("en-KE", { maximumFractionDigits: 2 })} acres` : "—";
  }

  function formatCoordinates(latitude, longitude) {
    if (latitude == null || longitude == null) return "Not recorded";
    return `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
  }

  function cropSummary(farm) {
    const cycles = farm.cropCycles || [];
    if (!cycles.length) return "No crop cycles";
    const names = [...new Set(cycles.map((cycle) => cycle.crop).filter(Boolean))];
    if (!names.length) return `${cycles.length} crop cycle${cycles.length === 1 ? "" : "s"}`;
    return names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", ");
  }

  async function loadFarms() {
    loading = true;
    errorMessage = "";
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (appliedSearch.trim()) params.set("search", appliedSearch.trim());

    try {
      const response = await fetch(`${API_BASE}/api/admin/farms?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Farm request failed (${response.status})`);
      }
      farms = result.farms || [];
      pagination = result.pagination || { total: farms.length, page, limit, totalPages: farms.length ? 1 : 0 };
    } catch (error) {
      console.error("Failed to load farms:", error);
      errorMessage = error.message || "Unable to load farms. Please try again.";
      farms = [];
    } finally {
      loading = false;
    }
  }

  function applySearch() {
    page = 1;
    appliedSearch = searchInput;
    loadFarms();
  }

  function clearSearch() {
    searchInput = "";
    appliedSearch = "";
    page = 1;
    loadFarms();
  }

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === page) return;
    page = nextPage;
    loadFarms();
  }

  onMount(loadFarms);
</script>

<svelte:head>
  <title>AgriMama | Farm Management</title>
  <meta name="description" content="View registered farms and crop cycle information in AgriMama" />
</svelte:head>

<div class="farms-page">
  <div class="page-heading">
    <div>
      <div class="eyebrow">PLATFORM MANAGEMENT</div>
      <h1>Farms & Crops</h1>
      <p>View registered farms, their owners, locations and crop cycles.</p>
    </div>
    <button class="refresh-button" onclick={loadFarms} disabled={loading}>
      <RefreshCw size={16} class={loading ? "spinning" : ""} /> Refresh
    </button>
  </div>

  <section class="summary-card">
    <div class="summary-icon"><Sprout size={23} /></div>
    <div>
      <div class="summary-label">Registered farms</div>
      <div class="summary-value">{loading && pagination.total === 0 ? "…" : pagination.total.toLocaleString()}</div>
    </div>
  </section>

  <section class="directory-panel">
    <div class="directory-heading">
      <div>
        <h2>Farm directory</h2>
        <p>Search by farm name, farmer name or farmer phone number.</p>
      </div>
      {#if hasFilters}
        <button class="clear-button" onclick={clearSearch}><X size={14} /> Clear search</button>
      {/if}
    </div>

    <form class="filters" onsubmit={(event) => { event.preventDefault(); applySearch(); }}>
      <label class="search-field">
        <span class="sr-only">Search farms</span>
        <Search size={18} />
        <input bind:value={searchInput} placeholder="Search farm, farmer or phone number..." autocomplete="off" />
      </label>
      <button class="search-button" type="submit" disabled={loading}><Search size={16} /> Search</button>
    </form>

    {#if errorMessage}
      <div class="error-banner" role="alert">
        <span>{errorMessage}</span>
        <button onclick={loadFarms}>Try again</button>
      </div>
    {/if}

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Farm</th><th>Farmer</th><th>Farm size</th><th>Location coordinates</th><th>Crop cycles</th><th>Registered</th><th><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {#if loading}
            {#each [1, 2, 3, 4, 5] as item}
              <tr><td colspan="7" class="loading-row"><span class="loading-line"></span></td></tr>
            {/each}
          {:else if farms.length > 0}
            {#each farms as farm (farm.id)}
              <tr>
                <td>
                  <div class="farm-cell">
                    <div class="farm-avatar"><Sprout size={18} /></div>
                    <div class="farm-name"><strong>{farm.name || "Unnamed farm"}</strong><small>Farm record</small></div>
                  </div>
                </td>
                <td>
                  <div class="farmer-cell">
                    <strong>{farm.farmer?.name || "Farmer unavailable"}</strong>
                    {#if farm.farmer?.phone}<small><Phone size={12} /> {farm.farmer.phone}</small>{/if}
                  </div>
                </td>
                <td><span class="size-cell"><Ruler size={14} /> {formatAcres(farm.sizeAcres)}</span></td>
                <td><span class="location-cell"><MapPin size={14} /> {formatCoordinates(farm.latitude, farm.longitude)}</span></td>
                <td>
                  <span class="crop-cell">
                    <Wheat size={14} />
                    <span><strong>{farm.cropCycleCount ?? farm.cropCycles?.length ?? 0}</strong><small>{cropSummary(farm)}</small></span>
                  </span>
                </td>
                <td class="date-cell">{formatDate(farm.createdAt)}</td>
                <td><a class="view-link" href={`/admin/farms/${farm.id}`} aria-label={`View ${farm.name || "farm"} details`}><Eye size={16} /> View</a></td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="7">
                <div class="empty-state">
                  <div class="empty-icon"><Sprout size={27} /></div>
                  <strong>No farms found</strong>
                  <p>{hasFilters ? "Try changing your search terms." : "Registered farms will appear here."}</p>
                  {#if hasFilters}<button class="clear-button" onclick={clearSearch}>Clear search</button>{/if}
                </div>
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <div class="results-count">
        {#if pagination.total > 0}
          Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total} farms
        {:else}
          No farm records
        {/if}
      </div>
      <div class="pagination">
        <button aria-label="Previous page" onclick={() => goToPage(page - 1)} disabled={loading || page <= 1}><ChevronLeft size={17} /></button>
        <span>Page {pagination.totalPages ? page : 0} of {pagination.totalPages}</span>
        <button aria-label="Next page" onclick={() => goToPage(page + 1)} disabled={loading || page >= pagination.totalPages}><ChevronRight size={17} /></button>
      </div>
    </div>
  </section>

  <p class="page-note">Farm records are retrieved from the AgriMama admin API. This page is read-only; farm registration and crop-cycle records are not modified here.</p>
</div>

<style>
  .farms-page { display: grid; gap: 22px; }
  .page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
  .eyebrow { margin-bottom: 9px; color: #28794B; font-size: 11px; font-weight: 800; letter-spacing: 1.4px; }
  h1 { margin: 0 0 8px; color: #173F28; font-size: 30px; letter-spacing: -.8px; }
  .page-heading p, .directory-heading p { margin: 0; color: #526357; font-size: 13px; line-height: 1.6; }
  .refresh-button, .search-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; border: 1px solid #DCE8DD; border-radius: 8px; background: white; color: #234C35; font-size: 13px; font-weight: 650; cursor: pointer; }
  .refresh-button:disabled, .search-button:disabled { opacity: .6; cursor: wait; }
  .spinning { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .summary-card { display: flex; align-items: center; gap: 14px; width: fit-content; min-width: 230px; padding: 17px 20px; border: 1px solid #E5ECE5; border-radius: 12px; background: white; }
  .summary-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 11px; background: #EDF6EE; color: #28794B; }
  .summary-label { color: #526357; font-size: 12px; }
  .summary-value { margin-top: 3px; color: #173F28; font-size: 24px; font-weight: 750; }
  .directory-panel { min-width: 0; overflow: hidden; border: 1px solid #E5ECE5; border-radius: 13px; background: white; }
  .directory-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 22px 22px 18px; }
  .directory-heading h2 { margin: 0 0 6px; color: #173F28; font-size: 17px; }
  .filters { display: grid; grid-template-columns: minmax(220px, 1fr) auto; gap: 10px; padding: 0 22px 19px; }
  .search-field { display: flex; align-items: center; gap: 9px; min-width: 0; height: 42px; padding: 0 11px; border: 1px solid #DDE6DE; border-radius: 8px; color: #68776C; }
  .search-field input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #26382C; font: inherit; font-size: 12px; }
  .search-field:focus-within { border-color: #6DAB7C; box-shadow: 0 0 0 2px #28794B18; }
  .search-button { border-color: #28794B; background: #28794B; color: white; }
  .search-button:hover:not(:disabled) { background: #1F633B; }
  .clear-button { display: inline-flex; align-items: center; gap: 5px; padding: 7px 9px; border: 0; border-radius: 6px; background: #F0F6F0; color: #28794B; font-size: 12px; font-weight: 650; cursor: pointer; }
  .error-banner { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 22px 16px; padding: 12px 14px; border: 1px solid #F0C8C5; border-radius: 8px; background: #FFF4F3; color: #8B302A; font-size: 12px; }
  .error-banner button { border: 0; background: transparent; color: #8B302A; font-weight: 700; cursor: pointer; text-decoration: underline; }
  .table-wrap { width: 100%; overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
  thead { background: #F7F9F6; }
  th { padding: 12px 15px; color: #68776C; font-size: 10px; font-weight: 750; letter-spacing: .5px; text-transform: uppercase; }
  th:first-child, td:first-child { padding-left: 22px; }
  th:last-child, td:last-child { padding-right: 22px; }
  td { padding: 14px 15px; border-top: 1px solid #EDF1ED; color: #405448; font-size: 12px; }
  .farm-cell, .size-cell, .location-cell, .crop-cell { display: flex; align-items: center; gap: 8px; }
  .farm-avatar { display: grid; place-items: center; width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; background: #EDF6EE; color: #28794B; }
  .farm-name strong, .farmer-cell strong { display: block; color: #26382C; font-size: 12px; }
  .farm-name small { display: block; margin-top: 4px; color: #849087; font-size: 10px; }
  .farmer-cell small { display: flex; align-items: center; gap: 4px; margin-top: 5px; color: #849087; font-size: 10px; }
  .size-cell svg, .location-cell svg, .crop-cell > svg { flex-shrink: 0; color: #849087; }
  .crop-cell strong { display: block; color: #26382C; font-size: 12px; }
  .crop-cell small { display: block; max-width: 145px; margin-top: 3px; overflow: hidden; color: #849087; font-size: 10px; text-overflow: ellipsis; }
  .date-cell { color: #68776C; }
  .view-link { display: inline-flex; align-items: center; gap: 5px; color: #28794B; font-size: 11px; font-weight: 700; text-decoration: none; }
  .view-link:hover { text-decoration: underline; }
  .loading-row { height: 54px; }
  .loading-line { display: block; width: 65%; height: 10px; border-radius: 8px; background: #EDF1ED; animation: pulse 1.2s ease-in-out infinite alternate; }
  @keyframes pulse { to { opacity: .45; } }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 230px; text-align: center; white-space: normal; }
  .empty-icon { display: grid; place-items: center; width: 54px; height: 54px; margin-bottom: 12px; border-radius: 14px; background: #F0F6F0; color: #28794B; }
  .empty-state strong { color: #26382C; font-size: 13px; }
  .empty-state p { max-width: 270px; margin: 7px 0 13px; color: #68776C; font-size: 12px; line-height: 1.6; }
  .table-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 22px; border-top: 1px solid #EDF1ED; }
  .results-count { color: #68776C; font-size: 11px; }
  .pagination { display: flex; align-items: center; gap: 11px; color: #526357; font-size: 11px; }
  .pagination button { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid #DDE6DE; border-radius: 7px; background: white; color: #405448; cursor: pointer; }
  .pagination button:disabled { opacity: .35; cursor: not-allowed; }
  .page-note { margin: 0; color: #68776C; font-size: 11px; line-height: 1.6; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  @media (max-width: 700px) {
    .page-heading { align-items: flex-start; flex-direction: column; }
    .directory-heading { align-items: flex-start; padding: 18px 16px 15px; }
    .filters { grid-template-columns: 1fr; padding: 0 16px 16px; }
    .table-footer { align-items: flex-start; flex-direction: column; padding: 14px 16px; }
    th:first-child, td:first-child { padding-left: 16px; }
    th:last-child, td:last-child { padding-right: 16px; }
    .error-banner { margin-right: 16px; margin-left: 16px; }
  }
</style>

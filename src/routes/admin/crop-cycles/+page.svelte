
<script>
  import { onMount } from "svelte";
  import {
    Search,
    Sprout,
    Wheat,
    UserRound,
    Phone,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    RefreshCw,
    X,
    CheckCircle2,
    Clock3,
    Tractor
  } from "lucide-svelte";

  const API_BASE = (
    import.meta.env.VITE_API_URL || "http://localhost:7000"
  ).replace(/\/$/, "");

  let cropCycles = $state([]);
  let loading = $state(true);
  let errorMessage = $state("");

  let searchInput = $state("");
  let appliedSearch = $state("");

  let cropInput = $state("");
  let appliedCrop = $state("");

  let statusFilter = $state("");
  let appliedStatus = $state("");

  let page = $state(1);
  const limit = 20;

  let pagination = $state({
    total: 0,
    page: 1,
    limit,
    totalPages: 0
  });

  let summary = $state({
    totalCropCycles: 0,
    active: 0,
    completed: 0
  });

  const hasFilters = $derived(
    Boolean(appliedSearch || appliedCrop || appliedStatus)
  );

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "short",
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

  async function loadCropCycles() {
    loading = true;
    errorMessage = "";

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (appliedSearch.trim()) {
      params.set("search", appliedSearch.trim());
    }

    if (appliedCrop.trim()) {
      params.set("crop", appliedCrop.trim());
    }

    if (appliedStatus) {
      params.set("status", appliedStatus);
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/crop-cycles?${params.toString()}`,
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
          result.message ||
          `Crop-cycle request failed (${response.status})`
        );
      }

      cropCycles = result.cropCycles || [];

      pagination = result.pagination || {
        total: cropCycles.length,
        page,
        limit,
        totalPages: cropCycles.length ? 1 : 0
      };

      summary = result.summary || {
        totalCropCycles: 0,
        active: 0,
        completed: 0
      };
    } catch (error) {
      console.error("Failed to load crop cycles:", error);

      errorMessage =
        error.message || "Unable to load crop cycles. Please try again.";

      cropCycles = [];
    } finally {
      loading = false;
    }
  }

  function applyFilters() {
    page = 1;
    appliedSearch = searchInput;
    appliedCrop = cropInput;
    appliedStatus = statusFilter;

    loadCropCycles();
  }

  function clearFilters() {
    searchInput = "";
    appliedSearch = "";

    cropInput = "";
    appliedCrop = "";

    statusFilter = "";
    appliedStatus = "";

    page = 1;
    loadCropCycles();
  }

  function goToPage(nextPage) {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === page
    ) {
      return;
    }

    page = nextPage;
    loadCropCycles();
  }

  onMount(loadCropCycles);
</script>

<svelte:head>
  <title>AgriMama | Crop Management</title>
  <meta
    name="description"
    content="Monitor crop cycles, planting progress and farmer activity in AgriMama."
  />
</svelte:head>

<div class="crops-page">
  <div class="page-heading">
    <div>
      <div class="eyebrow">PLATFORM MANAGEMENT</div>
      <h1>Crop Management</h1>
      <p>
        Monitor registered crop cycles, planting progress and crop activity
        across farms.
      </p>
    </div>

    <button
      class="refresh-button"
      onclick={loadCropCycles}
      disabled={loading}
    >
      <RefreshCw size={16} class={loading ? "spinning" : ""} />
      Refresh
    </button>
  </div>

  <!-- Summary cards -->
  <section class="summary-grid">
    <div class="summary-card">
      <div class="summary-icon total-icon">
        <Wheat size={22} />
      </div>
      <div>
        <div class="summary-label">Total crop cycles</div>
        <div class="summary-value">
          {loading && summary.totalCropCycles === 0
            ? "…"
            : summary.totalCropCycles.toLocaleString()}
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-icon active-icon">
        <Sprout size={22} />
      </div>
      <div>
        <div class="summary-label">Active cycles</div>
        <div class="summary-value">
          {loading && summary.active === 0
            ? "…"
            : summary.active.toLocaleString()}
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-icon completed-icon">
        <CheckCircle2 size={22} />
      </div>
      <div>
        <div class="summary-label">Completed cycles</div>
        <div class="summary-value">
          {loading && summary.completed === 0
            ? "…"
            : summary.completed.toLocaleString()}
        </div>
      </div>
    </div>
  </section>

  <!-- Crop directory -->
  <section class="directory-panel">
    <div class="directory-heading">
      <div>
        <h2>Crop cycle directory</h2>
        <p>
          Search by crop, farm, farmer or phone number and filter by status.
        </p>
      </div>

      {#if hasFilters}
        <button class="clear-button" onclick={clearFilters}>
          <X size={14} />
          Clear filters
        </button>
      {/if}
    </div>

    <!-- Filters -->
    <form
      class="filters"
      onsubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
    >
      <label class="search-field">
        <span class="sr-only">Search crop cycles</span>
        <Search size={18} />
        <input
          bind:value={searchInput}
          placeholder="Search farm, farmer or phone number..."
          autocomplete="off"
        />
      </label>

      <label class="filter-field">
        <span class="sr-only">Filter by crop</span>
        <Wheat size={16} />
        <input
          bind:value={cropInput}
          placeholder="Crop type..."
          autocomplete="off"
        />
      </label>

      <label class="filter-field">
        <span class="sr-only">Filter by status</span>
        <select bind:value={statusFilter}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <button
        class="search-button"
        type="submit"
        disabled={loading}
      >
        <Search size={16} />
        Apply filters
      </button>
    </form>

    {#if errorMessage}
      <div class="error-banner" role="alert">
        <span>{errorMessage}</span>
        <button onclick={loadCropCycles}>Try again</button>
      </div>
    {/if}

    <!-- Table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Crop</th>
            <th>Farm</th>
            <th>Farmer</th>
            <th>Planting date</th>
            <th>Current stage</th>
            <th>Status</th>
            <th>
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {#if loading}
            {#each [1, 2, 3, 4, 5] as item}
              <tr>
                <td colspan="7" class="loading-row">
                  <span class="loading-line"></span>
                </td>
              </tr>
            {/each}
          {:else if cropCycles.length > 0}
            {#each cropCycles as cycle (cycle.id)}
              <tr>
                <td>
                  <div class="crop-cell">
                    <div class="crop-avatar">
                      <Sprout size={18} />
                    </div>

                    <div class="crop-name">
                      <strong>{cycle.crop || "Unknown crop"}</strong>
                      <small>{cycle.variety || "Variety not specified"}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="farm-cell">
                    <Tractor size={15} />
                    <strong>
                      {cycle.farm?.name || "Farm unavailable"}
                    </strong>
                  </div>
                </td>

                <td>
                  <div class="farmer-cell">
                    <strong>
                      {cycle.farm?.farmer?.name || "Farmer unavailable"}
                    </strong>

                    {#if cycle.farm?.farmer?.phone}
                      <small>
                        <Phone size={12} />
                        {cycle.farm.farmer.phone}
                      </small>
                    {/if}
                  </div>
                </td>

                <td>
                  <span class="date-cell">
                    <CalendarDays size={14} />
                    {formatDate(cycle.plantingDate)}
                  </span>
                </td>

                <td>
                  <span class="stage-cell">
                    <Clock3 size={14} />
                    {cycle.currentStage || "Not recorded"}
                  </span>
                </td>

                <td>
                  <span class={`status-badge ${statusClass(cycle.status)}`}>
                    {#if cycle.status === "completed"}
                      <CheckCircle2 size={13} />
                    {:else}
                      <Sprout size={13} />
                    {/if}
                    {formatStatus(cycle.status)}
                  </span>
                </td>

                <td>
                  <a
                    class="view-link"
                    href={`/admin/crop-cycles/${cycle.id}`}
                    aria-label={`View ${cycle.crop || "crop"} cycle details`}
                  >
                    <Eye size={16} />
                    View
                  </a>
                </td>
              </tr>
            {/each}
          {:else}
            <tr>
              <td colspan="7">
                <div class="empty-state">
                  <div class="empty-icon">
                    <Wheat size={27} />
                  </div>

                  <strong>No crop cycles found</strong>

                  <p>
                    {hasFilters
                      ? "Try changing your search terms or filters."
                      : "Registered crop cycles will appear here."}
                  </p>

                  {#if hasFilters}
                    <button
                      class="clear-button"
                      onclick={clearFilters}
                    >
                      Clear filters
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="table-footer">
      <div class="results-count">
        {#if pagination.total > 0}
          Showing {((page - 1) * limit) + 1}–{Math.min(
            page * limit,
            pagination.total
          )} of {pagination.total} crop cycles
        {:else}
          No crop-cycle records
        {/if}
      </div>

      <div class="pagination">
        <button
          aria-label="Previous page"
          onclick={() => goToPage(page - 1)}
          disabled={loading || page <= 1}
        >
          <ChevronLeft size={17} />
        </button>

        <span>
          Page {pagination.totalPages ? page : 0}
          of {pagination.totalPages}
        </span>

        <button
          aria-label="Next page"
          onclick={() => goToPage(page + 1)}
          disabled={loading || page >= pagination.totalPages}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  </section>

  <p class="page-note">
    Crop-cycle records are retrieved from the AgriMama admin API.
    This page is read-only and does not modify farmer crop records.
  </p>
</div>

<style>
  .crops-page {
    display: grid;
    gap: 22px;
  }

  .page-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .eyebrow {
    margin-bottom: 9px;
    color: #28794B;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.4px;
  }

  h1 {
    margin: 0 0 8px;
    color: #173F28;
    font-size: 30px;
    letter-spacing: -.8px;
  }

  .page-heading p,
  .directory-heading p {
    margin: 0;
    color: #526357;
    font-size: 13px;
    line-height: 1.6;
  }

  .refresh-button,
  .search-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 14px;
    border: 1px solid #DCE8DD;
    border-radius: 8px;
    background: white;
    color: #234C35;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
  }

  .refresh-button:disabled,
  .search-button:disabled {
    opacity: .6;
    cursor: wait;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px;
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
    padding: 17px 20px;
    border: 1px solid #E5ECE5;
    border-radius: 12px;
    background: white;
  }

  .summary-icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 11px;
  }

  .total-icon {
    background: #EDF6EE;
    color: #28794B;
  }

  .active-icon {
    background: #EEF5E9;
    color: #568A39;
  }

  .completed-icon {
    background: #EAF5EF;
    color: #24754A;
  }

  .summary-label {
    color: #526357;
    font-size: 12px;
  }

  .summary-value {
    margin-top: 3px;
    color: #173F28;
    font-size: 24px;
    font-weight: 750;
  }

  .directory-panel {
    min-width: 0;
    overflow: hidden;
    border: 1px solid #E5ECE5;
    border-radius: 13px;
    background: white;
  }

  .directory-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 22px 22px 18px;
  }

  .directory-heading h2 {
    margin: 0 0 6px;
    color: #173F28;
    font-size: 17px;
  }

  .filters {
    display: grid;
    grid-template-columns: minmax(220px, 1.5fr) minmax(130px, .8fr) minmax(130px, .7fr) auto;
    gap: 10px;
    padding: 0 22px 19px;
  }

  .search-field,
  .filter-field {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    height: 42px;
    padding: 0 11px;
    border: 1px solid #DDE6DE;
    border-radius: 8px;
    color: #68776C;
  }

  .search-field input,
  .filter-field input,
  .filter-field select {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #26382C;
    font: inherit;
    font-size: 12px;
  }

  .filter-field select {
    cursor: pointer;
  }

  .search-field:focus-within,
  .filter-field:focus-within {
    border-color: #6DAB7C;
    box-shadow: 0 0 0 2px #28794B18;
  }

  .search-button {
    border-color: #28794B;
    background: #28794B;
    color: white;
  }

  .search-button:hover:not(:disabled) {
    background: #1F633B;
  }

  .clear-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 9px;
    border: 0;
    border-radius: 6px;
    background: #F0F6F0;
    color: #28794B;
    font-size: 12px;
    font-weight: 650;
    cursor: pointer;
  }

  .error-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 22px 16px;
    padding: 12px 14px;
    border: 1px solid #F0C8C5;
    border-radius: 8px;
    background: #FFF4F3;
    color: #8B302A;
    font-size: 12px;
  }

  .error-banner button {
    border: 0;
    background: transparent;
    color: #8B302A;
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    white-space: nowrap;
  }

  thead {
    background: #F7F9F6;
  }

  th {
    padding: 12px 15px;
    color: #68776C;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: .5px;
    text-transform: uppercase;
  }

  th:first-child,
  td:first-child {
    padding-left: 22px;
  }

  th:last-child,
  td:last-child {
    padding-right: 22px;
  }

  td {
    padding: 14px 15px;
    border-top: 1px solid #EDF1ED;
    color: #405448;
    font-size: 12px;
  }

  .crop-cell,
  .farm-cell,
  .date-cell,
  .stage-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .crop-avatar {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #EDF6EE;
    color: #28794B;
  }

  .crop-name strong,
  .farmer-cell strong {
    display: block;
    color: #26382C;
    font-size: 12px;
    text-transform: capitalize;
  }

  .crop-name small {
    display: block;
    margin-top: 4px;
    color: #849087;
    font-size: 10px;
  }

  .farm-cell {
    color: #526357;
  }

  .farm-cell svg,
  .date-cell svg,
  .stage-cell svg {
    flex-shrink: 0;
    color: #849087;
  }

  .farmer-cell small {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 5px;
    color: #849087;
    font-size: 10px;
  }

  .date-cell,
  .stage-cell {
    color: #68776C;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
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

  .view-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #28794B;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
  }

  .view-link:hover {
    text-decoration: underline;
  }

  .loading-row {
    height: 54px;
  }

  .loading-line {
    display: block;
    width: 65%;
    height: 10px;
    border-radius: 8px;
    background: #EDF1ED;
    animation: pulse 1.2s ease-in-out infinite alternate;
  }

  @keyframes pulse {
    to { opacity: .45; }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 230px;
    text-align: center;
    white-space: normal;
  }

  .empty-icon {
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    margin-bottom: 12px;
    border-radius: 14px;
    background: #F0F6F0;
    color: #28794B;
  }

  .empty-state strong {
    color: #26382C;
    font-size: 13px;
  }

  .empty-state p {
    max-width: 270px;
    margin: 7px 0 13px;
    color: #68776C;
    font-size: 12px;
    line-height: 1.6;
  }

  .table-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 15px 22px;
    border-top: 1px solid #EDF1ED;
  }

  .results-count {
    color: #68776C;
    font-size: 11px;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 11px;
    color: #526357;
    font-size: 11px;
  }

  .pagination button {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border: 1px solid #DDE6DE;
    border-radius: 7px;
    background: white;
    color: #405448;
    cursor: pointer;
  }

  .pagination button:disabled {
    opacity: .35;
    cursor: not-allowed;
  }

  .page-note {
    margin: 0;
    color: #68776C;
    font-size: 11px;
    line-height: 1.6;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 1000px) {
    .filters {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 700px) {
    .page-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .directory-heading {
      align-items: flex-start;
      padding: 18px 16px 15px;
    }

    .filters {
      grid-template-columns: 1fr;
      padding: 0 16px 16px;
    }

    .table-footer {
      align-items: flex-start;
      flex-direction: column;
      padding: 14px 16px;
    }

    th:first-child,
    td:first-child {
      padding-left: 16px;
    }

    th:last-child,
    td:last-child {
      padding-right: 16px;
    }

    .error-banner {
      margin-right: 16px;
      margin-left: 16px;
    }
  }
</style>

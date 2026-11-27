
<script>
  import { onMount } from "svelte";
  import {
    Search,
    ClipboardList,
    UserRound,
    Phone,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    RefreshCw,
    X,
    Sprout,
    MessageSquareText,
    Bot
  } from "lucide-svelte";

  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"
  ).replace(/\/$/, "");

  let observations = $state([]);
  let loading = $state(true);
  let errorMessage = $state("");

  let searchInput = $state("");
  let appliedSearch = $state("");

  let categoryInput = $state("");
  let appliedCategory = $state("");

  let sourceFilter = $state("");
  let appliedSource = $state("");

  let page = $state(1);
  const limit = 20;

  let pagination = $state({
    total: 0,
    page: 1,
    limit,
    totalPages: 0
  });

  const hasFilters = $derived(
    Boolean(appliedSearch || appliedCategory || appliedSource)
  );

  const farmerReports = $derived(
    observations.filter((item) => item.source === "farmer").length
  );

  const aiReports = $derived(
    observations.filter((item) => item.source === "ai_interpreted").length
  );

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function formatSource(source) {
    if (source === "ai_interpreted") return "AI interpreted";
    if (source === "farmer") return "Farmer";
    return source || "Unknown";
  }

  function sourceClass(source) {
    if (source === "farmer") return "source-farmer";
    if (source === "ai_interpreted") return "source-ai";
    return "source-unknown";
  }

  function truncate(value, length = 90) {
    if (!value) return "No description available";
    return value.length > length
      ? `${value.slice(0, length)}...`
      : value;
  }

  async function loadObservations() {
    loading = true;
    errorMessage = "";

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (appliedSearch.trim()) {
      params.set("search", appliedSearch.trim());
    }

    if (appliedCategory.trim()) {
      params.set("category", appliedCategory.trim());
    }

    if (appliedSource) {
      params.set("source", appliedSource);
    }

    try {
      const response = await fetch(
        `${API_BASE}/admin/observations?${params.toString()}`,
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
          `Observation request failed (${response.status})`
        );
      }

      observations = result.observations || [];

      pagination = result.pagination || {
        total: observations.length,
        page,
        limit,
        totalPages: observations.length ? 1 : 0
      };
    } catch (error) {
      console.error("Failed to load observations:", error);

      errorMessage =
        error.message || "Unable to load observations. Please try again.";

      observations = [];
      pagination = {
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    } finally {
      loading = false;
    }
  }

  function applyFilters() {
    page = 1;
    appliedSearch = searchInput;
    appliedCategory = categoryInput;
    appliedSource = sourceFilter;

    loadObservations();
  }

  function clearFilters() {
    searchInput = "";
    appliedSearch = "";

    categoryInput = "";
    appliedCategory = "";

    sourceFilter = "";
    appliedSource = "";

    page = 1;
    loadObservations();
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
    loadObservations();
  }

  onMount(loadObservations);
</script>

<svelte:head>
  <title>AgriMama | Observations</title>
  <meta
    name="description"
    content="Review farmer observations and crop reports in AgriMama."
  />
</svelte:head>

<div class="observations-page">
  <div class="page-heading">
    <div>
      <div class="eyebrow">PLATFORM MANAGEMENT</div>
      <h1>Observations</h1>
      <p>
        Review farmer reports, crop conditions and field observations
        across registered farms.
      </p>
    </div>

    <button
      class="refresh-button"
      onclick={loadObservations}
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
        <ClipboardList size={22} />
      </div>
      <div>
        <div class="summary-label">Total observations</div>
        <div class="summary-value">
          {loading && pagination.total === 0
            ? "…"
            : pagination.total.toLocaleString()}
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-icon farmer-icon">
        <UserRound size={22} />
      </div>
      <div>
        <div class="summary-label">Farmer reports on this page</div>
        <div class="summary-value">
          {loading ? "…" : farmerReports.toLocaleString()}
        </div>
      </div>
    </div>

    <div class="summary-card">
      <div class="summary-icon ai-icon">
        <Bot size={22} />
      </div>
      <div>
        <div class="summary-label">AI interpreted on this page</div>
        <div class="summary-value">
          {loading ? "…" : aiReports.toLocaleString()}
        </div>
      </div>
    </div>
  </section>

  <!-- Observation directory -->
  <section class="directory-panel">
    <div class="directory-heading">
      <div>
        <h2>Observation directory</h2>
        <p>
          Search by farmer, farm, phone number or observation description.
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
        <span class="sr-only">Search observations</span>
        <Search size={18} />
        <input
          bind:value={searchInput}
          placeholder="Search farmer, farm, phone or description..."
          autocomplete="off"
        />
      </label>

      <label class="filter-field">
        <span class="sr-only">Filter by category</span>
        <ClipboardList size={16} />
        <input
          bind:value={categoryInput}
          placeholder="Category..."
          autocomplete="off"
        />
      </label>

      <label class="filter-field">
        <span class="sr-only">Filter by source</span>
        <select bind:value={sourceFilter}>
          <option value="">All sources</option>
          <option value="farmer">Farmer</option>
          <option value="ai_interpreted">AI interpreted</option>
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
        <button onclick={loadObservations}>Try again</button>
      </div>
    {/if}

    <!-- Table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Observation</th>
            <th>Farm</th>
            <th>Farmer</th>
            <th>Observed at</th>
            <th>Source</th>
            <th><span class="sr-only">Actions</span></th>
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
          {:else if observations.length > 0}
            {#each observations as item (item.id)}
              <tr>
                <td>
                  <div class="category-cell">
                    <div class="category-avatar">
                      <Sprout size={17} />
                    </div>
                    <strong>{item.category || "Uncategorised"}</strong>
                  </div>
                </td>

                <td class="observation-description">
                  {truncate(item.observation)}
                </td>

                <td>
                  <strong class="farm-name">
                    {item.farm?.name || "Farm unavailable"}
                  </strong>

                  {#if item.cropCycle?.crop}
                    <small class="crop-label">
                      {item.cropCycle.crop}
                      {#if item.cropCycle.variety}
                        · {item.cropCycle.variety}
                      {/if}
                    </small>
                  {/if}
                </td>

                <td>
                  <div class="farmer-cell">
                    <strong>
                      {item.farmer?.name || "Farmer unavailable"}
                    </strong>

                    {#if item.farmer?.phone}
                      <small>
                        <Phone size={12} />
                        {item.farmer.phone}
                      </small>
                    {/if}
                  </div>
                </td>

                <td>
                  <span class="date-cell">
                    <CalendarDays size={14} />
                    {formatDate(item.observedAt)}
                  </span>
                </td>

                <td>
                  <span class={`source-badge ${sourceClass(item.source)}`}>
                    {#if item.source === "ai_interpreted"}
                      <Bot size={13} />
                    {:else}
                      <UserRound size={13} />
                    {/if}
                    {formatSource(item.source)}
                  </span>
                </td>

                <td>
                  <a
                    class="view-link"
                    href={`/admin/observations/${item.id}`}
                  >
                    <Eye size={15} />
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
                    <MessageSquareText size={25} />
                  </div>
                  <strong>No observations found</strong>
                  <p>
                    No observations match your current search or filters.
                  </p>

                  {#if hasFilters}
                    <button class="clear-button" onclick={clearFilters}>
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
        Showing {observations.length ? (page - 1) * limit + 1 : 0}
        –
        {(page - 1) * limit + observations.length}
        of {pagination.total} observations
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
    Observation records are retrieved from the AgriMama admin API.
    This page is read-only and does not modify farmer observations.
  </p>
</div>

<style>
  .observations-page {
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

  .farmer-icon {
    background: #EEF5E9;
    color: #568A39;
  }

  .ai-icon {
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

  .category-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .category-avatar {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #EDF6EE;
    color: #28794B;
  }

  .category-cell strong,
  .farm-name,
  .farmer-cell strong {
    color: #26382C;
    font-size: 12px;
    text-transform: capitalize;
  }

  .observation-description {
    max-width: 260px;
    min-width: 180px;
    white-space: normal;
    line-height: 1.5;
  }

  .crop-label {
    display: block;
    margin-top: 5px;
    color: #849087;
    font-size: 10px;
    text-transform: capitalize;
  }

  .farmer-cell strong {
    display: block;
  }

  .farmer-cell small {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 5px;
    color: #849087;
    font-size: 10px;
  }

  .date-cell {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #68776C;
  }

  .date-cell svg {
    flex-shrink: 0;
    color: #849087;
  }

  .source-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
  }

  .source-farmer {
    background: #EDF6EE;
    color: #28794B;
  }

  .source-ai {
    background: #EEF2FA;
    color: #526A9A;
  }

  .source-unknown {
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

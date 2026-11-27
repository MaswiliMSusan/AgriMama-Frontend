
<script>
  import { onMount } from "svelte";
  import {
    Users,
    House,
    Sprout,
    ClipboardList,
    TrendingUp,
    CalendarDays,
    RefreshCw,
    BarChart3,
    Globe,
    MessageSquare,
    Activity,
    AlertCircle,
    CheckCircle2,
  } from "lucide-svelte";

  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"
  ).replace(/\/$/, "");

  let analytics = $state(null);
  let loading = $state(true);
  let error = $state("");
  let fromDate = $state("");
  let toDate = $state("");
  let lastUpdated = $state(null);

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function setDefaultDates() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 29);

    fromDate = localDateString(start);
    toDate = localDateString(today);
  }

  async function loadAnalytics() {
    if (!fromDate || !toDate) {
      error = "Please select both dates.";
      return;
    }

    if (fromDate > toDate) {
      error = "The start date cannot be after the end date.";
      return;
    }

    loading = true;
    error = "";

    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
      });

      const response = await fetch(
        `${API_BASE}/api/admin/analytics/overview?${params}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load analytics."
        );
      }

      analytics = result;
      lastUpdated = new Date();
    } catch (err) {
      error = err.message || "Something went wrong loading analytics.";
    } finally {
      loading = false;
    }
  }

  function formatNumber(value) {
    return new Intl.NumberFormat().format(Number(value || 0));
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function titleCase(value) {
    if (!value) return "Unknown";

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function languageLabel(value) {
    const normalized = String(value || "").toLowerCase().trim();

    const labels = {
      en: "English",
      english: "English",
      swahili: "Kiswahili",
      kiswahili: "Kiswahili",
      dholuo: "Dholuo",
      luo: "Dholuo",
    };

    return labels[normalized] || titleCase(value);
  }

  const summary = $derived(analytics?.summary || {});

  const trends = $derived(analytics?.trends || []);

  const maxTrendValue = $derived(
    Math.max(
      1,
      ...trends.map((item) =>
        Math.max(
          item.farmerRegistrations || 0,
          item.observations || 0
        )
      )
    )
  );

  const cropDistribution = $derived.by(() => {
    const rows = analytics?.distributions?.crops || [];
    const grouped = new Map();

    for (const row of rows) {
      const original = String(row.crop || "Unknown")
        .toLowerCase()
        .trim();

      // Display known spelling variations consistently.
      const normalized = original === "maized" ? "maize" : original;

      grouped.set(
        normalized,
        (grouped.get(normalized) || 0) + Number(row.total || 0)
      );
    }

    return [...grouped.entries()]
      .map(([crop, total]) => ({
        label: titleCase(crop),
        total,
      }))
      .sort((a, b) => b.total - a.total);
  });

  const categoryDistribution = $derived(
    (analytics?.distributions?.observationCategories || []).map(
      (item) => ({
        label: titleCase(item.category),
        total: Number(item.total || 0),
      })
    )
  );

  const sourceDistribution = $derived(
    (analytics?.distributions?.observationSources || []).map(
      (item) => ({
        label: titleCase(item.source),
        total: Number(item.total || 0),
      })
    )
  );

  const languageDistribution = $derived.by(() => {
    const rows =
      analytics?.distributions?.observationLanguages || [];

    const grouped = new Map();

    for (const row of rows) {
      const label = languageLabel(row.language);

      grouped.set(
        label,
        (grouped.get(label) || 0) + Number(row.total || 0)
      );
    }

    return [...grouped.entries()]
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total);
  });

  function distributionPercentage(value, rows) {
    const total = rows.reduce(
      (sum, item) => sum + item.total,
      0
    );

    return total ? (value / total) * 100 : 0;
  }

  function chartHeight(value) {
    return `${Math.max(
      value > 0 ? 4 : 0,
      (value / maxTrendValue) * 100
    )}%`;
  }

  onMount(() => {
    setDefaultDates();
    loadAnalytics();
  });
</script>

<svelte:head>
  <title>Analytics | AgriMama</title>
  <meta
    name="description"
    content="AgriMama agricultural programme analytics and insights."
  />
</svelte:head>

<div class="analytics-page">
  <div class="page-header">
    <div>
      <div class="eyebrow">
        <BarChart3 size={15} />
        PROGRAMME INSIGHTS
      </div>

      <h1>Analytics</h1>

      <p>
        Monitor farmer activity, agricultural production and
        community observations.
      </p>
    </div>

    <button
      class="refresh-button"
      onclick={loadAnalytics}
      disabled={loading}
    >
      <RefreshCw size={16} class={loading ? "spin" : ""} />
      Refresh
    </button>
  </div>

  <section class="filter-panel">
    <div class="filter-heading">
      <CalendarDays size={18} />
      <span>Date range</span>
    </div>

    <div class="date-filters">
      <label>
        <span>From</span>
        <input
          type="date"
          bind:value={fromDate}
          max={toDate || undefined}
        />
      </label>

      <label>
        <span>To</span>
        <input
          type="date"
          bind:value={toDate}
          min={fromDate || undefined}
        />
      </label>

      <button
        class="apply-button"
        onclick={loadAnalytics}
        disabled={loading}
      >
        Apply filters
      </button>
    </div>
  </section>

  {#if error}
    <div class="error-panel">
      <AlertCircle size={19} />
      <div>
        <strong>Unable to load analytics</strong>
        <p>{error}</p>
      </div>
      <button onclick={loadAnalytics}>Try again</button>
    </div>
  {/if}

  {#if loading && !analytics}
    <div class="loading-panel">
      <RefreshCw size={25} class="spin" />
      <p>Loading programme analytics...</p>
    </div>
  {:else if analytics}
    <div class:refreshing={loading} class="analytics-content">

      <div class="section-heading">
        <div>
          <h2>Programme overview</h2>
          <p>
            Your current agricultural programme statistics
          </p>
        </div>

        <span class="period-label">
          {formatDate(analytics.period.from)}
          –
          {formatDate(analytics.period.to)}
        </span>
      </div>

      <!-- KPI cards -->
      <section class="stats-grid">
        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon farmers">
              <Users size={21} />
            </div>
            <span class="stat-caption">All time</span>
          </div>

          <div class="stat-value">
            {formatNumber(summary.totalFarmers)}
          </div>

          <div class="stat-label">Registered farmers</div>

          <div class="stat-footer">
            <TrendingUp size={14} />
            {formatNumber(summary.newFarmers)} new in selected period
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon farms">
              <House size={21} />
            </div>
            <span class="stat-caption">All time</span>
          </div>

          <div class="stat-value">
            {formatNumber(summary.totalFarms)}
          </div>

          <div class="stat-label">Registered farms</div>

          <div class="stat-footer">
            {Number(summary.totalAcreageAcres || 0).toLocaleString(
              "en-GB",
              { maximumFractionDigits: 2 }
            )}
            acres recorded
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon crops">
              <Sprout size={21} />
            </div>
            <span class="stat-caption">All time</span>
          </div>

          <div class="stat-value">
            {formatNumber(summary.totalCropCycles)}
          </div>

          <div class="stat-label">Crop cycles</div>

          <div class="stat-footer">
            <CheckCircle2 size={14} />
            {formatNumber(summary.activeCropCycles)} active
          </div>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <div class="stat-icon observations">
              <ClipboardList size={21} />
            </div>
            <span class="stat-caption">All time</span>
          </div>

          <div class="stat-value">
            {formatNumber(summary.totalObservations)}
          </div>

          <div class="stat-label">Farmer observations</div>

          <div class="stat-footer">
            <Activity size={14} />
            {formatNumber(summary.observationsInPeriod)}
            in selected period
          </div>
        </article>
      </section>

      <!-- Activity trends -->
      <section class="panel trend-panel">
        <div class="panel-heading">
          <div>
            <h2>Activity trends</h2>
            <p>Daily farmer registrations and observations</p>
          </div>

          <div class="legend">
            <span>
              <i class="legend-dot registration-dot"></i>
              Registrations
            </span>
            <span>
              <i class="legend-dot observation-dot"></i>
              Observations
            </span>
          </div>
        </div>

        {#if trends.length > 0}
          <div class="trend-chart">
            <div class="y-labels">
              <span>{maxTrendValue}</span>
              <span>{Math.round(maxTrendValue / 2)}</span>
              <span>0</span>
            </div>

            <div class="chart-area">
              <div class="chart-grid">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div class="bar-groups">
                {#each trends as item, index}
                  <div
                    class="bar-group"
                    title={`${formatDate(item.date)}: ${item.farmerRegistrations} registrations, ${item.observations} observations`}
                  >
                    <div class="bars">
                      <div class="bar registration-bar"
                        style={`height:${chartHeight(item.farmerRegistrations)}`}
                      ></div>

                      <div class="bar observation-bar"
                        style={`height:${chartHeight(item.observations)}`}
                      ></div>
                    </div>

                    {#if index % 5 === 0 || index === trends.length - 1}
                      <span class="bar-date">
                        {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" }
                        )}
                      </span>
                    {:else}
                      <span class="bar-date empty-date"></span>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {:else}
          <div class="empty-state">No activity recorded in this period.</div>
        {/if}
      </section>

      <!-- Distributions -->
      <div class="distribution-grid">

        <section class="panel distribution-panel">
          <div class="panel-heading">
            <div>
              <h2>Crop distribution</h2>
              <p>Crop cycles by crop type</p>
            </div>
            <Sprout size={20} class="heading-icon" />
          </div>

          {#if cropDistribution.length}
            <div class="distribution-list">
              {#each cropDistribution as item}
                <div class="distribution-item">
                  <div class="distribution-label">
                    <strong>{item.label}</strong>
                    <span>{item.total}</span>
                  </div>

                  <div class="progress-track">
                    <div
                      class="progress-fill crop-fill"
                      style={`width:${distributionPercentage(item.total, cropDistribution)}%`}
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-state">No crop data available.</div>
          {/if}
        </section>

        <section class="panel distribution-panel">
          <div class="panel-heading">
            <div>
              <h2>Observation categories</h2>
              <p>Reports grouped by category</p>
            </div>
            <ClipboardList size={20} class="heading-icon" />
          </div>

          {#if categoryDistribution.length}
            <div class="distribution-list">
              {#each categoryDistribution as item}
                <div class="distribution-item">
                  <div class="distribution-label">
                    <strong>{item.label}</strong>
                    <span>{item.total}</span>
                  </div>

                  <div class="progress-track">
                    <div
                      class="progress-fill category-fill"
                      style={`width:${distributionPercentage(item.total, categoryDistribution)}%`}
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-state">No observation categories available.</div>
          {/if}
        </section>

        <section class="panel distribution-panel">
          <div class="panel-heading">
            <div>
              <h2>Observation sources</h2>
              <p>Where observations originate</p>
            </div>
            <MessageSquare size={20} class="heading-icon" />
          </div>

          {#if sourceDistribution.length}
            <div class="distribution-list">
              {#each sourceDistribution as item}
                <div class="distribution-item">
                  <div class="distribution-label">
                    <strong>{item.label}</strong>
                    <span>{item.total}</span>
                  </div>

                  <div class="progress-track">
                    <div
                      class="progress-fill source-fill"
                      style={`width:${distributionPercentage(item.total, sourceDistribution)}%`}
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-state">No source data available.</div>
          {/if}
        </section>

        <section class="panel distribution-panel">
          <div class="panel-heading">
            <div>
              <h2>Languages</h2>
              <p>Languages used in observations</p>
            </div>
            <Globe size={20} class="heading-icon" />
          </div>

          {#if languageDistribution.length}
            <div class="distribution-list">
              {#each languageDistribution as item}
                <div class="distribution-item">
                  <div class="distribution-label">
                    <strong>{item.label}</strong>
                    <span>{item.total}</span>
                  </div>

                  <div class="progress-track">
                    <div
                      class="progress-fill language-fill"
                      style={`width:${distributionPercentage(item.total, languageDistribution)}%`}
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-state">No language data available.</div>
          {/if}
        </section>

      </div>

      <div class="footer-note">
        <div>
          <CheckCircle2 size={15} />
          Analytics loaded successfully
        </div>

        {#if lastUpdated}
          <span>
            Last updated:
            {lastUpdated.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .analytics-page {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
    padding: 30px 36px 45px;
    color: #24352c;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 26px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #39835b;
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 1.2px;
    margin-bottom: 9px;
  }

  h1 {
    margin: 0;
    color: #203a2b;
    font-size: 29px;
    font-weight: 750;
    letter-spacing: -0.8px;
  }

  .page-header p,
  .section-heading p,
  .panel-heading p {
    margin: 7px 0 0;
    color: #819087;
    font-size: 13px;
  }

  .refresh-button,
  .apply-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 0;
    border-radius: 9px;
    padding: 11px 17px;
    background: #347c52;
    color: white;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    transition: background 0.2s;
  }

  .refresh-button:hover,
  .apply-button:hover {
    background: #28633f;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .filter-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 17px 20px;
    margin-bottom: 28px;
    border: 1px solid #e9eee9;
    border-radius: 12px;
    background: white;
  }

  .filter-heading {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #466a54;
    font-size: 13px;
    font-weight: 700;
  }

  .date-filters {
    display: flex;
    align-items: flex-end;
    gap: 12px;
  }

  .date-filters label {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .date-filters label span {
    color: #718077;
    font-size: 11px;
    font-weight: 650;
  }

  .date-filters input {
    min-width: 145px;
    padding: 9px 10px;
    border: 1px solid #e0e8e1;
    border-radius: 7px;
    background: #fff;
    color: #354b3c;
    font-size: 12px;
  }

  .apply-button {
    padding: 10px 16px;
    font-size: 12px;
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 17px;
  }

  h2 {
    margin: 0;
    color: #294232;
    font-size: 16px;
    font-weight: 730;
  }

  .period-label {
    padding: 7px 11px;
    border-radius: 7px;
    background: #edf5ef;
    color: #437451;
    font-size: 11px;
    font-weight: 650;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 17px;
    margin-bottom: 23px;
  }

  .stat-card {
    padding: 19px;
    border: 1px solid #e9eee9;
    border-radius: 12px;
    background: white;
    min-width: 0;
    box-shadow: 0 2px 8px rgba(36, 62, 44, 0.025);
  }

  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .stat-icon {
    display: grid;
    place-items: center;
    width: 41px;
    height: 41px;
    border-radius: 10px;
  }

  .farmers {
    background: #eaf3ed;
    color: #43845b;
  }

  .farms {
    background: #edf1e8;
    color: #70884a;
  }

  .crops {
    background: #f0f3e7;
    color: #8a9548;
  }

  .observations {
    background: #eaf1f4;
    color: #557d91;
  }

  .stat-caption {
    color: #95a198;
    font-size: 10px;
    font-weight: 650;
  }

  .stat-value {
    color: #263d2e;
    font-size: 29px;
    font-weight: 760;
    line-height: 1.2;
    letter-spacing: -0.8px;
  }

  .stat-label {
    margin-top: 5px;
    color: #748279;
    font-size: 12px;
  }

  .stat-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 17px;
    color: #558165;
    font-size: 11px;
    font-weight: 600;
  }

  .panel {
    padding: 21px;
    border: 1px solid #e9eee9;
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(36, 62, 44, 0.025);
  }

  .trend-panel {
    margin-bottom: 22px;
  }

  .panel-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 24px;
  }

  .heading-icon {
    color: #71977b;
  }

  .legend {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .legend span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #718077;
    font-size: 11px;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .registration-dot {
    background: #42865c;
  }

  .observation-dot {
    background: #d4a65b;
  }

  .trend-chart {
    display: flex;
    height: 235px;
    padding-top: 8px;
  }

  .y-labels {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    padding-bottom: 25px;
    color: #a1aaa3;
    font-size: 10px;
  }

  .chart-area {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
  }

  .chart-grid {
    position: absolute;
    inset: 0 0 25px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
  }

  .chart-grid span {
    border-top: 1px dashed #e9eee9;
  }

  .bar-groups {
    position: relative;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    height: 100%;
    gap: 3px;
  }

  .bar-group {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
    height: 100%;
  }

  .bars {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;
    width: 100%;
    height: calc(100% - 25px);
  }

  .bar {
    width: min(40%, 12px);
    min-height: 0;
    border-radius: 3px 3px 0 0;
    transition: height 0.25s ease;
  }

  .registration-bar {
    background: #42865c;
  }

  .observation-bar {
    background: #d4a65b;
  }

  .bar-date {
    height: 25px;
    padding-top: 7px;
    color: #89958d;
    font-size: 9px;
    white-space: nowrap;
  }

  .empty-date {
    visibility: hidden;
  }

  .distribution-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .distribution-panel {
    min-width: 0;
    min-height: 225px;
  }

  .distribution-panel .panel-heading {
    margin-bottom: 22px;
  }

  .distribution-list {
    display: flex;
    flex-direction: column;
    gap: 17px;
  }

  .distribution-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 7px;
  }

  .distribution-label strong {
    color: #53645a;
    font-size: 12px;
    font-weight: 620;
  }

  .distribution-label span {
    color: #718077;
    font-size: 12px;
    font-weight: 700;
  }

  .progress-track {
    width: 100%;
    height: 7px;
    overflow: hidden;
    border-radius: 10px;
    background: #edf1ed;
  }

  .progress-fill {
    height: 100%;
    min-width: 0;
    border-radius: 10px;
  }

  .crop-fill {
    background: #63916a;
  }

  .category-fill {
    background: #d1a15d;
  }

  .source-fill {
    background: #7396a3;
  }

  .language-fill {
    background: #8b9a67;
  }

  .empty-state {
    display: grid;
    place-items: center;
    min-height: 120px;
    color: #9aa59d;
    font-size: 12px;
  }

  .footer-note {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-top: 21px;
    color: #89968d;
    font-size: 11px;
  }

  .footer-note div {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #52805e;
  }

  .error-panel {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid #f0d7d3;
    border-radius: 10px;
    background: #fff8f7;
    color: #a34c40;
  }

  .error-panel p {
    margin: 4px 0 0;
    font-size: 12px;
  }

  .error-panel button {
    margin-left: auto;
    padding: 8px 12px;
    border: 1px solid #e9c5bf;
    border-radius: 7px;
    background: white;
    color: #9b5146;
    cursor: pointer;
    font-size: 11px;
  }

  .loading-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 13px;
    color: #568065;
  }

  .loading-panel p {
    color: #849188;
    font-size: 13px;
  }

  .refreshing {
    opacity: 0.6;
    pointer-events: none;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1100px) {
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .analytics-page {
      padding: 22px 18px 35px;
    }

    .filter-panel {
      align-items: flex-start;
      flex-direction: column;
    }

    .date-filters {
      width: 100%;
      flex-wrap: wrap;
    }

    .date-filters label {
      flex: 1;
      min-width: 120px;
    }

    .date-filters input {
      width: 100%;
      min-width: 0;
    }

    .distribution-grid {
      grid-template-columns: 1fr;
    }

    .section-heading {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 480px) {
    .page-header {
      align-items: flex-start;
    }

    .page-header h1 {
      font-size: 25px;
    }

    .refresh-button {
      padding: 9px 11px;
      font-size: 11px;
    }

    .stats-grid {
      gap: 10px;
    }

    .stat-card {
      padding: 14px;
    }

    .stat-value {
      font-size: 24px;
    }

    .stat-footer {
      font-size: 10px;
    }

    .panel {
      padding: 15px;
    }

    .panel-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .trend-chart {
      height: 190px;
    }

    .legend {
      gap: 10px;
    }

    .footer-note {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>

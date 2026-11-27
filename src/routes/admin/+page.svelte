<script>
  import { onMount } from "svelte";
  import {
    Users,
    UserRoundCheck,
    MessageCircle,
    MessagesSquare,
    ArrowDownLeft,
    ArrowUpRight,
    RefreshCw,
    Sprout
  } from "lucide-svelte";

  // Set VITE_API_BASE_URL in your frontend environment if your backend
  // is hosted somewhere other than http://localhost:7000.
  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"
  ).replace(/\/$/, "");

  let overview = $state(null);
  let engagement = $state([]);
  let selectedDays = $state(7);
  let loading = $state(true);
  let engagementLoading = $state(false);
  let errorMessage = $state("");

  const stats = $derived(
    overview
      ? [
          {
            label: "Registered farmers",
            value: overview.registeredFarmers,
            note: "All registered farmer accounts",
            icon: Users
          },
          {
            label: "Active farmers",
            value: overview.activeFarmers,
            note: "Farmers with conversations in the last 30 days",
            icon: UserRoundCheck
          },
          {
            label: "Questions asked",
            value: overview.questionsAsked,
            note: "Total recorded conversations",
            icon: MessageCircle
          },
          {
            label: "Responses generated",
            value: overview.responsesGenerated,
            note: "Conversations with a generated answer",
            icon: MessagesSquare
          }
        ]
      : []
  );

  const maxEngagement = $derived(
    Math.max(
      1,
      ...engagement.map((item) =>
        Math.max(item.questionsAsked || 0, item.responsesGenerated || 0)
      )
    )
  );

  function formatDate(dateString) {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short"
    }).format(new Date(`${dateString}T00:00:00`));
  }

  async function loadOverview() {
    loading = true;
    errorMessage = "";

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/dashboard/overview`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Dashboard request failed (${response.status})`);
      }

      overview = result.overview;
    } catch (error) {
      console.error("Failed to load dashboard overview:", error);
      errorMessage =
        error.message || "Unable to load dashboard data. Please try again.";
    } finally {
      loading = false;
    }
  }

  async function loadEngagement(days = selectedDays) {
    engagementLoading = true;

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/dashboard/engagement?days=${days}`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Engagement request failed (${response.status})`);
      }

      engagement = result.engagement || [];
    } catch (error) {
      console.error("Failed to load engagement:", error);
      engagement = [];
      errorMessage =
        error.message || "Unable to load engagement data.";
    } finally {
      engagementLoading = false;
    }
  }

  async function refreshDashboard() {
    await Promise.all([loadOverview(), loadEngagement(selectedDays)]);
  }

  async function changePeriod(days) {
    selectedDays = days;
    await loadEngagement(days);
  }

  onMount(() => {
    refreshDashboard();
  });
</script>

<svelte:head>
  <title>AgriMama | Admin Dashboard</title>
  <meta
    name="description"
    content="AgriMama agricultural advisory administration dashboard"
  />
</svelte:head>

<div class="dashboard">
  <div class="page-heading">
    <div>
      <div class="eyebrow">AGRIMAMA OVERVIEW</div>
      <h1>Dashboard</h1>
      <p>Monitor farmer engagement and agricultural advisory activity.</p>
    </div>

    <button class="refresh-button" onclick={refreshDashboard} disabled={loading || engagementLoading}>
      <RefreshCw size={16} class={loading || engagementLoading ? "spinning" : ""} />
      Refresh
    </button>
  </div>

  {#if errorMessage}
    <div class="error-banner" role="alert">
      <span>{errorMessage}</span>
      <button onclick={refreshDashboard}>Try again</button>
    </div>
  {/if}

  <section class="welcome-card">
    <div class="welcome-content">
      <span class="welcome-tag">PLATFORM OVERVIEW</span>
      <h2>Empowering farmers through better information.</h2>
      <p>
        A connected platform for farmer support, agricultural questions
        and timely advisory responses.
      </p>
      <div class="welcome-location">
        <Sprout size={18} />
        AgriMama · Farmer Advisory Platform
      </div>
    </div>
    <div class="welcome-decoration" aria-hidden="true">
      <Sprout size={145} strokeWidth={0.8} />
    </div>
  </section>

  <section class="stats-grid" aria-label="Dashboard statistics">
    {#if loading && !overview}
      {#each [1, 2, 3, 4] as item}
        <div class="stat-card loading-card">
          <div class="skeleton icon-skeleton"></div>
          <div class="skeleton value-skeleton"></div>
          <div class="skeleton label-skeleton"></div>
        </div>
      {/each}
    {:else if overview}
      {#each stats as stat}
        <article class="stat-card">
          <div class="stat-header">
            <div class="stat-icon"><stat.icon size={21} strokeWidth={1.8} /></div>
          </div>
          <div class="stat-value">{Number(stat.value ?? 0).toLocaleString()}</div>
          <div class="stat-label">{stat.label}</div>
          <div class="stat-note">{stat.note}</div>
        </article>
      {/each}
    {:else}
      <div class="empty-card">Dashboard statistics are not available.</div>
    {/if}
  </section>

  {#if overview}
    <section class="sms-section">
      <div class="section-heading">
        <div>
          <h2>SMS activity</h2>
          <p>Messages recorded by the platform</p>
        </div>
        <span class="section-tag">SMS</span>
      </div>

      <div class="sms-grid">
        <div class="sms-card">
          <div class="sms-icon incoming"><ArrowDownLeft size={20} /></div>
          <div>
            <div class="sms-number">{Number(overview.sms?.incoming ?? 0).toLocaleString()}</div>
            <div class="sms-label">Incoming messages</div>
            <div class="sms-note">Messages received from farmers</div>
          </div>
        </div>

        <div class="sms-card">
          <div class="sms-icon outgoing"><ArrowUpRight size={20} /></div>
          <div>
            <div class="sms-number">{Number(overview.sms?.outgoing ?? 0).toLocaleString()}</div>
            <div class="sms-label">Outgoing messages</div>
            <div class="sms-note">Messages sent by the assistant</div>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <section class="panel engagement-panel">
    <div class="section-heading engagement-heading">
      <div>
        <h2>Farmer engagement</h2>
        <p>Questions asked and responses generated over time</p>
      </div>

      <div class="period-selector" aria-label="Engagement period">
        {#each [7, 30, 90] as days}
          <button
            class:chosen={selectedDays === days}
            onclick={() => changePeriod(days)}
            disabled={engagementLoading}
          >
            {days} days
          </button>
        {/each}
      </div>
    </div>

    {#if engagementLoading && engagement.length === 0}
      <div class="chart-message">Loading engagement data…</div>
    {:else if engagement.length > 0}
      <div class="chart-legend">
        <span><i class="legend-dot questions"></i> Questions asked</span>
        <span><i class="legend-dot responses"></i> Responses generated</span>
      </div>

      <div class="chart" aria-label={`Daily questions and responses for the last ${selectedDays} days`}>
        {#each engagement as day}
          <div class="chart-column" title={`${formatDate(day.date)}: ${day.questionsAsked} questions, ${day.responsesGenerated} responses`}>
            <div class="bars">
              <div
                class="bar questions"
                style={`height: ${Math.max(day.questionsAsked ? 3 : 0, (day.questionsAsked / maxEngagement) * 100)}%`}
              ></div>
              <div
                class="bar responses"
                style={`height: ${Math.max(day.responsesGenerated ? 3 : 0, (day.responsesGenerated / maxEngagement) * 100)}%`}
              ></div>
            </div>
            <span class="chart-date">{formatDate(day.date)}</span>
          </div>
        {/each}
      </div>
      <div class="chart-footnote">Daily totals · Select 7, 30 or 90 days to change the period</div>
    {:else}
      <div class="chart-message">No engagement data is available for this period.</div>
    {/if}
  </section>

  <div class="data-note">
    Dashboard figures are loaded from the AgriMama backend. Active farmers are defined by the backend as farmers with conversations in the last 30 days.
  </div>
</div>

<style>
  .dashboard { display: grid; gap: 24px; }

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
    font-weight: 750;
    letter-spacing: -0.8px;
  }

  .page-heading p, .section-heading p {
    margin: 0;
    color: #526357;
    font-size: 13px;
    line-height: 1.6;
  }

  .refresh-button {
    display: inline-flex;
    align-items: center;
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

  .refresh-button:disabled { opacity: .65; cursor: wait; }
  .spinning { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .error-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border: 1px solid #F0C8C5;
    border-radius: 9px;
    background: #FFF4F3;
    color: #8B302A;
    font-size: 13px;
  }

  .error-banner button {
    border: 0;
    background: transparent;
    color: #8B302A;
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }

  .welcome-card {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 205px;
    overflow: hidden;
    padding: 30px 34px;
    border-radius: 15px;
    background: linear-gradient(110deg, #173F28, #28794B);
    color: white;
  }

  .welcome-content { position: relative; z-index: 1; max-width: 650px; }
  .welcome-tag { color: #C8E8D0; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; }
  .welcome-card h2 { max-width: 490px; margin: 13px 0 9px; color: white; font-size: 24px; line-height: 1.35; }
  .welcome-card p { margin: 0; color: #E1F0E5; font-size: 13px; line-height: 1.7; }
  .welcome-location { display: flex; align-items: center; gap: 8px; margin-top: 18px; color: #E1F0E5; font-size: 12px; }
  .welcome-decoration { position: absolute; top: 25px; right: 45px; opacity: .15; transform: rotate(-15deg); }

  .stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .stat-card { min-width: 0; padding: 20px; border: 1px solid #E5ECE5; border-radius: 12px; background: white; }
  .stat-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 10px; background: #EDF6EE; color: #28794B; }
  .stat-value { margin-top: 19px; color: #173F28; font-size: 29px; font-weight: 750; letter-spacing: -.7px; }
  .stat-label { margin-top: 6px; color: #26382C; font-size: 13px; font-weight: 700; }
  .stat-note { margin-top: 7px; color: #68776C; font-size: 11px; line-height: 1.5; }

  .loading-card { min-height: 170px; }
  .skeleton { border-radius: 7px; background: #EDF1ED; animation: pulse 1.2s ease-in-out infinite alternate; }
  .icon-skeleton { width: 42px; height: 42px; }
  .value-skeleton { width: 75px; height: 29px; margin-top: 20px; }
  .label-skeleton { width: 65%; height: 13px; margin-top: 10px; }
  @keyframes pulse { to { opacity: .45; } }
  .empty-card { grid-column: 1 / -1; padding: 25px; border: 1px solid #E5ECE5; border-radius: 12px; background: white; color: #526357; }

  .sms-section, .panel { padding: 22px; border: 1px solid #E5ECE5; border-radius: 12px; background: white; }
  .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
  .section-heading h2 { margin: 0 0 6px; color: #173F28; font-size: 16px; }
  .section-tag { padding: 6px 10px; border-radius: 6px; background: #EDF5FA; color: #3876A1; font-size: 11px; font-weight: 750; }

  .sms-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
  .sms-card { display: flex; align-items: center; gap: 13px; padding: 16px; border: 1px solid #E7ECE7; border-radius: 10px; }
  .sms-icon { display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; border-radius: 10px; }
  .incoming { background: #EDF5FA; color: #3876A1; }
  .outgoing { background: #EAF7ED; color: #24824C; }
  .sms-number { color: #173F28; font-size: 23px; font-weight: 750; }
  .sms-label { margin-top: 3px; color: #26382C; font-size: 13px; font-weight: 700; }
  .sms-note { margin-top: 5px; color: #68776C; font-size: 11px; }

  .engagement-panel { min-width: 0; }
  .engagement-heading { flex-wrap: wrap; }
  .period-selector { display: flex; gap: 5px; padding: 4px; border-radius: 8px; background: #F2F5F2; }
  .period-selector button { padding: 7px 10px; border: 0; border-radius: 6px; background: transparent; color: #526357; font-size: 11px; cursor: pointer; }
  .period-selector button.chosen { background: white; color: #28794B; font-weight: 750; box-shadow: 0 1px 3px #00000012; }
  .period-selector button:disabled { opacity: .6; cursor: wait; }

  .chart-legend { display: flex; gap: 18px; margin: 22px 0 12px; color: #526357; font-size: 11px; }
  .chart-legend span { display: inline-flex; align-items: center; gap: 7px; }
  .legend-dot { width: 9px; height: 9px; border-radius: 3px; }
  .legend-dot.questions, .bar.questions { background: #28794B; }
  .legend-dot.responses, .bar.responses { background: #91BDA0; }

  .chart { display: grid; grid-auto-columns: minmax(0, 1fr); grid-auto-flow: column; align-items: end; gap: 5px; min-height: 190px; overflow-x: auto; padding: 12px 2px 0; border-bottom: 1px solid #E7ECE7; }
  .chart-column { display: flex; min-width: 0; height: 180px; flex-direction: column; align-items: center; justify-content: flex-end; gap: 8px; }
  .bars { display: flex; align-items: flex-end; justify-content: center; gap: 3px; width: 100%; height: 145px; }
  .bar { width: min(35%, 15px); min-height: 0; border-radius: 4px 4px 0 0; transition: height .2s ease; }
  .chart-date { color: #68776C; font-size: 9px; white-space: nowrap; }
  .chart-footnote { margin-top: 12px; color: #68776C; font-size: 11px; }
  .chart-message { display: grid; place-items: center; min-height: 170px; color: #68776C; font-size: 13px; }
  .data-note { color: #68776C; font-size: 11px; line-height: 1.6; }

  @media (max-width: 1150px) {
    .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 650px) {
    .page-heading { align-items: flex-start; }
    .welcome-card { padding: 25px 21px; }
    .welcome-card h2 { font-size: 21px; }
    .welcome-decoration { right: -55px; }
    .sms-grid { grid-template-columns: 1fr; }
    .sms-section, .panel { padding: 18px; }
    .chart { grid-auto-columns: 32px; }
    .chart-date { font-size: 8px; }
  }

  @media (max-width: 430px) {
    .stats-grid { grid-template-columns: 1fr; }
    .page-heading { flex-direction: column; }
    .refresh-button { align-self: flex-start; }
    .error-banner { align-items: flex-start; flex-direction: column; }
  }
</style>

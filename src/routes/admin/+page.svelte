
<script>
  import { goto } from "$app/navigation";
  import { getAuthState } from "#lib/stores/auth.svelte.js";

  import {
    LayoutDashboard,
    Users,
    Sprout,
    ClipboardList,
    MessageCircle,
    CloudSun,
    BarChart3,
    Settings,
    Menu,
    X,
    ArrowUpRight,
    Leaf,
    LogOut
  } from "lucide-svelte";

  const auth = getAuthState();

  let sidebarOpen = $state(false);
  let isLoggingOut = $state(false);

  const navigation = [
    { label: "Overview", icon: LayoutDashboard, href: "/admin" },
    { label: "Farmers", icon: Users, href: "/farmers" },
    { label: "Farms & Crops", icon: Sprout, href: "/farms" },
    { label: "Observations", icon: ClipboardList, href: "/observations" },
    { label: "Recommendations", icon: Leaf, href: "/recommendations" },
    { label: "Conversations", icon: MessageCircle, href: "/conversations" },
    { label: "Weather", icon: CloudSun, href: "/weather" },
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Settings", icon: Settings, href: "/settings" }
  ];

  const stats = [
    { label: "Registered Farmers", icon: Users },
    { label: "Active Crop Cycles", icon: Sprout },
    { label: "Farmer Observations", icon: ClipboardList },
    { label: "Recommendations", icon: Leaf }
  ];

  async function handleLogout() {
    if (isLoggingOut) return;

    isLoggingOut = true;

    try {
      await auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await goto("/", { replaceState: true });
    }
  }
</script>

<svelte:head>
  <title>AgriMama | Admin Dashboard</title>
  <meta
    name="description"
    content="AgriMama agricultural advisory administration dashboard"
  />
</svelte:head>

<div class="app-shell">
  {#if sidebarOpen}
    <button
      class="overlay"
      aria-label="Close navigation"
      onclick={() => (sidebarOpen = false)}
    ></button>
  {/if}

  <aside class:open={sidebarOpen} class="sidebar">
    <div class="brand">
      <div class="brand-icon">
        <Sprout size={25} />
      </div>

      <div class="brand-text">
        <strong>AgriMama</strong>
        <small>Farmer Advisory Platform</small>
      </div>

      <button
        class="close-sidebar"
        aria-label="Close menu"
        onclick={() => (sidebarOpen = false)}
      >
        <X size={20} />
      </button>
    </div>

    <div class="nav-caption">WORKSPACE</div>

    <nav aria-label="Main navigation">
      {#each navigation as item}
        <a
          href={item.href}
          class:active={item.href === "/admin"}
          onclick={() => (sidebarOpen = false)}
        >
          <item.icon size={19} strokeWidth={1.8} />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <div class="footer-icon">
        <Leaf size={21} />
      </div>

      <div>
        <strong>Growing together</strong>
        <p>Better information, stronger harvests.</p>
      </div>
    </div>
  </aside>

  <div class="main-area">
    <header class="topbar">
      <button
        class="menu-button"
        aria-label="Open navigation"
        onclick={() => (sidebarOpen = true)}
      >
        <Menu size={23} />
      </button>

      <div class="breadcrumb">
        Workspace <span>/</span> Overview
      </div>

      <div class="topbar-right">
    

        <div class="avatar">AM</div>

        <button
          class="logout-button"
          onclick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={17} />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </header>

    <main class="content">
      <div class="page-heading">
        <div>
          <div class="eyebrow">AGRIMAMA OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>
            Monitor farmer engagement, crop activity and agricultural
            advisory services.
          </p>
        </div>

      </div>

      <section class="welcome-card">
        <div class="welcome-content">
          <span class="welcome-tag">WELCOME TO AGRIMAMA</span>

          <h2>Empowering farmers through better information.</h2>

          <p>
            A connected platform for farmer support, crop monitoring,
            and timely agricultural guidance.
          </p>

          <div class="welcome-location">
            <Sprout size={18} />
            Starting with maize farmers in Homa Bay, Kenya
          </div>
        </div>

        <div class="welcome-decoration">
          <Sprout size={150} strokeWidth={0.8} />
        </div>
      </section>

      <section class="stats-grid" aria-label="Platform statistics">
        {#each stats as stat}
          <div class="stat-card">
            <div class="stat-header">
              <div class="stat-icon">
                <stat.icon size={22} strokeWidth={1.8} />
              </div>

              <ArrowUpRight size={18} class="stat-arrow" />
            </div>

            <div class="stat-value">—</div>
            <div class="stat-label">{stat.label}</div>
            <div class="stat-note">Awaiting API connection</div>
          </div>
        {/each}
      </section>

      <div class="lower-grid">
        <section class="panel">
          <div class="panel-heading">
            <div>
              <h3>Recent farmer activity</h3>
              <p>Incoming observations and advisory interactions</p>
            </div>
          </div>

          <div class="empty-state">
            <div class="empty-icon">
              <ClipboardList size={28} />
            </div>

            <strong>Activity will appear here</strong>

            <p>
              We'll load farmer observations from your existing
              AgriMama API.
            </p>
          </div>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <div>
              <h3>Platform channels</h3>
              <p>Messaging integration status</p>
            </div>
          </div>

          <div class="channel-list">
            <div class="channel">
              <div class="channel-icon sms">
                <MessageCircle size={21} />
              </div>

              <div class="channel-info">
                <strong>SMS</strong>
                <small>Africa's Talking Sandbox</small>
              </div>

              <span class="channel-status ready">Tested</span>
            </div>

            <div class="channel">
              <div class="channel-icon whatsapp">
                <MessageCircle size={21} />
              </div>

              <div class="channel-info">
                <strong>WhatsApp</strong>
                <small>Meta Cloud API</small>
              </div>

              <span class="channel-status pending">
                Pending verification
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: Inter, Arial, sans-serif;
    background: #F7F9F6;
    color: #26382C;
  }

  :global(button),
  :global(a) {
    font: inherit;
  }

  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  /* Sidebar */

  .sidebar {
    width: 255px;
    flex-shrink: 0;
    background: #fff;
    border-right: 1px solid #E7EDE7;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .brand {
    padding: 26px 20px 31px;
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .brand-icon {
    width: 43px;
    height: 43px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: #28794B;
    color: white;
    flex-shrink: 0;
  }

  .brand strong {
    font-size: 21px;
    letter-spacing: -0.5px;
    display: block;
    color: #173F28;
  }

  .brand small {
    color: #526357;
    font-size: 12px;
    display: block;
    margin-top: 3px;
  }

  .nav-caption {
    color: #526357;
    font-size: 11px;
    letter-spacing: 1.4px;
    font-weight: 700;
    padding: 0 25px 12px;
  }

  nav {
    padding: 0 12px;
    display: grid;
    gap: 4px;
  }

  nav a {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 12px 14px;
    color: #405448;
    text-decoration: none;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
  }

  nav a:hover {
    background: #F0F6F0;
    color: #173F28;
  }

  nav a.active {
    background: #E8F3EB;
    color: #28794B;
    font-weight: 700;
  }

  .sidebar-footer {
    margin: auto 15px 20px;
    padding: 16px 13px;
    border-radius: 12px;
    background: #F0F6ED;
    display: flex;
    gap: 11px;
    align-items: flex-start;
  }

  .footer-icon {
    color: #28794B;
  }

  .sidebar-footer strong {
    font-size: 13px;
    color: #173F28;
  }

  .sidebar-footer p {
    margin: 5px 0 0;
    color: #405448;
    font-size: 12px;
    line-height: 1.5;
  }

  /* Main content */

  .main-area {
    min-width: 0;
    flex: 1;
  }

  .topbar {
    height: 70px;
    padding: 0 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border-bottom: 1px solid #E8EDE8;
  }

  .breadcrumb {
    font-size: 14px;
    color: #405448;
  }

  .breadcrumb span {
    padding: 0 9px;
    color: #526357;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .environment {
    background: #F0F6F0;
    color: #405448;
    padding: 9px 12px;
    border-radius: 7px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .environment-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #28794B;
  }

  .avatar {
    height: 37px;
    width: 37px;
    background: #E1EFE2;
    color: #234C35;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 700;
  }

  .logout-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 15px;
    border: 1px solid #DCE8DD;
    border-radius: 8px;
    background: white;
    color: #234C35;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }

  .logout-button:hover:not(:disabled) {
    background: #F0F6F0;
    border-color: #A9C9AF;
  }

  .logout-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .content {
    padding: 35px 38px;
    max-width: 1550px;
    margin: auto;
  }

  .page-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
  }

  .eyebrow {
    color: #28794B;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.4px;
    margin-bottom: 10px;
  }

  h1 {
    font-size: 30px;
    letter-spacing: -0.8px;
    margin: 0 0 10px;
    color: #173F28;
    font-weight: 750;
  }

  .page-heading p {
    margin: 0;
    color: #405448;
    font-size: 14px;
    line-height: 1.6;
  }

  .status-pill {
    background: #EDF6ED;
    color: #234C35;
    border: 1px solid #D9EBDD;
    border-radius: 30px;
    padding: 9px 13px;
    white-space: nowrap;
    font-size: 12px;
  }

  .status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    background: #28794B;
    border-radius: 50%;
    margin-right: 6px;
  }

  /* Welcome banner */

  .welcome-card {
    background: linear-gradient(110deg, #173F28, #28794B);
    border-radius: 16px;
    color: white;
    padding: 32px 36px;
    position: relative;
    overflow: hidden;
    min-height: 215px;
    display: flex;
    align-items: center;
  }

  .welcome-content {
    position: relative;
    z-index: 1;
    max-width: 650px;
  }

  .welcome-tag {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.4px;
    color: #C8E8D0;
  }

  .welcome-card h2 {
    font-size: 25px;
    line-height: 1.35;
    letter-spacing: -0.5px;
    max-width: 490px;
    margin: 14px 0 10px;
    color: white;
  }

  .welcome-card p {
    font-size: 14px;
    line-height: 1.7;
    color: #E1F0E5;
  }

  .welcome-location {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #E1F0E5;
    font-size: 13px;
  }

  .welcome-decoration {
    position: absolute;
    right: 45px;
    top: 25px;
    opacity: 0.15;
    transform: rotate(-15deg);
  }

  /* Statistics */

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 17px;
    margin: 24px 0;
  }

  .stat-card {
    background: white;
    border: 1px solid #E5ECE5;
    border-radius: 13px;
    padding: 21px;
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-icon {
    width: 43px;
    height: 43px;
    border-radius: 11px;
    background: #EDF6EE;
    color: #28794B;
    display: grid;
    place-items: center;
  }

  .stat-arrow {
    color: #526357;
  }

  .stat-value {
    margin-top: 23px;
    font-size: 30px;
    font-weight: 750;
    letter-spacing: -0.8px;
    color: #173F28;
  }

  .stat-label {
    margin-top: 7px;
    font-size: 14px;
    font-weight: 700;
    color: #26382C;
  }

  .stat-note {
    margin-top: 8px;
    font-size: 12px;
    color: #526357;
  }

  /* Panels */

  .lower-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 20px;
  }

  .panel {
    background: white;
    border: 1px solid #E5ECE5;
    border-radius: 13px;
    padding: 24px;
  }

  .panel-heading h3 {
    margin: 0 0 7px;
    font-size: 17px;
    color: #173F28;
  }

  .panel-heading p {
    margin: 0;
    font-size: 13px;
    color: #405448;
  }

  .empty-state {
    min-height: 215px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    border-radius: 15px;
    background: #F0F6F0;
    color: #28794B;
    display: grid;
    place-items: center;
    margin-bottom: 13px;
  }

  .empty-state strong {
    font-size: 14px;
    color: #26382C;
  }

  .empty-state p {
    max-width: 280px;
    color: #526357;
    font-size: 13px;
    line-height: 1.6;
  }

  /* Messaging channels */

  .channel-list {
    margin-top: 23px;
    display: grid;
    gap: 15px;
  }

  .channel {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 13px;
    border: 1px solid #E7ECE7;
    border-radius: 10px;
  }

  .channel-icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    flex-shrink: 0;
  }

  .sms {
    color: #3876A1;
    background: #EDF5FA;
  }

  .whatsapp {
    color: #24824C;
    background: #E9F7ED;
  }

  .channel-info {
    flex: 1;
    min-width: 0;
  }

  .channel-info strong {
    display: block;
    font-size: 14px;
    color: #26382C;
  }

  .channel-info small {
    color: #526357;
    font-size: 12px;
  }

  .channel-status {
    font-size: 11px;
    padding: 7px 9px;
    border-radius: 6px;
    white-space: nowrap;
  }

  .ready {
    color: #234C35;
    background: #EAF7ED;
  }

  .pending {
    color: #80601E;
    background: #FFF5E1;
  }

  /* Mobile navigation */

  .menu-button,
  .close-sidebar {
    display: none;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: #234C35;
  }

  .overlay {
    display: none;
  }

  @media (max-width: 1150px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .lower-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 800px) {
    .sidebar {
      position: fixed;
      z-index: 30;
      transform: translateX(-100%);
      transition: transform 0.2s;
      box-shadow: 0 0 25px #00000012;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .overlay {
      display: block;
      position: fixed;
      inset: 0;
      background: #0007;
      z-index: 20;
      border: 0;
    }

    .menu-button,
    .close-sidebar {
      display: block;
    }

    .close-sidebar {
      margin-left: auto;
    }

    .topbar {
      padding: 0 18px;
      justify-content: flex-start;
      gap: 13px;
    }

    .topbar-right {
      margin-left: auto;
      gap: 9px;
    }

    .content {
      padding: 25px 20px;
    }

    .page-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .welcome-card {
      padding: 27px 23px;
    }

    .welcome-card h2 {
      font-size: 22px;
    }

    .welcome-decoration {
      right: -45px;
    }

    .logout-button {
      padding: 9px 11px;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .environment,
    .status-pill {
      display: none;
    }

    .breadcrumb {
      font-size: 12px;
    }

    .avatar {
      display: none;
    }

    .logout-button {
      font-size: 12px;
      padding: 9px 10px;
    }

    .content {
      padding: 22px 15px;
    }

    .welcome-card {
      padding: 25px 20px;
    }

    .panel {
      padding: 19px;
    }

    .channel {
      flex-wrap: wrap;
    }
  }
</style>

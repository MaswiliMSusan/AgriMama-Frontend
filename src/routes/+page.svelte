
<script>
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
    Leaf
  } from 'lucide-svelte';

  let sidebarOpen = $state(false);

  const navigation = [
    { label: 'Overview', icon: LayoutDashboard, href: '/' },
    { label: 'Farmers', icon: Users, href: '/farmers' },
    { label: 'Farms & Crops', icon: Sprout, href: '/farms' },
    { label: 'Observations', icon: ClipboardList, href: '/observations' },
    { label: 'Recommendations', icon: Leaf, href: '/recommendations' },
    { label: 'Conversations', icon: MessageCircle, href: '/conversations' },
    { label: 'Weather', icon: CloudSun, href: '/weather' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Settings', icon: Settings, href: '/settings' }
  ];

  const stats = [
    { label: 'Registered Farmers', icon: Users },
    { label: 'Active Crop Cycles', icon: Sprout },
    { label: 'Farmer Observations', icon: ClipboardList },
    { label: 'Recommendations', icon: Leaf }
  ];
</script>

<svelte:head>
  <title>AgriMama | Dashboard</title>
  <meta
    name="description"
    content="AgriMama agricultural advisory dashboard"
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
      <div>
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
          class:active={item.href === '/'}
          onclick={() => (sidebarOpen = false)}
        >
          <item.icon size={19} strokeWidth={1.8} />
          <span>{item.label}</span>
        </a>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <div class="footer-icon"><Leaf size={20} /></div>
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

      <div class="breadcrumb">Workspace <span>/</span> Overview</div>

      <div class="topbar-right">
        <span class="environment">Development</span>
        <div class="avatar">AM</div>
      </div>
    </header>

    <main class="content">
      <div class="page-heading">
        <div>
          <div class="eyebrow">AGRIMAMA OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>Monitor farmer engagement, crop activity and agricultural advisory services.</p>
        </div>
        <span class="status-pill">
          <span class="status-dot"></span>
          Development environment
        </span>
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
            <Sprout size={17} />
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
                <stat.icon size={21} strokeWidth={1.8} />
              </div>
              <ArrowUpRight size={17} class="stat-arrow" />
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
            <div class="empty-icon"><ClipboardList size={27} /></div>
            <strong>Activity will appear here</strong>
            <p>We'll load farmer observations from your existing AgriMama API.</p>
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
              <div class="channel-icon sms"><MessageCircle size={21} /></div>
              <div class="channel-info">
                <strong>SMS</strong>
                <small>Africa's Talking Sandbox</small>
              </div>
              <span class="channel-status ready">Tested</span>
            </div>

            <div class="channel">
              <div class="channel-icon whatsapp"><MessageCircle size={21} /></div>
              <div class="channel-info">
                <strong>WhatsApp</strong>
                <small>Meta Cloud API</small>
              </div>
              <span class="channel-status pending">Pending verification</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</div>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #f7f9f6;
    color: #233329;
  }
  :global(button), :global(a) { font: inherit; }

  .app-shell { display: flex; min-height: 100vh; }
  .sidebar {
    width: 258px; flex-shrink: 0; background: #fff;
    border-right: 1px solid #e7ede7; display: flex;
    flex-direction: column; min-height: 100vh;
    position: sticky; top: 0; height: 100vh;
  }
  .brand {
    padding: 29px 21px 32px; display: flex;
    align-items: center; gap: 11px;
  }
  .brand-icon {
    width: 43px; height: 43px; display: grid; place-items: center;
    border-radius: 13px; background: #166b45; color: white;
  }
  .brand strong { font-size: 21px; letter-spacing: -0.7px; display: block; }
  .brand small { color: #819086; font-size: 10px; }
  .nav-caption {
    color: #a0aaa2; font-size: 10px; letter-spacing: 1.5px;
    font-weight: 700; padding: 0 27px 12px;
  }
  nav { padding: 0 12px; display: grid; gap: 4px; }
  nav a {
    display: flex; align-items: center; gap: 13px; padding: 12px 15px;
    color: #637269; text-decoration: none; border-radius: 9px;
    font-size: 13px; font-weight: 500;
  }
  nav a:hover { background: #f3f7f3; color: #166b45; }
  nav a.active { background: #e8f3eb; color: #176a45; font-weight: 700; }
  .sidebar-footer {
    margin: auto 15px 20px; padding: 16px 13px;
    border-radius: 12px; background: #f0f6ed;
    display: flex; gap: 10px; align-items: flex-start;
  }
  .footer-icon { color: #4b8c4d; }
  .sidebar-footer strong { font-size: 12px; }
  .sidebar-footer p {
    margin: 5px 0 0; color: #839184; font-size: 11px; line-height: 1.5;
  }
  .main-area { min-width: 0; flex: 1; }
  .topbar {
    height: 75px; padding: 0 36px; display: flex; align-items: center;
    justify-content: space-between; background: white;
    border-bottom: 1px solid #e8ede8;
  }
  .breadcrumb { font-size: 13px; color: #7b897f; }
  .breadcrumb span { padding: 0 9px; color: #b4bdb5; }
  .topbar-right { display: flex; align-items: center; gap: 19px; }
  .environment {
    background: #f1f6f1; color: #54755c;
    padding: 8px 12px; border-radius: 7px; font-size: 11px;
  }
  .avatar {
    height: 36px; width: 36px; background: #d9e9da;
    color: #276a43; border-radius: 50%; display: grid;
    place-items: center; font-size: 12px; font-weight: 700;
  }
  .content { padding: 36px; max-width: 1550px; margin: auto; }
  .page-heading {
    display: flex; align-items: flex-end; justify-content: space-between;
    gap: 20px; margin-bottom: 28px;
  }
  .eyebrow {
    color: #4e9366; font-size: 10px; font-weight: 800;
    letter-spacing: 1.6px; margin-bottom: 10px;
  }
  h1 { font-size: 30px; letter-spacing: -1.2px; margin: 0 0 10px; }
  .page-heading p { margin: 0; color: #849087; font-size: 13px; line-height: 1.6; }
  .status-pill {
    background: #edf6ed; color: #467e50; border: 1px solid #d9ebdb;
    border-radius: 30px; padding: 9px 13px; white-space: nowrap;
    font-size: 11px;
  }
  .status-dot {
    display: inline-block; width: 7px; height: 7px;
    background: #66a46c; border-radius: 50%; margin-right: 5px;
  }
  .welcome-card {
    background: linear-gradient(110deg, #155e40, #237d50);
    border-radius: 16px; color: white; padding: 32px 36px;
    position: relative; overflow: hidden; min-height: 215px;
    display: flex; align-items: center;
  }
  .welcome-content { position: relative; z-index: 1; max-width: 650px; }
  .welcome-tag {
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    color: #b9e6c7;
  }
  .welcome-card h2 {
    font-size: 25px; line-height: 1.3; letter-spacing: -0.6px;
    max-width: 490px; margin: 14px 0 10px;
  }
  .welcome-card p { font-size: 12px; line-height: 1.7; color: #d4ecda; }
  .welcome-location {
    margin-top: 20px; display: flex; align-items: center;
    gap: 8px; color: #d6f0da; font-size: 11px;
  }
  .welcome-decoration {
    position: absolute; right: 45px; top: 25px;
    opacity: 0.15; transform: rotate(-15deg);
  }
  .stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 17px; margin: 24px 0;
  }
  .stat-card {
    background: white; border: 1px solid #e9eee9;
    border-radius: 13px; padding: 21px;
  }
  .stat-header { display: flex; justify-content: space-between; align-items: center; }
  .stat-icon {
    width: 42px; height: 42px; border-radius: 11px;
    background: #edf6ee; color: #28794b; display: grid; place-items: center;
  }
  .stat-arrow { color: #b5c1b7; }
  .stat-value {
    margin-top: 23px; font-size: 29px; font-weight: 700;
    letter-spacing: -1px;
  }
  .stat-label { margin-top: 6px; font-size: 12px; font-weight: 700; }
  .stat-note { margin-top: 8px; font-size: 11px; color: #a1ada3; }
  .lower-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
  .panel {
    background: white; border: 1px solid #e9eee9;
    border-radius: 13px; padding: 24px;
  }
  .panel-heading h3 { margin: 0 0 7px; font-size: 15px; }
  .panel-heading p { margin: 0; font-size: 11px; color: #98a49a; }
  .empty-state {
    min-height: 215px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
  }
  .empty-icon {
    width: 56px; height: 56px; border-radius: 15px;
    background: #f1f7f1; color: #7ca783;
    display: grid; place-items: center; margin-bottom: 13px;
  }
  .empty-state strong { font-size: 12px; }
  .empty-state p { max-width: 260px; color: #9ba79e; font-size: 11px; line-height: 1.6; }
  .channel-list { margin-top: 23px; display: grid; gap: 15px; }
  .channel {
    display: flex; align-items: center; gap: 11px;
    padding: 13px; border: 1px solid #edf0ed; border-radius: 10px;
  }
  .channel-icon {
    width: 39px; height: 39px; display: grid; place-items: center;
    border-radius: 9px;
  }
  .sms { color: #3876a1; background: #edf5fa; }
  .whatsapp { color: #24824c; background: #e9f7ed; }
  .channel-info { flex: 1; min-width: 0; }
  .channel-info strong { display: block; font-size: 12px; }
  .channel-info small { color: #a0aaa2; font-size: 10px; }
  .channel-status {
    font-size: 10px; padding: 6px 8px; border-radius: 6px;
    white-space: nowrap;
  }
  .ready { color: #2b8651; background: #eaf7ed; }
  .pending { color: #a47822; background: #fff5e1; }
  .menu-button, .close-sidebar {
    display: none; border: 0; background: transparent;
    cursor: pointer; color: #28563c;
  }
  .overlay { display: none; }

  @media (max-width: 1150px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .lower-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 800px) {
    .sidebar {
      position: fixed; z-index: 30; transform: translateX(-100%);
      transition: transform 0.2s; box-shadow: 0 0 25px #00000012;
    }
    .sidebar.open { transform: translateX(0); }
    .overlay {
      display: block; position: fixed; inset: 0;
      background: #0007; z-index: 20; border: 0;
    }
    .menu-button, .close-sidebar { display: block; }
    .close-sidebar { margin-left: auto; }
    .topbar { padding: 0 20px; justify-content: flex-start; gap: 16px; }
    .topbar-right { margin-left: auto; }
    .content { padding: 24px 18px; }
    .page-heading { align-items: flex-start; flex-direction: column; }
    .welcome-card { padding: 27px 23px; }
    .welcome-card h2 { font-size: 21px; }
    .welcome-decoration { right: -45px; }
  }
  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr; }
    .environment, .status-pill { display: none; }
    .breadcrumb { font-size: 11px; }
  }
</style>

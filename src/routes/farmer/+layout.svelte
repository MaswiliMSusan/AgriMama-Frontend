<script>
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";

  import {
    Sprout,
    CloudSun,
    MessageCircle,
    MessageSquare,
    TrendingUp,
    Bell,
    Home,
    Leaf,
    ShoppingBasket,
    MapPinned,
    ArrowRight,
    Menu,
    X,
    BookOpen,
  } from "lucide-svelte";

  import { getAuthState } from "#lib/stores/auth.svelte.js";

  let { children } = $props();

  const auth = getAuthState();

  let mobileMenuOpen = $state(false);
  let notificationCount = 2;

  const navigation = [
    { label: "Overview", href: "/farmer", icon: Home },
    { label: "AI Assistant", href: "/farmer/assistant", icon: MessageCircle },
    { label: "Farms", href: "/farmer/farms", icon: MapPinned },
    { label: "Crops & Crop Cycles", href: "/farmer/crop-cycles", icon: Sprout },
    { label: "Observations", href: "/farmer/observations", icon: BookOpen },
    { label: "Conversations", href: "/farmer/conversations", icon: MessageSquare },
    { label: "Crop Advice", href: "/farmer/crops", icon: Leaf },
    { label: "Weather", href: "/farmer/weather", icon: CloudSun },
    { label: "Market Prices", href: "/farmer/market", icon: ShoppingBasket },
  ];

  let currentSection = $derived(
    navigation.find((item) =>
      item.href === "/farmer"
        ? page.url.pathname === "/farmer"
        : page.url.pathname.startsWith(item.href)
    )?.label ?? "Overview"
  );

  afterNavigate(() => {
    mobileMenuOpen = false;
  });

  async function handleLogout() {
    try {
      await auth.logout();
    } finally {
      window.location.href = "/login";
    }
  }
</script>

<svelte:head>
  <title>{currentSection} | AgriMama Farmer Portal</title>
  <meta
    name="description"
    content="Your AgriMama farming portal."
  />
</svelte:head>

<div class="farmer-app">
  <aside class:open={mobileMenuOpen} class="sidebar">
    <div class="brand">
      <div class="brand-icon">
        <Sprout size={25} />
      </div>

      <div>
        <h1>AgriMama</h1>
        <span>Farmer Portal</span>
      </div>

      <button
        class="close-menu"
        onclick={() => (mobileMenuOpen = false)}
        aria-label="Close menu"
      >
        <X size={20} />
      </button>
    </div>

    <div class="nav-label">MENU</div>

    <nav>
      {#each navigation as item}
        <a
          href={item.href}
          class:active={currentSection === item.label}
          aria-current={currentSection === item.label ? "page" : undefined}
          onclick={() => (mobileMenuOpen = false)}
        >
          <item.icon size={19} />
          <span>{item.label}</span>

          {#if item.label === "AI Assistant"}
            <span class="new-tag">AI</span>
          {/if}
        </a>
      {/each}
    </nav>

    <div class="sidebar-bottom">
      <div class="help-card">
        <div class="help-icon">
          <MessageCircle size={20} />
        </div>

        <strong>Need help?</strong>
        <p>We're here to support your farming journey.</p>

        <a href="/farmer/assistant">
          Get assistance <ArrowRight size={14} />
        </a>
      </div>

      <button class="profile" onclick={handleLogout}>
        <div class="avatar">
          {auth.user?.name?.charAt(0)?.toUpperCase() || "F"}
        </div>

        <div class="profile-info">
          <strong>{auth.user?.name || "Farmer"}</strong>
          <span>Farmer account</span>
        </div>

        <span class="logout-label">Logout</span>
      </button>
    </div>
  </aside>

  {#if mobileMenuOpen}
    <button
      class="mobile-overlay"
      aria-label="Close navigation"
      onclick={() => (mobileMenuOpen = false)}
    ></button>
  {/if}

  <main class="main-content">
    <header class="topbar">
      <button
        class="menu-button"
        onclick={() => (mobileMenuOpen = true)}
        aria-label="Open navigation"
      >
        <Menu size={23} />
      </button>

      <div class="breadcrumb">
        <span>Farmer Portal</span>
        <span>/</span>
        <strong>{currentSection}</strong>
      </div>

      <div class="topbar-actions">
        <button class="notification-button" aria-label="Notifications">
          <Bell size={20} />
          {#if notificationCount > 0}
            <span class="notification-dot"></span>
          {/if}
        </button>

        <div class="topbar-user">
          <div class="avatar small">
            {auth.user?.name?.charAt(0)?.toUpperCase() || "F"}
          </div>
          <span>{auth.user?.name || "Farmer"}</span>
        </div>
      </div>
    </header>

    <div class="page-content">
      {@render children()}

      <footer class="footer">
        <span>© {new Date().getFullYear()} AgriMama</span>
        <span>Growing smarter, together. 🌱</span>
      </footer>
    </div>
  </main>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    background: #f7f9f6;
    color: #263b2d;
    font-family: Inter, Arial, sans-serif;
  }

  .farmer-app {
    min-height: 100vh;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    width: 255px;
    padding: 25px 18px;
    background: #fff;
    border-right: 1px solid #e9eee8;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 8px 30px;
  }

  .brand-icon {
    display: grid;
    place-items: center;
    width: 43px;
    height: 43px;
    border-radius: 12px;
    background: #28794b;
    color: white;
  }

  .brand h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #234c35;
  }

  .brand span {
    color: #859188;
    font-size: 11px;
  }

  .close-menu {
    display: none;
    margin-left: auto;
    border: 0;
    background: transparent;
    color: #526357;
  }

  .nav-label {
    padding: 0 10px;
    margin-bottom: 12px;
    color: #a0aaa2;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 1.2px;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  nav a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 12px;
    border-radius: 9px;
    color: #718075;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: 0.2s;
  }

  nav a:hover,
  nav a.active {
    background: #edf6ee;
    color: #28794b;
  }

  .new-tag {
    margin-left: auto;
    padding: 3px 6px;
    border-radius: 5px;
    background: #eee8ff;
    color: #7954ba;
    font-size: 9px;
  }

  .sidebar-bottom {
    margin-top: auto;
  }

  .help-card {
    padding: 17px;
    margin-bottom: 18px;
    border-radius: 12px;
    background: #f2f7f0;
  }

  .help-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    margin-bottom: 12px;
    border-radius: 9px;
    background: white;
    color: #28794b;
  }

  .help-card strong {
    font-size: 13px;
  }

  .help-card p {
    margin: 7px 0 12px;
    color: #829087;
    font-size: 11px;
    line-height: 1.6;
  }

  .help-card a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #28794b;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 12px 5px 0;
    border: 0;
    border-top: 1px solid #edf0ed;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .avatar {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #e4f1e5;
    color: #28794b;
    font-size: 15px;
    font-weight: 750;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .profile-info strong {
    overflow: hidden;
    color: #34483a;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-info span {
    color: #929d94;
    font-size: 10px;
  }

  .logout-label {
    margin-left: auto;
    color: #a65d5d;
    font-size: 10px;
  }

  .main-content {
    min-height: 100vh;
    margin-left: 255px;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding: 0 38px;
    border-bottom: 1px solid #e9eee8;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #99a39b;
    font-size: 12px;
  }

  .breadcrumb strong {
    color: #34483a;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 23px;
  }

  .notification-button {
    position: relative;
    border: 0;
    background: transparent;
    color: #748178;
    cursor: pointer;
  }

  .notification-dot {
    position: absolute;
    top: 0;
    right: 0;
    width: 7px;
    height: 7px;
    border: 1px solid white;
    border-radius: 50%;
    background: #e36b58;
  }

  .topbar-user {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #526357;
    font-size: 12px;
    font-weight: 600;
  }

  .avatar.small {
    width: 33px;
    height: 33px;
    font-size: 12px;
  }

  .menu-button {
    display: none;
    border: 0;
    background: transparent;
    color: #526357;
  }

  .page-content {
    max-width: 1450px;
    padding: 35px 38px;
    margin: 0 auto;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 25px 0 10px;
    margin-top: 20px;
    border-top: 1px solid #e9eee8;
    color: #9aa49c;
    font-size: 10px;
  }

  .mobile-overlay {
    display: none;
  }

  @media (max-width: 1100px) {
    .page-content {
      padding: 28px 25px;
    }

    .topbar {
      padding: 0 25px;
    }
  }

  @media (max-width: 760px) {
    .sidebar {
      transform: translateX(-100%);
      transition: transform 0.25s ease;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .close-menu {
      display: block;
    }

    .mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: block;
      border: 0;
      background: rgba(20, 35, 25, 0.4);
    }

    .main-content {
      margin-left: 0;
    }

    .menu-button {
      display: block;
    }

    .topbar {
      height: 62px;
      padding: 0 17px;
    }

    .topbar-user span {
      display: none;
    }

    .topbar-actions {
      gap: 15px;
    }

    .page-content {
      padding: 25px 17px;
    }

    .footer {
      flex-direction: column;
    }
  }
</style>
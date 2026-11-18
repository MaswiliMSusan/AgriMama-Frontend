<script>
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";

  import {
    Sprout, MessageCircle, MessageSquare, Home, MapPinned,
    Menu, X, BookOpen, ChevronDown, LogOut,
  } from "lucide-svelte";

  import { getAuthState } from "#lib/stores/auth.svelte.js";

  let { children } = $props();

  const auth = getAuthState();

  let mobileMenuOpen = $state(false);
  let accountMenuOpen = $state(false);

  const navigation = [
    { label: "Overview", href: "/farmer", icon: Home },
    { label: "AI Assistant", href: "/farmer/assistant", icon: MessageCircle },
    { label: "Farms", href: "/farmer/farms", icon: MapPinned },
    { label: "Crops & Crop Cycles", href: "/farmer/crop-cycles", icon: Sprout },
    { label: "Observations", href: "/farmer/observations", icon: BookOpen },
    { label: "Conversations", href: "/farmer/conversations", icon: MessageSquare },
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
    accountMenuOpen = false;
  });

  async function handleLogout() {
    accountMenuOpen = false;
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
        <div class="account-menu">
          <button
            class="account-trigger"
            type="button"
            aria-label="Farmer account menu"
            aria-expanded={accountMenuOpen}
            aria-controls="farmer-account-dropdown"
            onclick={() => (accountMenuOpen = !accountMenuOpen)}
          >
            <div class="avatar small">
              {auth.user?.name?.charAt(0)?.toUpperCase() || "F"}
            </div>
            <span class="account-name">{auth.user?.name || "Farmer"}</span>
            <ChevronDown size={17} class={accountMenuOpen ? "rotated" : ""} />
          </button>

          {#if accountMenuOpen}
            <button
              class="account-dismiss"
              type="button"
              aria-label="Close account menu"
              onclick={() => (accountMenuOpen = false)}
            ></button>
            <div class="account-dropdown" id="farmer-account-dropdown">
              <div class="account-summary">
                <strong>{auth.user?.name || "Farmer"}</strong>
                <span>Farmer account</span>
              </div>
              <button type="button" class="logout-action" onclick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          {/if}
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

  /* =========================================
     ACCESSIBILITY: SHARED FARMER PORTAL SHELL
     Larger typography and stronger contrast
     ========================================= */

  :global(body) {
    color: #26382c;
    font-size: 16px;
    line-height: 1.6;
  }

  .brand h1 {
    color: #173f28;
    font-size: 21px;
  }

  .brand span {
    color: #526357;
    font-size: 13px;
  }

  .nav-label {
    color: #526357;
    font-size: 12px;
  }

  nav a {
    color: #34483a;
    font-size: 15px;
    font-weight: 650;
    padding: 14px 12px;
  }

  nav a:hover,
  nav a.active {
    color: #145c32;
  }

  .new-tag {
    font-size: 11px;
  }

  .breadcrumb {
    color: #526357;
    font-size: 14px;
  }

  .breadcrumb strong {
    color: #26382c;
  }

  .menu-button,
  .close-menu {
    color: #405448;
  }

  .footer {
    color: #526357;
    font-size: 12px;
  }

  /* Clear keyboard focus */
  nav a:focus-visible,
  button:focus-visible,
  .account-trigger:focus-visible,
  .logout-action:focus-visible {
    outline: 3px solid #25834a;
    outline-offset: 3px;
  }

  @media (max-width: 760px) {
    nav a {
      font-size: 16px;
      padding: 15px 12px;
    }

    .breadcrumb {
      font-size: 13px;
    }

  }

  /* Prototype account dropdown */
  .account-menu { position: relative; }
  .account-trigger {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 9px; border: 1px solid transparent;
    border-radius: 10px; background: transparent;
    color: #26382c; font-size: 14px; font-weight: 650;
    cursor: pointer;
  }
  .account-trigger:hover,
  .account-trigger[aria-expanded="true"] { background: #edf6ee; border-color: #dce8dc; }
  .account-name { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rotated { transform: rotate(180deg); }
  .account-dismiss { position: fixed; inset: 0; z-index: 39; border: 0; background: transparent; cursor: default; }
  .account-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0; z-index: 40;
    width: 230px; padding: 8px; border: 1px solid #dce8dc;
    border-radius: 12px; background: white;
    box-shadow: 0 12px 28px rgba(18, 50, 28, .13);
  }
  .account-summary { display: flex; flex-direction: column; gap: 3px; padding: 12px; border-bottom: 1px solid #e7eee7; }
  .account-summary strong { color: #173f28; font-size: 15px; overflow-wrap: anywhere; }
  .account-summary span { color: #526357; font-size: 13px; }
  .logout-action {
    display: flex; align-items: center; gap: 10px;
    width: 100%; min-height: 44px; padding: 10px 12px;
    border: 0; border-radius: 8px; background: transparent;
    color: #933b3b; font-size: 15px; font-weight: 650;
    text-align: left; cursor: pointer;
  }
  .logout-action:hover { background: #fff1f0; }
  @media (max-width: 760px) {
    .account-name { max-width: 110px; }
    .account-trigger { gap: 6px; padding: 5px; }
  }

</style>
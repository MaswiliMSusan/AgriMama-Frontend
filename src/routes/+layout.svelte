
<script>
  import { goto, afterNavigate } from "$app/navigation";
  import { setContext } from "svelte";

  import {
    AUTH_CONTEXT,
    createAuthState,
  } from "#lib/stores/auth.svelte.js";

  let { children } = $props();

  const auth = createAuthState();

  setContext(AUTH_CONTEXT, auth);

  let checkingRoute = false;
  let routeReady = $state(false);

  /**
   * Get the dashboard route for a user role.
   * @param {"admin" | "staff" | "farmer" | undefined} role
   * @returns {string}
   */
  function getHomeRoute(role) {
    switch (role) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";
      case "farmer":
        return "/farmer";
      default:
        return "/login";
    }
  }

  async function enforceRouteProtection() {
    if (checkingRoute) return;

    const pathname = window.location.pathname;

    // Public landing page: no authentication check required.
    if (pathname === "/") {
      routeReady = true;
      return;
    }

    checkingRoute = true;
    routeReady = false;

    try {
      await auth.initialize();

      const role = auth.user?.role;

      // Login is public, but authenticated users go to their dashboard.
      if (pathname === "/login") {
        if (role) {
          await goto(getHomeRoute(role), {
            replaceState: true,
          });
        }
        return;
      }

      // Protect all dashboard routes.
      if (!role) {
        await goto("/login", {
          replaceState: true,
        });
        return;
      }

      // Admin protection.
      if (pathname.startsWith("/admin") && role !== "admin") {
        await goto(getHomeRoute(role), {
          replaceState: true,
        });
        return;
      }

      // Staff protection.
      if (pathname.startsWith("/staff") && role !== "staff") {
        await goto(getHomeRoute(role), {
          replaceState: true,
        });
        return;
      }

      // Farmer protection.
      if (pathname.startsWith("/farmer") && role !== "farmer") {
        await goto(getHomeRoute(role), {
          replaceState: true,
        });
        return;
      }
    } catch (error) {
      console.error("Route protection failed:", error);

      if (window.location.pathname !== "/") {
        await goto("/login", {
          replaceState: true,
        });
      }
    } finally {
      checkingRoute = false;
      routeReady = true;
    }
  }

  // Run the route check on initial load and after navigation.
  afterNavigate(() => {
    void enforceRouteProtection();
  });
</script>

{#if routeReady}
  {@render children()}
{:else}
  <div class="auth-loading">
    <div class="loading-content">
      <div class="brand-icon">🌱</div>
      <strong>AgriMama</strong>
      <span>Checking your session...</span>
      <div class="loader"></div>
    </div>
  </div>
{/if}

<style>
  .auth-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #f7f9f6;
    color: #233329;
    font-family: Arial, Helvetica, sans-serif;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .brand-icon {
    font-size: 35px;
  }

  .loading-content strong {
    font-size: 23px;
    color: #166b45;
  }

  .loading-content span {
    font-size: 13px;
    color: #819086;
  }

  .loader {
    width: 25px;
    height: 25px;
    margin-top: 8px;
    border: 3px solid #dce9df;
    border-top-color: #166b45;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>


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

  /**
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

    checkingRoute = true;

    try {
      await auth.initialize();

      const pathname = window.location.pathname;
      const role = auth.user?.role;

      if (!role) {
        if (pathname !== "/login") {
          await goto("/login", { replaceState: true });
        }
        return;
      }

      const homeRoute = getHomeRoute(role);

      if (pathname === "/" || pathname === "/login") {
        await goto(homeRoute, { replaceState: true });
        return;
      }

      if (pathname.startsWith("/admin") && role !== "admin") {
        await goto(homeRoute, { replaceState: true });
        return;
      }

      if (pathname.startsWith("/staff") && role !== "staff") {
        await goto(homeRoute, { replaceState: true });
        return;
      }

      if (pathname.startsWith("/farmer") && role !== "farmer") {
        await goto(homeRoute, { replaceState: true });
      }
    } finally {
      checkingRoute = false;
    }
  }

  afterNavigate(() => {
    enforceRouteProtection();
  });
</script>

{@render children()}

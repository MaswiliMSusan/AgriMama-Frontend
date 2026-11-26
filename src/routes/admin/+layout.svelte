<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getAuthState } from '#lib/stores/auth.svelte.js';

	import {
		LayoutDashboard,
		Users,
		Sprout,
		Wheat,
		ClipboardList,
		BarChart3,
		Settings,
		Menu,
		X,
		Leaf,
		LogOut,
		ChevronDown,
		UserRound
	} from 'lucide-svelte';

	let { children } = $props();

	const auth = getAuthState();

	let sidebarOpen = $state(false);
	let isLoggingOut = $state(false);
	let profileMenuOpen = $state(false);

	const currentUser = $derived(auth.user);

	const displayName = $derived(currentUser?.name || currentUser?.email || 'Admin User');

	const displayRole = $derived(
		currentUser?.role === 'admin'
			? 'Administrator'
			: currentUser?.role === 'staff'
				? 'Staff'
				: 'User'
	);

	function getInitials(name) {
		if (!name) return 'AM';

		return name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');
	}

	const navigation = [
		{ label: 'Overview', icon: LayoutDashboard, href: '/admin' },
		{ label: 'Farmers', icon: Users, href: '/admin/farmers' },
		{ label: 'Farms & Crops', icon: Sprout, href: '/admin/farms' },
		{ label: 'Crop Management', icon: Wheat, href: '/admin/crop-cycles' },
		{ label: 'Observations', icon: ClipboardList, href: '/admin/observations' },
		{ label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
		{ label: 'Settings', icon: Settings, href: '/admin/settings' }
	];

	const currentPath = $derived(page.url.pathname);

	const isActive = (href) =>
		href === '/admin'
			? currentPath === '/admin'
			: currentPath === href || currentPath.startsWith(`${href}/`);

	const currentPage = $derived(navigation.find((item) => isActive(item.href))?.label ?? 'Admin');

	async function handleLogout() {
		if (isLoggingOut) return;

		isLoggingOut = true;
		profileMenuOpen = false;

		try {
			await auth.logout();
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			await goto('/', { replace: true });
		}
	}
</script>

<svelte:head>
	<title>AgriMama | Admin</title>
	<meta name="description" content="AgriMama agricultural advisory administration platform" />
</svelte:head>

<div class="app-shell">
	{#if sidebarOpen}
		<button class="overlay" aria-label="Close navigation" onclick={() => (sidebarOpen = false)}
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

			<button class="close-sidebar" aria-label="Close menu" onclick={() => (sidebarOpen = false)}>
				<X size={20} />
			</button>
		</div>

		<div class="nav-caption">WORKSPACE</div>

		<nav aria-label="Main navigation">
			{#each navigation as item}
				<a
					href={item.href}
					class:active={isActive(item.href)}
					aria-current={isActive(item.href) ? 'page' : undefined}
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
			<div class="topbar-left">
				<button
					class="menu-button"
					aria-label="Open navigation"
					aria-expanded={sidebarOpen}
					onclick={() => (sidebarOpen = true)}
				>
					<Menu size={23} />
				</button>

				<div class="breadcrumb">
					Workspace <span>/</span>
					{currentPage}
				</div>
			</div>

			<div class="topbar-right">
				{#if profileMenuOpen}
					<button
						class="profile-overlay"
						aria-label="Close profile menu"
						onclick={() => (profileMenuOpen = false)}
					></button>
				{/if}

				<div class="profile-menu-wrap">
					{#if profileMenuOpen}
						<div class="profile-dropdown">
							<div class="dropdown-user">
								<strong>{displayName}</strong>
								<span>{currentUser?.email || currentUser?.phone || ''}</span>
								<small>{displayRole}</small>
							</div>

							<div class="dropdown-divider"></div>

							<button class="dropdown-logout" onclick={handleLogout} disabled={isLoggingOut}>
								<LogOut size={17} />
								<span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
							</button>
						</div>
					{/if}

					<button
						class:profile-active={profileMenuOpen}
						class="profile-trigger"
						aria-expanded={profileMenuOpen}
						aria-haspopup="true"
						aria-label="Open account menu"
						onclick={() => (profileMenuOpen = !profileMenuOpen)}
					>
						<div class="profile-avatar">{getInitials(displayName)}</div>

						<div class="profile-info">
							<strong>{displayName}</strong>
							<small>{displayRole}</small>
						</div>

						<ChevronDown
							size={18}
							class={`profile-chevron ${profileMenuOpen ? 'chevron-open' : ''}`}
						/>
					</button>
				</div>
			</div>
		</header>

		<main class="content">
			{@render children()}
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
		background: #f7f9f6;
		color: #26382c;
	}

	:global(button),
	:global(a) {
		font: inherit;
	}

	.app-shell {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: 255px;
		flex-shrink: 0;
		height: 100vh;
		min-height: 100vh;
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		background: #fff;
		border-right: 1px solid #e7ede7;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 26px 20px 31px;
	}

	.brand-icon {
		display: grid;
		place-items: center;
		width: 43px;
		height: 43px;
		flex-shrink: 0;
		border-radius: 12px;
		background: #28794b;
		color: #fff;
	}

	.brand strong {
		display: block;
		color: #173f28;
		font-size: 21px;
		letter-spacing: -0.5px;
	}

	.brand small {
		display: block;
		margin-top: 3px;
		color: #526357;
		font-size: 12px;
	}

	.nav-caption {
		padding: 0 25px 12px;
		color: #526357;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 1.4px;
	}

	nav {
		display: grid;
		gap: 4px;
		padding: 0 12px;
	}

	nav a {
		display: flex;
		align-items: center;
		gap: 13px;
		padding: 12px 14px;
		border-radius: 9px;
		color: #405448;
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		transition:
			background 0.15s,
			color 0.15s;
	}

	nav a:hover {
		background: #f0f6f0;
		color: #173f28;
	}

	nav a.active {
		background: #e8f3eb;
		color: #28794b;
		font-weight: 700;
	}

	.sidebar-footer {
		display: flex;
		align-items: flex-start;
		gap: 11px;
		margin: auto 15px 15px;
		padding: 16px 13px;
		border-radius: 12px;
		background: #f0f6ed;
	}

	.footer-icon {
		color: #28794b;
	}

	.sidebar-footer strong {
		color: #173f28;
		font-size: 13px;
	}

	.sidebar-footer p {
		margin: 5px 0 0;
		color: #405448;
		font-size: 12px;
		line-height: 1.5;
	}

	/* Top-right account menu */

	.topbar-left {
		display: flex;
		align-items: center;
		gap: 13px;
		min-width: 0;
	}

	.topbar-right {
		display: flex;
		align-items: center;
		margin-left: auto;
	}

	.profile-menu-wrap {
		position: relative;
	}

	.profile-trigger {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px;
		border: 1px solid transparent;
		border-radius: 10px;
		background: white;
		text-align: left;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s;
	}

	.profile-trigger:hover,
	.profile-trigger.profile-active {
		background: #f2f7f2;
		border-color: #e1ebe1;
	}

	.profile-avatar {
		display: grid;
		place-items: center;
		width: 39px;
		height: 39px;
		flex-shrink: 0;
		border-radius: 50%;
		background: #e1efe2;
		color: #234c35;
		font-size: 12px;
		font-weight: 800;
	}

	.profile-info {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.profile-info strong {
		overflow: hidden;
		color: #173f28;
		font-size: 12px;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.profile-info small {
		color: #68776c;
		font-size: 11px;
		text-transform: capitalize;
	}

	.profile-chevron {
		flex-shrink: 0;
		color: #68776c;
		transition: transform 0.2s;
	}

	.chevron-open {
		transform: rotate(180deg);
	}

	.profile-overlay {
		position: fixed;
		z-index: 39;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
		background: transparent;
		cursor: default;
	}

	.profile-dropdown {
		position: absolute;
		z-index: 41;
		top: calc(100% + 9px);
		right: 0;
		width: 245px;
		padding: 8px;
		border: 1px solid #e1eae1;
		border-radius: 11px;
		background: white;
		box-shadow: 0 8px 28px #173f2818;
	}

	.dropdown-user {
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding: 10px;
		overflow: hidden;
	}

	.dropdown-user strong {
		color: #173f28;
		font-size: 13px;
	}

	.dropdown-user span {
		overflow: hidden;
		color: #68776c;
		font-size: 11px;
		text-overflow: ellipsis;
	}

	.dropdown-user small {
		color: #28794b;
		font-size: 11px;
		font-weight: 700;
	}

	.dropdown-divider {
		height: 1px;
		margin: 5px 0;
		background: #edf1ed;
	}

	.dropdown-logout {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 11px 10px;
		border: 0;
		border-radius: 7px;
		background: white;
		color: #a33d35;
		font-size: 12px;
		font-weight: 650;
		text-align: left;
		cursor: pointer;
	}

	.dropdown-logout:hover:not(:disabled) {
		background: #fff2f0;
	}

	.dropdown-logout:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	/* Main content */

	.main-area {
		flex: 1;
		min-width: 0;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		min-height: 70px;
		padding: 0 36px;
		border-bottom: 1px solid #e8ede8;
		background: #fff;
	}

	.breadcrumb {
		color: #405448;
		font-size: 14px;
	}

	.breadcrumb span {
		padding: 0 9px;
		color: #526357;
	}

	.content {
		width: 100%;
		max-width: 1550px;
		margin: 0 auto;
		padding: 35px 38px;
	}

	.menu-button,
	.close-sidebar {
		display: none;
		border: 0;
		background: transparent;
		color: #234c35;
		cursor: pointer;
	}

	.overlay {
		display: none;
	}

	@media (max-width: 800px) {
		.sidebar {
			position: fixed;
			z-index: 30;
			transform: translateX(-100%);
			transition: transform 0.2s ease;
			box-shadow: 0 0 25px #00000012;
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.overlay {
			position: fixed;
			z-index: 20;
			inset: 0;
			display: block;
			border: 0;
			background: #0007;
		}

		.menu-button,
		.close-sidebar {
			display: block;
		}

		.close-sidebar {
			margin-left: auto;
		}

		.topbar {
			gap: 12px;
			padding: 0 18px;
		}

		.topbar-left {
			gap: 10px;
		}

		.profile-trigger {
			gap: 8px;
			width: auto;
			padding: 6px;
		}

		.profile-info {
			display: none;
		}

		.profile-avatar {
			width: 36px;
			height: 36px;
		}

		.content {
			padding: 25px 20px;
		}
	}

	@media (max-width: 480px) {
		.breadcrumb {
			font-size: 12px;
		}

		.content {
			padding: 22px 15px;
		}
	}
</style>

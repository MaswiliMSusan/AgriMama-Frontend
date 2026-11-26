<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		ArrowLeft,
		UserRound,
		Phone,
		Languages,
		CalendarDays,
		ShieldCheck,
		ShieldAlert,
		MapPin,
		Sprout,
		RefreshCw,
		AlertCircle,
		Tractor
	} from 'lucide-svelte';

	const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:7000').replace(/\/$/, '');

	let farmer = $state(null);
	let loading = $state(true);
	let errorMessage = $state('');

	const farmerId = $derived(page.params.id);

	function formatDate(value) {
		if (!value) return '—';

		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '—';

		return new Intl.DateTimeFormat('en-KE', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	function languageLabel(value) {
		const labels = {
			en: 'English',
			english: 'English',
			sw: 'Kiswahili',
			kiswahili: 'Kiswahili',
			luo: 'Dholuo',
			dholuo: 'Dholuo'
		};

		return labels[(value || '').toLowerCase()] || value || 'Not set';
	}

	function statusLabel(value) {
		if (!value) return 'Not set';
		return String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
	}

	async function loadFarmer() {
		loading = true;
		errorMessage = '';

		try {
			const response = await fetch(`${API_BASE}/api/admin/farmers/${farmerId}`, {
				method: 'GET',
				credentials: 'include',
				headers: { Accept: 'application/json' }
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || `Farmer request failed (${response.status})`);
			}

			farmer = result.farmer;
		} catch (error) {
			console.error('Failed to load farmer profile:', error);
			errorMessage = error.message || 'Unable to load this farmer profile.';
			farmer = null;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadFarmer();
	});
</script>

<svelte:head>
	<title>{farmer ? `${farmer.name} | AgriMama Admin` : 'Farmer Profile | AgriMama Admin'}</title>
	<meta name="description" content="AgriMama admin farmer profile" />
</svelte:head>

<div class="page">
	<div class="top-line">
		<a class="back-link" href="/admin/farmers">
			<ArrowLeft size={17} />
			Back to farmers
		</a>

		<button class="refresh-button" onclick={loadFarmer} disabled={loading}>
			<RefreshCw size={15} class={loading ? 'spinning' : ''} />
			Refresh
		</button>
	</div>

	{#if loading}
		<div class="state-card">
			<div class="loader"></div>
			<p>Loading farmer profile…</p>
		</div>
	{:else if errorMessage}
		<div class="error-card" role="alert">
			<AlertCircle size={22} />
			<div>
				<strong>Unable to load farmer</strong>
				<p>{errorMessage}</p>
				<button class="retry-button" onclick={loadFarmer}>Try again</button>
			</div>
		</div>
	{:else if farmer}
		<section class="profile-header">
			<div class="avatar"><UserRound size={30} /></div>
			<div class="profile-heading">
				<p class="eyebrow">FARMER PROFILE</p>
				<h1>{farmer.name}</h1>
				<p class="phone-line"><Phone size={15} /> {farmer.phone || 'No phone number'}</p>
			</div>
			<div class="header-status">
				<span class:inactive={farmer.isActive === false} class="status-pill">
					{farmer.isActive === false ? 'Deactivated' : 'Active'}
				</span>
			</div>
		</section>

		<div class="content-grid">
			<section class="panel">
				<div class="panel-title">
					<UserRound size={18} />
					<h2>Personal information</h2>
				</div>

				<div class="details-grid">
					<div class="detail">
						<span class="detail-label">Full name</span>
						<strong>{farmer.name || '—'}</strong>
					</div>
					<div class="detail">
						<span class="detail-label">Phone number</span>
						<strong>{farmer.phone || '—'}</strong>
					</div>
					<div class="detail">
						<span class="detail-label">Preferred language</span>
						<strong><Languages size={15} /> {languageLabel(farmer.preferredLanguage)}</strong>
					</div>
					<div class="detail">
						<span class="detail-label">Registered on</span>
						<strong><CalendarDays size={15} /> {formatDate(farmer.createdAt)}</strong>
					</div>
				</div>
			</section>

			<section class="panel">
				<div class="panel-title">
					<ShieldCheck size={18} />
					<h2>Consent and account</h2>
				</div>

				<div class="consent-row">
					<div>
						<span class="detail-label">SMS consent</span>
						<strong>{farmer.consentStatus ? 'Consented' : 'Not consented'}</strong>
						{#if farmer.consentAt}
							<p class="muted">Recorded on {formatDate(farmer.consentAt)}</p>
						{/if}
					</div>
					{#if farmer.consentStatus}
						<span class="status-pill consented"><ShieldCheck size={14} /> Consented</span>
					{:else}
						<span class="status-pill not-consented"><ShieldAlert size={14} /> Not consented</span>
					{/if}
				</div>

				<div class="consent-row account-row">
					<div>
						<span class="detail-label">Platform account</span>
						<strong>{farmer.isActive === false ? 'Deactivated' : 'Active / not deactivated'}</strong>
						<p class="muted">Account status is managed separately from SMS consent.</p>
					</div>
					<span class:inactive={farmer.isActive === false} class="status-pill">
						{farmer.isActive === false ? 'Deactivated' : 'Active'}
					</span>
				</div>
			</section>
		</div>

		<section class="panel farms-panel">
			<div class="panel-title panel-title-spaced">
				<div class="title-with-icon">
					<Tractor size={19} />
					<div>
						<h2>Registered farms</h2>
						<p class="muted">{farmer.farms?.length || 0} farm(s) registered</p>
					</div>
				</div>
			</div>

			{#if farmer.farms?.length}
				<div class="farm-list">
					{#each farmer.farms as farm (farm.id)}
						<article class="farm-card">
							<div class="farm-heading">
								<div class="farm-icon"><Sprout size={19} /></div>
								<div class="farm-name">
									<h3>{farm.name || 'Unnamed farm'}</h3>
									<p>{farm.sizeAcres != null ? `${farm.sizeAcres} acres` : 'Farm size not recorded'}</p>
								</div>
							</div>

							<div class="farm-meta">
								<span><MapPin size={14} /> {farm.latitude != null && farm.longitude != null
									? `${farm.latitude}, ${farm.longitude}`
									: 'Location not recorded'}</span>
								<span><CalendarDays size={14} /> Added {formatDate(farm.createdAt)}</span>
							</div>

							<div class="crop-section">
								<h4>Crop cycles ({farm.cropCycles?.length || 0})</h4>
								{#if farm.cropCycles?.length}
									<div class="crop-list">
										{#each farm.cropCycles as cycle (cycle.id)}
											<div class="crop-item">
												<div>
													<strong>{cycle.crop || 'Crop not specified'}</strong>
													{#if cycle.variety}
														<span class="muted"> · {cycle.variety}</span>
													{/if}
													<p class="muted">
														Planted: {formatDate(cycle.plantingDate)}
														{#if cycle.currentStage} · Stage: {statusLabel(cycle.currentStage)}{/if}
													</p>
												</div>
												<span class="cycle-status">{statusLabel(cycle.status || 'Not set')}</span>
											</div>
										{/each}
									</div>
								{:else}
									<p class="empty-inline">No crop cycles recorded for this farm.</p>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<div class="empty-state">
					<Tractor size={25} />
					<strong>No farms registered</strong>
					<p>This farmer does not have any farms recorded yet.</p>
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	:global(body) {
		background: #f6f8f6;
	}

	.page {
		max-width: 1180px;
		margin: 0 auto;
		padding: 28px 32px 48px;
		color: #203329;
	}

	.top-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 22px;
	}

	.back-link, .refresh-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 650;
		text-decoration: none;
	}

	.back-link { color: #39734d; }
	.back-link:hover { color: #245638; }

	.refresh-button {
		border: 1px solid #dce7de;
		border-radius: 8px;
		padding: 9px 12px;
		background: #fff;
		color: #45634e;
		cursor: pointer;
	}
	.refresh-button:disabled { opacity: .6; cursor: wait; }

	.profile-header {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 25px;
		margin-bottom: 20px;
		background: #fff;
		border: 1px solid #e6ece7;
		border-radius: 14px;
		box-shadow: 0 2px 8px rgb(30 60 40 / 3%);
	}

	.avatar, .farm-icon {
		display: grid;
		place-items: center;
		flex: 0 0 auto;
		background: #eaf4ec;
		color: #39734d;
		border-radius: 12px;
		width: 58px;
		height: 58px;
	}

	.profile-heading { min-width: 0; flex: 1; }
	.eyebrow {
		margin: 0 0 5px;
		color: #7a9180;
		font-size: 10px;
		font-weight: 750;
		letter-spacing: .1em;
	}
	h1 { margin: 0; font-size: 25px; line-height: 1.25; color: #203329; }
	.phone-line {
		display: flex;
		align-items: center;
		gap: 7px;
		margin: 8px 0 0;
		color: #64776a;
		font-size: 13px;
	}
	.header-status { align-self: flex-start; }

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 6px 10px;
		border-radius: 20px;
		background: #eaf7ed;
		color: #28794b;
		font-size: 11px;
		font-weight: 700;
		white-space: nowrap;
	}
	.status-pill.inactive { background: #fff0ef; color: #a33b35; }
	.status-pill.consented { background: #eaf7ed; color: #28794b; }
	.status-pill.not-consented { background: #fff5e8; color: #93651f; }

	.content-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 18px;
		margin-bottom: 20px;
	}

	.panel {
		padding: 22px;
		background: #fff;
		border: 1px solid #e6ece7;
		border-radius: 14px;
		box-shadow: 0 2px 8px rgb(30 60 40 / 3%);
		min-width: 0;
	}

	.panel-title {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 20px;
		color: #39734d;
	}
	.panel-title h2 { margin: 0; color: #263c2e; font-size: 16px; font-weight: 700; }
	.panel-title-spaced { justify-content: space-between; margin-bottom: 18px; }
	.title-with-icon { display: flex; align-items: center; gap: 11px; }
	.title-with-icon h2 { margin-bottom: 3px; }

	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px 14px;
	}
	.detail { min-width: 0; }
	.detail-label {
		display: block;
		margin-bottom: 7px;
		color: #829187;
		font-size: 11px;
		font-weight: 650;
	}
	.detail strong {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		color: #304638;
		font-size: 13px;
		font-weight: 650;
		overflow-wrap: anywhere;
	}

	.consent-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 3px 0 16px;
	}
	.consent-row + .consent-row {
		padding-top: 17px;
		border-top: 1px solid #edf1ed;
	}
	.consent-row strong { display: block; color: #304638; font-size: 13px; }
	.muted { color: #819087; font-size: 11px; }
	.consent-row .muted { margin: 5px 0 0; }

	.farms-panel { margin-bottom: 10px; }
	.farm-list { display: grid; gap: 14px; }
	.farm-card {
		padding: 17px;
		border: 1px solid #e8eee9;
		border-radius: 11px;
		background: #fcfdfc;
	}
	.farm-heading { display: flex; align-items: center; gap: 12px; }
	.farm-icon { width: 42px; height: 42px; border-radius: 10px; }
	.farm-name h3 { margin: 0; color: #2b4433; font-size: 14px; }
	.farm-name p { margin: 4px 0 0; color: #7b8b80; font-size: 11px; }
	.farm-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 22px;
		margin: 14px 0;
		color: #77877c;
		font-size: 11px;
	}
	.farm-meta span { display: inline-flex; align-items: center; gap: 6px; }
	.crop-section { padding-top: 13px; border-top: 1px solid #e9efea; }
	.crop-section h4 { margin: 0 0 10px; color: #52695a; font-size: 12px; }
	.crop-list { display: grid; gap: 8px; }
	.crop-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		background: #f5f8f5;
		border-radius: 8px;
	}
	.crop-item strong { color: #36513e; font-size: 12px; }
	.crop-item p { margin: 4px 0 0; }
	.cycle-status {
		flex: 0 0 auto;
		padding: 5px 8px;
		border-radius: 14px;
		background: #edf3ee;
		color: #58705f;
		font-size: 10px;
		font-weight: 650;
	}
	.empty-inline { margin: 0; color: #87948b; font-size: 12px; }
	.empty-state, .state-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 38px 20px;
		color: #809087;
		text-align: center;
	}
	.empty-state strong { margin-top: 10px; color: #53695a; font-size: 13px; }
	.empty-state p, .state-card p { margin: 6px 0 0; font-size: 12px; }

	.state-card {
		min-height: 250px;
		background: #fff;
		border: 1px solid #e6ece7;
		border-radius: 14px;
	}
	.loader {
		width: 26px;
		height: 26px;
		border: 3px solid #e2ece4;
		border-top-color: #438257;
		border-radius: 50%;
		animation: spin .8s linear infinite;
	}
	.error-card {
		display: flex;
		align-items: flex-start;
		gap: 13px;
		padding: 20px;
		background: #fff7f6;
		border: 1px solid #f1d9d6;
		border-radius: 12px;
		color: #a33b35;
	}
	.error-card strong { font-size: 14px; }
	.error-card p { margin: 5px 0 12px; color: #805c58; font-size: 12px; }
	.retry-button {
		border: 0;
		border-radius: 6px;
		padding: 7px 11px;
		background: #a33b35;
		color: #fff;
		font-size: 11px;
		font-weight: 650;
		cursor: pointer;
	}
	.spinning { animation: spin .8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }

	@media (max-width: 760px) {
		.page { padding: 20px 16px 36px; }
		.content-grid { grid-template-columns: 1fr; }
		.profile-header { padding: 18px; gap: 12px; }
		.avatar { width: 48px; height: 48px; }
		h1 { font-size: 20px; }
	}
	@media (max-width: 480px) {
		.profile-header { flex-wrap: wrap; }
		.header-status { width: 100%; margin-left: 60px; }
		.details-grid { grid-template-columns: 1fr; }
		.panel { padding: 17px; }
		.crop-item { align-items: flex-start; flex-direction: column; }
	}
</style>

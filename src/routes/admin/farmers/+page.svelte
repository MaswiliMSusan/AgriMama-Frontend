<script>
	import { onMount } from 'svelte';
	import {
		Search,
		Users,
		UserRound,
		Phone,
		Languages,
		ShieldCheck,
		ShieldAlert,
		ChevronLeft,
		ChevronRight,
		Eye,
		RefreshCw,
		Filter,
		X
	} from 'lucide-svelte';

	const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000').replace(/\/$/, '');

	let farmers = $state([]);
	let loading = $state(true);
	let errorMessage = $state('');
	let searchInput = $state('');
	let appliedSearch = $state('');
	let language = $state('');
	let consent = $state('');
	let page = $state(1);
	let limit = 20;
	let pagination = $state({
		total: 0,
		page: 1,
		limit,
		totalPages: 0
	});

	let showCreateModal = $state(false);
	let creatingFarmer = $state(false);
	let createError = $state('');
	let createSuccess = $state('');
let updatingFarmerId = $state('');
let actionSuccess = $state('');
let actionError = $state('');
	let newFarmer = $state({
		name: '',
		phone: '',
		preferredLanguage: 'dholuo'
	});

	const hasFilters = $derived(Boolean(appliedSearch || language || consent));

	function formatDate(value) {
		if (!value) return '—';

		return new Intl.DateTimeFormat('en-KE', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(value));
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

	async function loadFarmers() {
		loading = true;
		errorMessage = '';

		const params = new URLSearchParams({
			page: String(page),
			limit: String(limit)
		});

		if (appliedSearch.trim()) params.set('search', appliedSearch.trim());
		if (language) params.set('language', language);
		if (consent !== '') params.set('consent', consent);

		try {
			const response = await fetch(`${API_BASE}/admin/farmers?${params.toString()}`, {
				method: 'GET',
				credentials: 'include',
				headers: { Accept: 'application/json' }
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || `Farmer request failed (${response.status})`);
			}

			farmers = result.farmers || [];
			pagination = result.pagination || {
				total: farmers.length,
				page,
				limit,
				totalPages: 1
			};
		} catch (error) {
			console.error('Failed to load farmers:', error);
			errorMessage = error.message || 'Unable to load farmers. Please try again.';
			farmers = [];
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		page = 1;
		appliedSearch = searchInput;
		loadFarmers();
	}

	function clearFilters() {
		searchInput = '';
		appliedSearch = '';
		language = '';
		consent = '';
		page = 1;
		loadFarmers();
	}

	function goToPage(nextPage) {
		if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === page) return;

		page = nextPage;
		loadFarmers();
	}

	function openCreateModal() {
		createError = '';
		createSuccess = '';
		newFarmer = { name: '', phone: '', preferredLanguage: 'dholuo' };
		showCreateModal = true;
	}

	function closeCreateModal() {
		if (creatingFarmer) return;
		showCreateModal = false;
		createError = '';
	}

	async function createFarmer(event) {
		event.preventDefault();
		if (creatingFarmer) return;

		creatingFarmer = true;
		createError = '';
		createSuccess = '';

		try {
			const response = await fetch(`${API_BASE}/admin/farmers`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({
					name: newFarmer.name.trim(),
					phone: newFarmer.phone.trim(),
					preferredLanguage: newFarmer.preferredLanguage
				})
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || `Could not create farmer (${response.status})`);
			}

			showCreateModal = false;
			newFarmer = { name: '', phone: '', preferredLanguage: 'dholuo' };
			page = 1;
			appliedSearch = '';
			searchInput = '';
			language = '';
			consent = '';
			createSuccess = result.message || 'Farmer created successfully.';
			await loadFarmers();
		} catch (error) {
			console.error('Failed to create farmer:', error);
			createError = error.message || 'Unable to create farmer. Please try again.';
		} finally {
			creatingFarmer = false;
		}
	}


	async function toggleFarmerStatus(farmer) {
		if (updatingFarmerId) return;

		const currentlyActive = farmer.isActive !== false;
		const action = currentlyActive ? 'deactivate' : 'reactivate';

		const confirmed = window.confirm(
			currentlyActive
				? `Are you sure you want to deactivate ${farmer.name}? They will no longer be able to access AgriMama.`
				: `Are you sure you want to reactivate ${farmer.name}?`
		);

		if (!confirmed) return;

		updatingFarmerId = farmer.id;
		actionSuccess = '';
		actionError = '';

		try {
			const response = await fetch(
				`${API_BASE}/admin/farmers/${farmer.id}/${action}`,
				{
					method: 'PATCH',
					credentials: 'include',
					headers: { Accept: 'application/json' }
				}
			);

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || `Could not ${action} farmer.`);
			}

			actionSuccess = result.message || `Farmer ${action}d successfully.`;
			await loadFarmers();
		} catch (error) {
			console.error(`Failed to ${action} farmer:`, error);
			actionError = error.message || `Unable to ${action} farmer.`;
		} finally {
			updatingFarmerId = '';
		}
	}

	onMount(() => {
		loadFarmers();
	});
</script>

<svelte:head>
	<title>AgriMama | Farmer Management</title>
	<meta name="description" content="Search and manage registered AgriMama farmers" />
</svelte:head>

<div class="farmers-page">
	<div class="page-heading">
		<div>
			<div class="eyebrow">PLATFORM MANAGEMENT</div>
			<h1>Farmers</h1>
			<p>View registered farmers and their platform registration details.</p>
		</div>

		<div class="heading-actions">
			<button class="add-button" onclick={openCreateModal}>
				<Users size={16} />
				Add Farmer
			</button>
			<button class="refresh-button" onclick={loadFarmers} disabled={loading}>
				<RefreshCw size={16} class={loading ? 'spinning' : ''} />
				Refresh
			</button>
		</div>
	</div>

	<section class="summary-card">
		<div class="summary-icon"><Users size={23} /></div>
		<div>
			<div class="summary-label">Registered farmers</div>
			<div class="summary-value">
				{loading && pagination.total === 0 ? '…' : pagination.total.toLocaleString()}
			</div>
		</div>
	</section>

	<section class="directory-panel">
		<div class="directory-heading">
			<div>
				<h2>Farmer directory</h2>
				<p>Search and filter registered farmer accounts.</p>
			</div>
			{#if hasFilters}
				<button class="clear-button" onclick={clearFilters}>
					<X size={14} /> Clear filters
				</button>
			{/if}
		</div>

		<form
			class="filters"
			onsubmit={(event) => {
				event.preventDefault();
				applyFilters();
			}}
		>
			<label class="search-field">
				<span class="sr-only">Search farmers</span>
				<Search size={18} />
				<input
					bind:value={searchInput}
					placeholder="Search by farmer name or phone..."
					autocomplete="off"
				/>
			</label>

			<label class="filter-field">
				<span class="sr-only">Preferred language</span>
				<Languages size={16} />
				<select bind:value={language}>
					<option value="">All languages</option>
					<option value="english">English</option>
					<option value="kiswahili">Kiswahili</option>
					<option value="dholuo">Dholuo</option>
				</select>
			</label>

			<label class="filter-field">
				<span class="sr-only">SMS consent</span>
				<Filter size={16} />
				<select bind:value={consent}>
					<option value="">All consent statuses</option>
					<option value="true">Consented</option>
					<option value="false">Not consented</option>
				</select>
			</label>

			<button class="search-button" type="submit" disabled={loading}>
				<Search size={16} />
				Search
			</button>
		</form>

		{#if errorMessage}
			<div class="error-banner" role="alert">
				<span>{errorMessage}</span>
				<button onclick={loadFarmers}>Try again</button>
			</div>
		{/if}

		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Farmer</th>
						<th>Phone number</th>
						<th>Language</th>
						<th>SMS consent</th>
						<th>Account status</th>
						<th>Farms</th>
						<th>Registered</th>
						<th><span class="sr-only">Actions</span></th>
					</tr>
				</thead>

				<tbody>
					{#if loading}
						{#each [1, 2, 3, 4, 5] as item}
							<tr>
								<td colspan="8" class="loading-row">
									<span class="loading-line"></span>
								</td>
							</tr>
						{/each}
					{:else if farmers.length > 0}
						{#each farmers as farmer (farmer.id)}
							<tr>
								<td>
									<div class="farmer-cell">
										<div class="farmer-avatar">
											<UserRound size={18} />
										</div>
										<div class="farmer-name">
											<strong>{farmer.name || 'Unnamed farmer'}</strong>
											<small>Farmer account</small>
										</div>
									</div>
								</td>

								<td>
									<span class="phone-cell">
										<Phone size={14} />
										{farmer.phone || 'Not provided'}
									</span>
								</td>

								<td>{languageLabel(farmer.preferredLanguage)}</td>

								<td>
									{#if farmer.consentStatus}
										<span class="status consented">
											<ShieldCheck size={14} /> Consented
										</span>
									{:else}
										<span class="status not-consented">
											<ShieldAlert size={14} /> Not consented
										</span>
									{/if}
								</td>

								<td>
									{#if farmer.isActive === false}
										<span class="status account-inactive">Deactivated</span>
									{:else}
										<span class="status account-active">Active</span>
									{/if}
								</td>

								<td><span class="farm-count">{farmer.farmCount ?? 0}</span></td>
								<td class="date-cell">{formatDate(farmer.createdAt)}</td>

								<td>
									<a
										class="view-link"
										href={`/admin/farmers/${farmer.id}`}
										aria-label={`View ${farmer.name || 'farmer'} profile`}
									>
										<Eye size={16} />
										View
									</a>
									<button
										class="status-action"
										class:reactivate-action={farmer.isActive === false}
										onclick={() => toggleFarmerStatus(farmer)}
										disabled={Boolean(updatingFarmerId)}
									>
										{#if updatingFarmerId === farmer.id}
											Updating…
										{:else if farmer.isActive === false}
											Reactivate
										{:else}
											Deactivate
										{/if}
									</button>
								</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="8">
								<div class="empty-state">
									<div class="empty-icon"><Users size={27} /></div>
									<strong>No farmers found</strong>
									<p>
										{hasFilters
											? 'Try changing your search or filters.'
											: 'Registered farmers will appear here.'}
									</p>
									{#if hasFilters}
										<button class="clear-button" onclick={clearFilters}> Clear filters </button>
									{/if}
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<div class="table-footer">
			<div class="results-count">
				{#if pagination.total > 0}
					Showing
					{(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)}
					of {pagination.total} farmers
				{:else}
					No farmer records
				{/if}
			</div>

			<div class="pagination">
				<button
					aria-label="Previous page"
					onclick={() => goToPage(page - 1)}
					disabled={loading || page <= 1}
				>
					<ChevronLeft size={17} />
				</button>
				<span>Page {pagination.totalPages ? page : 0} of {pagination.totalPages}</span>
				<button
					aria-label="Next page"
					onclick={() => goToPage(page + 1)}
					disabled={loading || page >= pagination.totalPages}
				>
					<ChevronRight size={17} />
				</button>
			</div>
		</div>
	</section>

	{#if createSuccess}
		<div class="success-banner" role="status">
			<ShieldCheck size={16} />
			{createSuccess}
			<button aria-label="Dismiss message" onclick={() => (createSuccess = '')}>
				<X size={15} />
			</button>
		</div>
	{/if}

	{#if actionSuccess}
		<div class="success-banner" role="status">
			<ShieldCheck size={16} />
			{actionSuccess}
			<button aria-label="Dismiss message" onclick={() => (actionSuccess = '')}>
				<X size={15} />
			</button>
		</div>
	{/if}

	{#if actionError}
		<div class="error-banner action-error" role="alert">
			<span>{actionError}</span>
			<button aria-label="Dismiss message" onclick={() => (actionError = '')}>
				<X size={15} />
			</button>
		</div>
	{/if}

	{#if showCreateModal}
		<div
			class="modal-backdrop"
			role="presentation"
			onclick={(event) => {
				if (event.target === event.currentTarget) closeCreateModal();
			}}
			onkeydown={(event) => {
				if (event.key === 'Escape') closeCreateModal();
			}}
		>
			<section
				class="create-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="create-farmer-title"
			>
				<div class="modal-heading">
					<div>
						<div class="eyebrow">FARMER MANAGEMENT</div>
						<h2 id="create-farmer-title">Add a farmer</h2>
						<p>Enter the farmer's details to create their AgriMama record.</p>
					</div>
					<button
						class="modal-close"
						type="button"
						aria-label="Close dialog"
						onclick={closeCreateModal}
						disabled={creatingFarmer}
					>
						<X size={19} />
					</button>
				</div>

				{#if createError}
					<div class="error-banner modal-error" role="alert">{createError}</div>
				{/if}

				<form class="create-form" onsubmit={createFarmer}>
					<label>
						<span>Farmer name <b>*</b></span>
						<input
							bind:value={newFarmer.name}
							type="text"
							placeholder="Enter full name"
							autocomplete="name"
							required
							maxlength="150"
						/>
					</label>

					<label>
						<span>Phone number <b>*</b></span>
						<input
							bind:value={newFarmer.phone}
							type="tel"
							placeholder="+254700000000"
							autocomplete="tel"
							inputmode="tel"
							required
							title="Use international format, e.g. +254700000000"
						/>
						<small>Use international format, including the country code.</small>
					</label>

					<label>
						<span>Preferred language <b>*</b></span>
						<select bind:value={newFarmer.preferredLanguage} required>
							<option value="english">English</option>
							<option value="kiswahili">Kiswahili</option>
							<option value="dholuo">Dholuo</option>
						</select>
					</label>

					<div class="consent-notice">
						<ShieldAlert size={18} />
						<div>
							<strong>SMS consent is not collected here</strong>
							<p>
								This farmer will be created with SMS consent set to “Not consented”. Consent must be
								obtained and recorded separately.
							</p>
						</div>
					</div>

					<div class="modal-actions">
						<button
							class="cancel-button"
							type="button"
							onclick={closeCreateModal}
							disabled={creatingFarmer}
						>
							Cancel
						</button>
						<button class="submit-button" type="submit" disabled={creatingFarmer}>
							{#if creatingFarmer}
								Creating…
							{:else}
								Create farmer
							{/if}
						</button>
					</div>
				</form>
			</section>
		</div>
	{/if}

	<p class="page-note">
		Farmer records are retrieved from the AgriMama backend. Admin-created farmers can use the
		existing farmer OTP login process.
	</p>
</div>

<style>
	.farmers-page {
		display: grid;
		gap: 22px;
	}

	.page-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
	}

	.eyebrow {
		margin-bottom: 9px;
		color: #28794b;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 1.4px;
	}
	h1 {
		margin: 0 0 8px;
		color: #173f28;
		font-size: 30px;
		letter-spacing: -0.8px;
	}
	.page-heading p,
	.directory-heading p {
		margin: 0;
		color: #526357;
		font-size: 13px;
		line-height: 1.6;
	}
	.heading-actions {
		display: flex;
		align-items: center;
		gap: 9px;
		flex-shrink: 0;
	}
	.add-button,
	.submit-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 14px;
		border: 1px solid #28794b;
		border-radius: 8px;
		background: #28794b;
		color: white;
		font-size: 13px;
		font-weight: 650;
		cursor: pointer;
	}
	.add-button:hover,
	.submit-button:hover:not(:disabled) {
		background: #1f633b;
	}

	.refresh-button,
	.search-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 14px;
		border: 1px solid #dce8dd;
		border-radius: 8px;
		background: white;
		color: #234c35;
		font-size: 13px;
		font-weight: 650;
		cursor: pointer;
	}

	.refresh-button:disabled,
	.search-button:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	.spinning {
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.summary-card {
		display: flex;
		align-items: center;
		gap: 14px;
		width: fit-content;
		min-width: 230px;
		padding: 17px 20px;
		border: 1px solid #e5ece5;
		border-radius: 12px;
		background: white;
	}

	.summary-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 11px;
		background: #edf6ee;
		color: #28794b;
	}
	.summary-label {
		color: #526357;
		font-size: 12px;
	}
	.summary-value {
		margin-top: 3px;
		color: #173f28;
		font-size: 24px;
		font-weight: 750;
	}

	.directory-panel {
		min-width: 0;
		overflow: hidden;
		border: 1px solid #e5ece5;
		border-radius: 13px;
		background: white;
	}
	.directory-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 22px 22px 18px;
	}
	.directory-heading h2 {
		margin: 0 0 6px;
		color: #173f28;
		font-size: 17px;
	}

	.filters {
		display: grid;
		grid-template-columns: minmax(220px, 1.5fr) minmax(150px, 0.8fr) minmax(170px, 0.9fr) auto;
		gap: 10px;
		padding: 0 22px 19px;
	}
	.search-field,
	.filter-field {
		display: flex;
		align-items: center;
		gap: 9px;
		min-width: 0;
		height: 42px;
		padding: 0 11px;
		border: 1px solid #dde6de;
		border-radius: 8px;
		color: #68776c;
	}
	.search-field input,
	.filter-field select {
		width: 100%;
		min-width: 0;
		border: 0;
		outline: 0;
		background: transparent;
		color: #26382c;
		font: inherit;
		font-size: 12px;
	}
	.search-field:focus-within,
	.filter-field:focus-within {
		border-color: #6dab7c;
		box-shadow: 0 0 0 2px #28794b18;
	}
	.filter-field select {
		cursor: pointer;
	}
	.search-button {
		border-color: #28794b;
		background: #28794b;
		color: white;
	}
	.search-button:hover:not(:disabled) {
		background: #1f633b;
	}

	.clear-button {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 7px 9px;
		border: 0;
		border-radius: 6px;
		background: #f0f6f0;
		color: #28794b;
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}

	.error-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin: 0 22px 16px;
		padding: 12px 14px;
		border: 1px solid #f0c8c5;
		border-radius: 8px;
		background: #fff4f3;
		color: #8b302a;
		font-size: 12px;
	}
	.error-banner button {
		border: 0;
		background: transparent;
		color: #8b302a;
		font-weight: 700;
		cursor: pointer;
		text-decoration: underline;
	}

	.table-wrap {
		width: 100%;
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		white-space: nowrap;
	}
	thead {
		background: #f7f9f6;
	}
	th {
		padding: 12px 15px;
		color: #68776c;
		font-size: 10px;
		font-weight: 750;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}
	th:first-child,
	td:first-child {
		padding-left: 22px;
	}
	th:last-child,
	td:last-child {
		padding-right: 22px;
	}
	td {
		padding: 14px 15px;
		border-top: 1px solid #edf1ed;
		color: #405448;
		font-size: 12px;
	}

	.farmer-cell {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.farmer-avatar {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		border-radius: 50%;
		background: #edf6ee;
		color: #28794b;
	}
	.farmer-name strong {
		display: block;
		color: #26382c;
		font-size: 12px;
	}
	.farmer-name small {
		display: block;
		margin-top: 4px;
		color: #849087;
		font-size: 10px;
	}
	.phone-cell {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.phone-cell svg {
		color: #849087;
	}
	.status {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 6px 8px;
		border-radius: 6px;
		font-size: 10px;
		font-weight: 650;
	}
	.consented {
		background: #eaf7ed;
		color: #28794b;
	}
	.not-consented {
		background: #fff5e8;
		color: #93651f;
	}
	.account-active {
		background: #eaf7ed;
		color: #28794b;
	}
	.account-inactive {
		background: #fff0ef;
		color: #a33b35;
	}
	.status-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: 8px;
		padding: 7px 9px;
		border: 1px solid #e5caca;
		border-radius: 6px;
		background: #fff7f7;
		color: #a33b3b;
		font-size: 11px;
		font-weight: 650;
		cursor: pointer;
	}
	.status-action:hover:not(:disabled) {
		background: #fdeaea;
	}
	.status-action.reactivate-action {
		border-color: #c9e4d1;
		background: #f0faf3;
		color: #28794b;
	}
	.status-action:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	.action-error {
		margin-top: 0;
	}
	.farm-count {
		display: inline-grid;
		place-items: center;
		min-width: 25px;
		height: 25px;
		padding: 0 6px;
		border-radius: 7px;
		background: #f0f4f0;
		color: #405448;
		font-weight: 700;
	}
	.date-cell {
		color: #68776c;
	}
	.view-link {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: #28794b;
		font-size: 11px;
		font-weight: 700;
		text-decoration: none;
	}
	.view-link:hover {
		text-decoration: underline;
	}

	.loading-row {
		height: 54px;
	}
	.loading-line {
		display: block;
		width: 65%;
		height: 10px;
		border-radius: 8px;
		background: #edf1ed;
		animation: pulse 1.2s ease-in-out infinite alternate;
	}
	@keyframes pulse {
		to {
			opacity: 0.45;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 230px;
		text-align: center;
		white-space: normal;
	}
	.empty-icon {
		display: grid;
		place-items: center;
		width: 54px;
		height: 54px;
		margin-bottom: 12px;
		border-radius: 14px;
		background: #f0f6f0;
		color: #28794b;
	}
	.empty-state strong {
		color: #26382c;
		font-size: 13px;
	}
	.empty-state p {
		max-width: 270px;
		margin: 7px 0 13px;
		color: #68776c;
		font-size: 12px;
		line-height: 1.6;
	}

	.table-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 15px 22px;
		border-top: 1px solid #edf1ed;
	}
	.results-count {
		color: #68776c;
		font-size: 11px;
	}
	.pagination {
		display: flex;
		align-items: center;
		gap: 11px;
		color: #526357;
		font-size: 11px;
	}
	.pagination button {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border: 1px solid #dde6de;
		border-radius: 7px;
		background: white;
		color: #405448;
		cursor: pointer;
	}
	.pagination button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.page-note {
		margin: 0;
		color: #68776c;
		font-size: 11px;
		line-height: 1.6;
	}
	.success-banner {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 12px 14px;
		border: 1px solid #cde6d1;
		border-radius: 8px;
		background: #f0f8f1;
		color: #23643a;
		font-size: 12px;
	}
	.success-banner button {
		display: grid;
		place-items: center;
		margin-left: auto;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgba(16, 35, 23, 0.48);
	}
	.create-modal {
		width: min(100%, 490px);
		max-height: calc(100vh - 40px);
		overflow-y: auto;
		padding: 25px;
		border: 1px solid #e5ece5;
		border-radius: 14px;
		background: white;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
	}
	.modal-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 15px;
		margin-bottom: 22px;
	}
	.modal-heading h2 {
		margin: 0 0 6px;
		color: #173f28;
		font-size: 21px;
	}
	.modal-heading p {
		margin: 0;
		color: #68776c;
		font-size: 12px;
		line-height: 1.5;
	}
	.modal-close {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		border: 1px solid #e1e9e1;
		border-radius: 8px;
		background: white;
		color: #526357;
		cursor: pointer;
	}
	.create-form {
		display: grid;
		gap: 16px;
	}
	.create-form label {
		display: grid;
		gap: 7px;
		color: #344a3a;
		font-size: 12px;
		font-weight: 650;
	}
	.create-form label b {
		color: #b33a32;
	}
	.create-form input,
	.create-form select {
		width: 100%;
		box-sizing: border-box;
		height: 43px;
		padding: 0 12px;
		border: 1px solid #dde6de;
		border-radius: 8px;
		outline: 0;
		background: white;
		color: #26382c;
		font: inherit;
		font-size: 13px;
	}
	.create-form input:focus,
	.create-form select:focus {
		border-color: #6dab7c;
		box-shadow: 0 0 0 2px #28794b18;
	}
	.create-form label small {
		color: #78867c;
		font-size: 10px;
		font-weight: 400;
	}
	.consent-notice {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 12px;
		border: 1px solid #f0dfbf;
		border-radius: 8px;
		background: #fffaf1;
		color: #8b6427;
	}
	.consent-notice > svg {
		flex-shrink: 0;
		margin-top: 1px;
	}
	.consent-notice strong {
		display: block;
		margin-bottom: 4px;
		font-size: 11px;
	}
	.consent-notice p {
		margin: 0;
		color: #795f37;
		font-size: 11px;
		line-height: 1.5;
	}
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 9px;
		margin-top: 5px;
	}
	.cancel-button {
		padding: 10px 14px;
		border: 1px solid #dde6de;
		border-radius: 8px;
		background: white;
		color: #405448;
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}
	.cancel-button:disabled,
	.submit-button:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	.modal-error {
		margin: 0;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 1000px) {
		.filters {
			grid-template-columns: 1fr 1fr;
		}
		.search-field {
			grid-column: 1 / -1;
		}
	}

	@media (max-width: 600px) {
		.page-heading {
			align-items: flex-start;
			flex-direction: column;
		}
		.heading-actions {
			width: 100%;
		}
		.heading-actions button {
			flex: 1;
		}
		.create-modal {
			padding: 20px;
		}
		.directory-heading {
			align-items: flex-start;
			padding: 18px 16px 15px;
		}
		.filters {
			grid-template-columns: 1fr;
			padding: 0 16px 16px;
		}
		.search-field {
			grid-column: auto;
		}
		.table-footer {
			align-items: flex-start;
			flex-direction: column;
			padding: 14px 16px;
		}
		th:first-child,
		td:first-child {
			padding-left: 16px;
		}
		th:last-child,
		td:last-child {
			padding-right: 16px;
		}
		.error-banner {
			margin-right: 16px;
			margin-left: 16px;
		}
	}
</style>

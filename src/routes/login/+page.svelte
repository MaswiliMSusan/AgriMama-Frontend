
<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getAuthState } from '#lib/stores/auth.svelte.js';
	import { api } from '#lib/services/api.js';

	const auth = getAuthState();

	// Farmers are the default users.
	let activeTab = $state('farmer');
	let email = $state('');
	let password = $state('');
	let phone = $state('');
	let farmerName = $state('');
	let preferredLanguage = $state('en');
	let consentStatus = $state(false);
	let farmerMode = $state('login');
	let otp = $state('');
	let otpSent = $state(false);
	let loading = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let redirecting = $state(false);

	function getHomeRoute(role) {
		switch (role) {
			case 'admin':
				return '/admin';
			case 'staff':
				return '/staff';
			case 'farmer':
				return '/farmer';
			default:
				return '/login';
		}
	}

	onMount(() => {
		auth.initialize();
	});

	$effect(() => {
		const initialized = auth.isInitialized;
		const authenticatedUser = auth.user;

		if (initialized && authenticatedUser && !redirecting) {
			redirecting = true;

			void goto(getHomeRoute(authenticatedUser.role), {
				replaceState: true
			}).catch((error) => {
				console.error('Dashboard navigation failed:', error);
				redirecting = false;
				errorMessage = 'Unable to open your dashboard. Please try again.';
			});
		}
	});

	function switchTab(tab) {
		activeTab = tab;
		errorMessage = '';
		successMessage = '';
		otpSent = false;
		otp = '';
		farmerMode = 'login';
	}

	function switchFarmerMode(mode) {
		farmerMode = mode;
		errorMessage = '';
		successMessage = '';
		otpSent = false;
		otp = '';
	}

	async function handleFarmerRegistration(event) {
		event.preventDefault();
		errorMessage = '';
		successMessage = '';

		const normalizedPhone = phone.trim();
		const normalizedName = farmerName.trim();

		if (normalizedName.length < 2) {
			errorMessage = 'Please enter your full name.';
			return;
		}

		if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
			errorMessage = 'Enter a valid phone number with country code, e.g. +254700000000.';
			return;
		}

		if (!consentStatus) {
			errorMessage = 'Please confirm your consent to create an AgriMama account.';
			return;
		}

		loading = true;

		try {
			await api.post('/farmers', {
				name: normalizedName,
				phone: normalizedPhone,
				preferredLanguage,
				consentStatus: true
			});
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to create your account. Please try again.';
			loading = false;
			return;
		}

		try {
			await auth.requestFarmerOtp(normalizedPhone);
			otpSent = true;
			successMessage = 'Your account is ready. We have sent a verification code to your phone.';
		} catch (error) {
			successMessage =
				"Your account was created, but we couldn't send the verification code. Switch to Sign in and request a code again.";
			farmerMode = 'login';
		} finally {
			loading = false;
		}
	}

	async function handleStaffLogin(event) {
		event.preventDefault();

		errorMessage = '';
		successMessage = '';

		if (!email.trim() || !password) {
			errorMessage = 'Please enter your email and password.';
			return;
		}

		loading = true;

		try {
			await auth.staffLogin(email.trim(), password);
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function handleRequestOtp(event) {
		event.preventDefault();

		errorMessage = '';
		successMessage = '';

		const normalizedPhone = phone.trim();

		if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
			errorMessage = 'Enter a valid phone number with country code, e.g. +254700000000';
			return;
		}

		loading = true;

		try {
			const response = await auth.requestFarmerOtp(normalizedPhone);
			otpSent = true;
			successMessage = response.message || 'Your verification code has been requested.';
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to request an OTP. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function handleVerifyOtp(event) {
		event.preventDefault();

		errorMessage = '';
		successMessage = '';

		if (!/^\d{6}$/.test(otp.trim())) {
			errorMessage = 'Enter the six-digit verification code.';
			return;
		}

		loading = true;

		try {
			await auth.verifyFarmerOtp(phone.trim(), otp.trim());
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Invalid verification code. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In or Register | AgriMama</title>
	<meta name="description" content="Sign in or create your AgriMama farmer account." />
</svelte:head>

<div class="login-page">
	<div class="login-container">
		<div class="brand">
			<div class="brand-icon">A</div>
			<div>
				<h1>AgriMama</h1>
				<p>Growing smarter, together.</p>
			</div>
		</div>

		<div class="login-card">
			<div class="welcome">
				<h2>Welcome to AgriMama</h2>
				<p>Sign in or create your farmer account to get started.</p>
			</div>

			<div class="tabs">
				<button
					type="button"
					class:active={activeTab === 'farmer'}
					onclick={() => switchTab('farmer')}
				>
					Farmer
				</button>

				<button
					type="button"
					class:active={activeTab === 'staff'}
					onclick={() => switchTab('staff')}
				>
					Staff / Admin
				</button>
			</div>

			{#if errorMessage}
				<div class="alert error" role="alert">
					{errorMessage}
				</div>
			{/if}

			{#if successMessage}
				<div class="alert success" role="status">
					{successMessage}
				</div>
			{/if}

			{#if activeTab === 'staff'}
				<form onsubmit={handleStaffLogin}>
					<div class="form-group">
						<label for="email">Email address</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							placeholder="name@example.com"
							autocomplete="username"
							required
						/>
					</div>

					<div class="form-group">
						<label for="password">Password</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							placeholder="Enter your password"
							autocomplete="current-password"
							required
						/>
					</div>

					<button class="submit-button" type="submit" disabled={loading}>
						{loading ? 'Signing in...' : 'Sign in'}
					</button>
				</form>
			{:else}
				<div class="farmer-mode-tabs" aria-label="Farmer account options">
					<button
						type="button"
						class:active={farmerMode === 'login'}
						onclick={() => switchFarmerMode('login')}
					>
						Sign in
					</button>

					<button
						type="button"
						class:active={farmerMode === 'register'}
						onclick={() => switchFarmerMode('register')}
					>
						Create account
					</button>
				</div>

				{#if farmerMode === 'register' && !otpSent}
					<form onsubmit={handleFarmerRegistration}>
						<div class="form-group">
							<label for="farmer-name">Your name</label>
							<input
								id="farmer-name"
								type="text"
								bind:value={farmerName}
								placeholder="e.g. Mary"
								autocomplete="name"
								maxlength="120"
								required
							/>
						</div>

						<div class="form-group">
							<label for="register-phone">Phone number</label>
							<input
								id="register-phone"
								type="tel"
								bind:value={phone}
								oninput={() => {
									errorMessage = '';
									successMessage = '';
								}}
								placeholder="+254700000000"
								autocomplete="tel"
								required
							/>
							<small>Include your country code.</small>
						</div>

						<div class="form-group">
							<label for="preferred-language">Preferred language</label>
							<select id="preferred-language" bind:value={preferredLanguage}>
								<option value="en">English</option>
								<option value="sw">Kiswahili</option>
								<option value="dholuo">Dholuo</option>
							</select>
						</div>

						<label class="consent-option">
							<input type="checkbox" bind:checked={consentStatus} />
							<span>
								I agree to create an AgriMama account and allow my details to be used to provide
								farming support.
							</span>
						</label>

						<button class="submit-button" type="submit" disabled={loading}>
							{loading ? 'Creating account...' : 'Create account'}
						</button>
					</form>
				{:else if !otpSent}
					<form onsubmit={handleRequestOtp}>
						<div class="form-group">
							<label for="phone">Phone number</label>
							<input
								id="phone"
								type="tel"
								bind:value={phone}
								placeholder="+254700000000"
								autocomplete="tel"
								required
							/>
							<small>Include your country code.</small>
						</div>

						<button class="submit-button" type="submit" disabled={loading}>
							{loading ? 'Requesting code...' : 'Send verification code'}
						</button>
					</form>
				{:else}
					<form onsubmit={handleVerifyOtp}>
						<div class="otp-heading">
							<h3>Verify your phone</h3>
							<p>Enter the six-digit code sent to {phone}.</p>
						</div>

						<div class="form-group">
							<label for="otp">Verification code</label>
							<input
								id="otp"
								type="text"
								inputmode="numeric"
								maxlength="6"
								bind:value={otp}
								placeholder="000000"
								autocomplete="one-time-code"
								required
							/>
						</div>

						<button class="submit-button" type="submit" disabled={loading}>
							{loading ? 'Verifying...' : 'Verify and sign in'}
						</button>

						<button
							class="back-button"
							type="button"
							onclick={() => {
								otpSent = false;
								otp = '';
								errorMessage = '';
								successMessage = '';
							}}
						>
							Change phone number
						</button>
					</form>
				{/if}
			{/if}

			<div class="security-note">
				<span>🔒</span>
				Your account and information are securely protected.
			</div>
		</div>

		<p class="footer">
			© {new Date().getFullYear()} AgriMama. All rights reserved.
		</p>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px 20px;
		background: #f5f8f3;
	}

	.login-container {
		width: 100%;
		max-width: 440px;
	}

	.brand {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 30px;
	}

	.brand-icon {
		width: 48px;
		height: 48px;
		display: grid;
		place-items: center;
		border-radius: 14px;
		background: #28794b;
		color: white;
		font-size: 25px;
		font-weight: 800;
	}

	.brand h1 {
		margin: 0;
		color: #234c35;
		font-size: 25px;
		font-weight: 800;
	}

	.brand p {
		margin: 3px 0 0;
		color: #78877c;
		font-size: 13px;
	}

	.login-card {
		padding: 36px;
		background: white;
		border: 1px solid #e8eee7;
		border-radius: 18px;
		box-shadow: 0 12px 40px rgba(35, 76, 53, 0.07);
	}

	.welcome {
		margin-bottom: 27px;
	}

	.welcome h2 {
		margin: 0 0 8px;
		color: #263b2d;
		font-size: 25px;
		font-weight: 750;
	}

	.welcome p {
		margin: 0;
		color: #78877c;
		font-size: 14px;
	}

	.tabs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5px;
		padding: 5px;
		margin-bottom: 25px;
		background: #f2f5f1;
		border-radius: 10px;
	}

	.tabs button {
		padding: 11px 8px;
		border: none;
		border-radius: 7px;
		background: transparent;
		color: #718075;
		font-size: 13px;
		font-weight: 650;
		cursor: pointer;
	}

	.tabs button.active {
		background: white;
		color: #28794b;
		box-shadow: 0 2px 7px rgba(0, 0, 0, 0.06);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}

	.form-group label {
		color: #34483a;
		font-size: 13px;
		font-weight: 650;
	}

	.form-group input {
		width: 100%;
		box-sizing: border-box;
		padding: 13px 14px;
		border: 1px solid #dce5dc;
		border-radius: 8px;
		outline: none;
		background: white;
		color: #263b2d;
		font-size: 14px;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.form-group input:focus {
		border-color: #39875a;
		box-shadow: 0 0 0 3px rgba(57, 135, 90, 0.1);
	}

	.form-group small {
		color: #829087;
		font-size: 12px;
	}

	.submit-button {
		width: 100%;
		padding: 14px;
		border: none;
		border-radius: 8px;
		background: #28794b;
		color: white;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
	}

	.submit-button:hover:not(:disabled) {
		background: #1f603a;
	}

	.submit-button:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.farmer-mode-tabs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5px;
		padding: 4px;
		margin: -8px 0 22px;
		border-radius: 9px;
		background: #f2f5f1;
	}

	.farmer-mode-tabs button {
		min-height: 38px;
		border: 0;
		border-radius: 7px;
		background: transparent;
		color: #718075;
		font-size: 12px;
		font-weight: 650;
		cursor: pointer;
	}

	.farmer-mode-tabs button.active {
		background: #fff;
		color: #28794b;
		box-shadow: 0 2px 7px rgba(0, 0, 0, 0.06);
	}

	.form-group select {
		width: 100%;
		box-sizing: border-box;
		padding: 13px 14px;
		border: 1px solid #dce5dc;
		border-radius: 8px;
		outline: none;
		background: #fff;
		color: #263b2d;
		font: inherit;
		font-size: 14px;
	}

	.form-group select:focus {
		border-color: #39875a;
		box-shadow: 0 0 0 3px rgba(57, 135, 90, 0.1);
	}

	.consent-option {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin: 2px 0 20px;
		color: #68786d;
		font-size: 12px;
		line-height: 1.55;
		cursor: pointer;
	}

	.consent-option input {
		width: 16px;
		height: 16px;
		flex: 0 0 16px;
		margin: 1px 0 0;
		accent-color: #28794b;
	}

	.back-button {
		display: block;
		width: 100%;
		margin-top: 15px;
		padding: 8px;
		border: none;
		background: transparent;
		color: #28794b;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}

	.alert {
		padding: 12px 14px;
		margin-bottom: 20px;
		border-radius: 8px;
		font-size: 13px;
		line-height: 1.5;
	}

	.alert.error {
		border: 1px solid #f1cccc;
		background: #fff3f3;
		color: #a52b2b;
	}

	.alert.success {
		border: 1px solid #cce7d2;
		background: #f0faf2;
		color: #28794b;
	}

	.otp-heading {
		margin-bottom: 20px;
	}

	.otp-heading h3 {
		margin: 0 0 7px;
		color: #34483a;
		font-size: 17px;
	}

	.otp-heading p {
		margin: 0;
		color: #78877c;
		font-size: 13px;
		line-height: 1.6;
	}

	.security-note {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		margin-top: 25px;
		color: #87938a;
		font-size: 11px;
		text-align: center;
	}

	.footer {
		margin-top: 25px;
		color: #9aa49d;
		font-size: 12px;
		text-align: center;
	}

	@media (max-width: 480px) {
		.login-card {
			padding: 25px 20px;
		}
	}
</style>

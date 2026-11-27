
<script>
  import { onMount } from "svelte";

  import {
    Users,
    UserPlus,
    Search,
    RefreshCw,
    ShieldCheck,
    UserCheck,
    UserX,
    Pencil,
    KeyRound,
    X,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    Clock3
  } from "lucide-svelte";

  import { getAuthState } from "#lib/stores/auth.svelte.js";

  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"
  ).replace(/\/$/, "");

  const auth = getAuthState();
  const currentUser = $derived(auth.user);
  const isAdmin = $derived(currentUser?.role === "admin");

  let users = $state([]);
  let loading = $state(true);
  let saving = $state(false);
  let actionLoading = $state("");

  let errorMessage = $state("");
  let successMessage = $state("");

  let searchQuery = $state("");
  let roleFilter = $state("");
  let statusFilter = $state("");

  let page = $state(1);
  let limit = 20;
  let totalUsers = $state(0);
  let totalPages = $state(1);

  let showUserModal = $state(false);
  let showPasswordModal = $state(false);

  let editingUser = $state(null);
  let passwordUser = $state(null);

  let userForm = $state({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    password: ""
  });

  let newPassword = $state("");

  const activeCount = $derived(
    users.filter((user) => user.isActive).length
  );

  const inactiveCount = $derived(
    users.filter((user) => !user.isActive).length
  );

  const adminCount = $derived(
    users.filter((user) => user.role === "admin").length
  );

  function formatDate(value) {
    if (!value) return "Never";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function clearMessages() {
    errorMessage = "";
    successMessage = "";
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || `Request failed (${response.status})`
      );
    }

    return result;
  }

  async function loadUsers() {
    loading = true;
    clearMessages();

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      if (roleFilter) {
        params.set("role", roleFilter);
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const result = await apiRequest(
        `/api/admin/users?${params.toString()}`
      );

      users = result.users || [];

      totalUsers = result.pagination?.total || 0;
      totalPages = Math.max(
        1,
        result.pagination?.totalPages || 1
      );
    } catch (error) {
      errorMessage = error.message;
      users = [];
    } finally {
      loading = false;
    }
  }

  function applyFilters() {
    page = 1;
    loadUsers();
  }

  function changePage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) return;

    page = nextPage;
    loadUsers();
  }

  function openCreateModal() {
    clearMessages();

    editingUser = null;

    userForm = {
      name: "",
      email: "",
      phone: "",
      role: "staff",
      password: ""
    };

    showUserModal = true;
  }

  function openEditModal(user) {
    clearMessages();

    editingUser = user;

    userForm = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "staff",
      password: ""
    };

    showUserModal = true;
  }

  function closeUserModal() {
    if (saving) return;

    showUserModal = false;
    editingUser = null;
  }

  async function saveUser(event) {
    event.preventDefault();

    if (saving) return;

    saving = true;
    clearMessages();

    try {
      const payload = {
        name: userForm.name.trim(),
        email: userForm.email.trim().toLowerCase(),
        phone: userForm.phone.trim() || null,
        role: userForm.role
      };

      if (!editingUser) {
        payload.password = userForm.password;
      }

      const path = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";

      const result = await apiRequest(path, {
        method: editingUser ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });

      showUserModal = false;

      successMessage = result.message ||
        (editingUser
          ? "User updated successfully."
          : "User created successfully.");

      await loadUsers();
    } catch (error) {
      errorMessage = error.message;
    } finally {
      saving = false;
    }
  }

  async function toggleUserStatus(user) {
    if (actionLoading) return;

    clearMessages();

    const action = user.isActive ? "deactivate" : "reactivate";

    if (user.id === currentUser?.id && action === "deactivate") {
      errorMessage = "You cannot deactivate your own account.";
      return;
    }

    const confirmed = window.confirm(
      user.isActive
        ? `Are you sure you want to deactivate ${user.name}? They will no longer be able to access AgriMama.`
        : `Reactivate ${user.name}'s account?`
    );

    if (!confirmed) return;

    actionLoading = user.id;

    try {
      const result = await apiRequest(
        `/api/admin/users/${user.id}/${action}`,
        { method: "PATCH" }
      );

      successMessage = result.message;
      await loadUsers();
    } catch (error) {
      errorMessage = error.message;
    } finally {
      actionLoading = "";
    }
  }

  function openPasswordModal(user) {
    clearMessages();

    passwordUser = user;
    newPassword = "";
    showPasswordModal = true;
  }

  async function resetPassword(event) {
    event.preventDefault();

    if (!passwordUser || saving) return;

    saving = true;
    clearMessages();

    try {
      const result = await apiRequest(
        `/api/admin/users/${passwordUser.id}/password`,
        {
          method: "PATCH",
          body: JSON.stringify({
            password: newPassword
          })
        }
      );

      successMessage = result.message;
      showPasswordModal = false;
      passwordUser = null;
      newPassword = "";
    } catch (error) {
      errorMessage = error.message;
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    if (isAdmin) {
      loadUsers();
    } else {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>User Management | AgriMama</title>
  <meta
    name="description"
    content="Manage AgriMama administrator and staff accounts."
  />
</svelte:head>

<div class="users-page">
  <div class="page-header">
    <div>
      <div class="eyebrow">
        <ShieldCheck size={15} />
        PLATFORM CONFIGURATION
      </div>

      <h1>User Management</h1>

      <p>
        Manage administrator and staff accounts and control access
        to the AgriMama platform.
      </p>
    </div>

    <div class="header-actions">
      <button
        class="refresh-button"
        onclick={loadUsers}
        disabled={loading}
      >
        <RefreshCw size={16} class={loading ? "spinning" : ""} />
        Refresh
      </button>

      <button
        class="primary-button"
        onclick={openCreateModal}
      >
        <UserPlus size={17} />
        Add user
      </button>
    </div>
  </div>

  {#if errorMessage}
    <div class="message-banner error-banner">
      <AlertCircle size={18} />
      <span>{errorMessage}</span>
      <button class="message-close" onclick={() => (errorMessage = "")}>
        <X size={17} />
      </button>
    </div>
  {/if}

  {#if successMessage}
    <div class="message-banner success-banner">
      <CheckCircle2 size={18} />
      <span>{successMessage}</span>
      <button class="message-close" onclick={() => (successMessage = "")}>
        <X size={17} />
      </button>
    </div>
  {/if}

  {#if !isAdmin}
    <section class="access-denied">
      <ShieldCheck size={30} />
      <h2>Administrator access required</h2>
      <p>
        You do not have permission to manage platform users.
        Please contact an administrator.
      </p>
    </section>
  {:else}
    <section class="stats-grid">
      <article class="stat-card">
        <div class="stat-icon users-icon">
          <Users size={21} />
        </div>
        <div class="stat-value">{totalUsers.toLocaleString()}</div>
        <div class="stat-label">Total accounts</div>
        <div class="stat-note">Administrators and staff</div>
      </article>

      <article class="stat-card">
        <div class="stat-icon active-icon">
          <UserCheck size={21} />
        </div>
        <div class="stat-value">{activeCount}</div>
        <div class="stat-label">Active accounts</div>
        <div class="stat-note">On this page</div>
      </article>

      <article class="stat-card">
        <div class="stat-icon inactive-icon">
          <UserX size={21} />
        </div>
        <div class="stat-value">{inactiveCount}</div>
        <div class="stat-label">Inactive accounts</div>
        <div class="stat-note">On this page</div>
      </article>

      <article class="stat-card">
        <div class="stat-icon admin-icon">
          <ShieldCheck size={21} />
        </div>
        <div class="stat-value">{adminCount}</div>
        <div class="stat-label">Administrators</div>
        <div class="stat-note">On this page</div>
      </article>
    </section>

    <section class="users-panel">
      <div class="panel-header">
        <div>
          <h2>Platform accounts</h2>
          <p>View, search and manage administrator and staff accounts.</p>
        </div>
      </div>

      <div class="filters">
        <div class="search-box">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search name, email or phone..."
            bind:value={searchQuery}
            onkeydown={(event) => {
              if (event.key === "Enter") applyFilters();
            }}
          />
        </div>

        <select bind:value={roleFilter} onchange={applyFilters}>
          <option value="">All roles</option>
          <option value="admin">Administrator</option>
          <option value="staff">Staff</option>
        </select>

        <select bind:value={statusFilter} onchange={applyFilters}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button class="filter-button" onclick={applyFilters}>
          Apply filters
        </button>
      </div>

      {#if loading}
        <div class="loading-state">
          <RefreshCw size={24} class="spinning" />
          <p>Loading user accounts...</p>
        </div>
      {:else if users.length > 0}
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last login</th>
                <th>Created</th>
                <th class="actions-heading">Actions</th>
              </tr>
            </thead>

            <tbody>
              {#each users as user (user.id)}
                <tr>
                  <td>
                    <div class="user-cell">
                      <div class="avatar">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div class="user-details">
                        <strong>{user.name}</strong>
                        <span>
                          <Mail size={12} />
                          {user.email || "No email"}
                        </span>

                        {#if user.phone}
                          <span>
                            <Phone size={12} />
                            {user.phone}
                          </span>
                        {/if}

                        {#if user.id === currentUser?.id}
                          <small class="you-label">Your account</small>
                        {/if}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span class={`role-badge ${user.role}`}>
                      {#if user.role === "admin"}
                        <ShieldCheck size={13} />
                        Administrator
                      {:else}
                        <Users size={13} />
                        Staff
                      {/if}
                    </span>
                  </td>

                  <td>
                    <span class={`status-badge ${user.isActive ? "status-active" : "status-inactive"}`}>
                      <span class="status-dot"></span>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <span class="date-cell">
                      <Clock3 size={13} />
                      {formatDate(user.lastLoginAt)}
                    </span>
                  </td>

                  <td>{formatDate(user.createdAt)}</td>

                  <td>
                    <div class="action-buttons">
                      <button
                        class="icon-button edit-action"
                        title="Edit user"
                        aria-label="Edit user"
                        onclick={() => openEditModal(user)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        class="icon-button password-action"
                        title="Reset password"
                        aria-label="Reset password"
                        onclick={() => openPasswordModal(user)}
                      >
                        <KeyRound size={16} />
                      </button>

                      <button
                        class={`icon-button ${user.isActive ? "deactivate-action" : "activate-action"}`}
                        title={user.isActive ? "Deactivate account" : "Reactivate account"}
                        aria-label={user.isActive ? "Deactivate account" : "Reactivate account"}
                        onclick={() => toggleUserStatus(user)}
                        disabled={
                          actionLoading === user.id ||
                          user.id === currentUser?.id
                        }
                      >
                        {#if actionLoading === user.id}
                          <RefreshCw size={16} class="spinning" />
                        {:else if user.isActive}
                          <UserX size={16} />
                        {:else}
                          <UserCheck size={16} />
                        {/if}
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span>
            Showing {users.length} of {totalUsers} accounts
          </span>

          <div class="pagination-controls">
            <button
              onclick={() => changePage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            <span>Page {page} of {totalPages}</span>

            <button
              onclick={() => changePage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      {:else}
        <div class="empty-state">
          <Users size={34} />
          <h3>No users found</h3>
          <p>
            {searchQuery || roleFilter || statusFilter
              ? "Try adjusting your search or filters."
              : "Create your first administrator or staff account."}
          </p>

          {#if !searchQuery && !roleFilter && !statusFilter}
            <button class="primary-button" onclick={openCreateModal}>
              <UserPlus size={16} />
              Add first user
            </button>
          {/if}
        </div>
      {/if}
    </section>

    <div class="page-footnote">
      <ShieldCheck size={15} />
      Only administrators can manage platform accounts.
    </div>
  {/if}
</div>

{#if showUserModal}
  <div class="modal-backdrop" role="presentation" onclick={(event) => {
    if (event.target === event.currentTarget) closeUserModal();
  }}>
    <section
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div class="modal-header">
        <div>
          <h2 id="user-modal-title">
            {editingUser ? "Edit user account" : "Create user account"}
          </h2>
          <p>
            {editingUser
              ? "Update account information and permissions."
              : "Add a new administrator or staff member."}
          </p>
        </div>

        <button class="modal-close" onclick={closeUserModal} disabled={saving}>
          <X size={20} />
        </button>
      </div>

      <form onsubmit={saveUser}>
        <div class="form-group">
          <label for="user-name">Full name</label>
          <input
            id="user-name"
            type="text"
            bind:value={userForm.name}
            placeholder="Enter full name"
            required
            maxlength="150"
          />
        </div>

        <div class="form-group">
          <label for="user-email">Email address</label>
          <input
            id="user-email"
            type="email"
            bind:value={userForm.email}
            placeholder="name@example.com"
            required
            maxlength="255"
          />
        </div>

        <div class="form-group">
          <label for="user-phone">Phone number</label>
          <input
            id="user-phone"
            type="tel"
            bind:value={userForm.phone}
            placeholder="Optional phone number"
            maxlength="30"
          />
        </div>

        <div class="form-group">
          <label for="user-role">Account role</label>
          <select id="user-role" bind:value={userForm.role} required>
            <option value="staff">Staff</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        {#if !editingUser}
          <div class="form-group">
            <label for="user-password">Initial password</label>
            <input
              id="user-password"
              type="password"
              bind:value={userForm.password}
              placeholder="At least 12 characters"
              minlength="12"
              required
              autocomplete="new-password"
            />
            <small>Password must contain at least 12 characters.</small>
          </div>
        {/if}

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            onclick={closeUserModal}
            disabled={saving}
          >
            Cancel
          </button>

          <button type="submit" class="primary-button" disabled={saving}>
            {#if saving}
              <RefreshCw size={16} class="spinning" />
              Saving...
            {:else}
              <CheckCircle2 size={16} />
              {editingUser ? "Save changes" : "Create account"}
            {/if}
          </button>
        </div>
      </form>
    </section>
  </div>
{/if}

{#if showPasswordModal}
  <div class="modal-backdrop" role="presentation" onclick={(event) => {
    if (event.target === event.currentTarget && !saving) {
      showPasswordModal = false;
    }
  }}>
    <section
      class="modal password-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
    >
      <div class="modal-header">
        <div>
          <h2 id="password-modal-title">Reset password</h2>
          <p>
            Set a new password for {passwordUser?.name}.
          </p>
        </div>

        <button
          class="modal-close"
          onclick={() => (showPasswordModal = false)}
          disabled={saving}
        >
          <X size={20} />
        </button>
      </div>

      <form onsubmit={resetPassword}>
        <div class="form-group">
          <label for="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            bind:value={newPassword}
            placeholder="Enter new password"
            minlength="12"
            required
            autocomplete="new-password"
          />
          <small>Minimum 12 characters.</small>
        </div>

        <div class="password-warning">
          <ShieldCheck size={17} />
          Resetting the password will sign the user out of existing sessions.
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="secondary-button"
            onclick={() => (showPasswordModal = false)}
            disabled={saving}
          >
            Cancel
          </button>

          <button type="submit" class="primary-button" disabled={saving}>
            {#if saving}
              <RefreshCw size={16} class="spinning" />
              Updating...
            {:else}
              <KeyRound size={16} />
              Reset password
            {/if}
          </button>
        </div>
      </form>
    </section>
  </div>
{/if}

<style>
  .users-page {
    max-width: 1250px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 27px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 10px;
    color: #65836a;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  h1 {
    margin: 0;
    color: #26382c;
    font-size: clamp(27px, 4vw, 34px);
    letter-spacing: -1px;
  }

  .page-header p {
    margin: 8px 0 0;
    color: #7b887e;
    font-size: 13px;
    line-height: 1.6;
  }

  .header-actions {
    display: flex;
    gap: 9px;
    flex-shrink: 0;
  }

  button {
    font-family: inherit;
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .refresh-button,
  .primary-button,
  .secondary-button,
  .filter-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 15px;
    border-radius: 9px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    transition: background 0.2s, opacity 0.2s;
  }

  .refresh-button {
    color: #466c4b;
    background: #edf4eb;
    border: 1px solid #dfeadd;
  }

  .refresh-button:hover {
    background: #e3eee1;
  }

  .primary-button {
    color: #fff;
    background: #477a4d;
    border: 1px solid #477a4d;
  }

  .primary-button:hover {
    background: #37683e;
  }

  .secondary-button {
    color: #5e6d60;
    background: #fff;
    border: 1px solid #dfe6de;
  }

  .secondary-button:hover {
    background: #f5f8f4;
  }

  .message-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 15px;
    margin-bottom: 15px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.5;
  }

  .message-banner span {
    flex: 1;
  }

  .success-banner {
    color: #326d3e;
    background: #edf7ed;
    border: 1px solid #d6ead6;
  }

  .error-banner {
    color: #9b4141;
    background: #fff0ef;
    border: 1px solid #f2d8d5;
  }

  .message-close {
    display: grid;
    place-items: center;
    padding: 3px;
    color: inherit;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 15px;
    margin-bottom: 23px;
  }

  .stat-card {
    padding: 18px;
    background: #fff;
    border: 1px solid #e7ece5;
    border-radius: 12px;
  }

  .stat-icon {
    display: grid;
    place-items: center;
    width: 39px;
    height: 39px;
    margin-bottom: 13px;
    border-radius: 10px;
  }

  .users-icon {
    color: #47744d;
    background: #eaf3e9;
  }

  .active-icon {
    color: #39804b;
    background: #eaf5eb;
  }

  .inactive-icon {
    color: #a64c4c;
    background: #faeceb;
  }

  .admin-icon {
    color: #7562a4;
    background: #f0edfa;
  }

  .stat-value {
    color: #2a3d30;
    font-size: 27px;
    font-weight: 750;
    letter-spacing: -0.8px;
  }

  .stat-label {
    margin-top: 3px;
    color: #4c5d50;
    font-size: 12px;
    font-weight: 700;
  }

  .stat-note {
    margin-top: 6px;
    color: #929c93;
    font-size: 10px;
  }

  .users-panel {
    margin-bottom: 23px;
    background: #fff;
    border: 1px solid #e6ece5;
    border-radius: 13px;
    overflow: hidden;
  }

  .panel-header {
    padding: 20px 21px 15px;
  }

  .panel-header h2 {
    margin: 0;
    color: #2d4032;
    font-size: 16px;
  }

  .panel-header p {
    margin: 5px 0 0;
    color: #849087;
    font-size: 12px;
  }

  .filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 0 21px 17px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 220px;
    padding: 10px 11px;
    color: #879388;
    background: #f8faf7;
    border: 1px solid #e6ece5;
    border-radius: 8px;
  }

  .search-box input {
    width: 100%;
    min-width: 0;
    color: #394b3d;
    background: transparent;
    border: 0;
    outline: none;
    font-size: 11px;
  }

  .filters select,
  .form-group select,
  .form-group input {
    min-height: 39px;
    padding: 9px 11px;
    color: #394b3d;
    background: #fff;
    border: 1px solid #dfe6de;
    border-radius: 8px;
    outline: none;
    font-family: inherit;
    font-size: 11px;
  }

  .filters select {
    min-width: 125px;
  }

  .filters select:focus,
  .form-group select:focus,
  .form-group input:focus {
    border-color: #77a27b;
    box-shadow: 0 0 0 3px #eaf3e9;
  }

  .filter-button {
    padding: 10px 13px;
    color: #47744d;
    background: #edf4eb;
    border: 1px solid #dfeadd;
  }

  .filter-button:hover {
    background: #e3eee1;
  }

  .table-scroll {
    width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    white-space: nowrap;
  }

  th {
    padding: 12px 16px;
    color: #89958b;
    background: #fafbf9;
    font-size: 10px;
    font-weight: 700;
  }

  td {
    padding: 13px 16px;
    color: #667469;
    border-top: 1px solid #eef1ed;
    font-size: 11px;
  }

  .actions-heading {
    text-align: right;
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 220px;
  }

  .avatar {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    color: #47744d;
    background: #eaf3e9;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 800;
  }

  .user-details {
    display: grid;
    gap: 4px;
  }

  .user-details strong {
    color: #3c4e40;
    font-size: 11px;
  }

  .user-details span {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #89958b;
    font-size: 10px;
  }

  .you-label {
    width: fit-content;
    padding: 3px 6px;
    color: #47744d;
    background: #edf4eb;
    border-radius: 5px;
    font-size: 9px;
  }

  .role-badge,
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
  }

  .role-badge.admin {
    color: #69569a;
    background: #f0edfa;
  }

  .role-badge.staff {
    color: #47744d;
    background: #eaf3e9;
  }

  .status-active {
    color: #367346;
    background: #eaf5eb;
  }

  .status-inactive {
    color: #a34b4b;
    background: #faeceb;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
  }

  .date-cell {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 5px;
  }

  .icon-button {
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    padding: 0;
    background: #fff;
    border: 1px solid #e8ede7;
    border-radius: 7px;
    cursor: pointer;
  }

  .edit-action {
    color: #47744d;
  }

  .edit-action:hover {
    background: #edf4eb;
  }

  .password-action {
    color: #7562a4;
  }

  .password-action:hover {
    background: #f0edfa;
  }

  .deactivate-action {
    color: #ad5555;
  }

  .deactivate-action:hover {
    background: #faeceb;
  }

  .activate-action {
    color: #39804b;
  }

  .activate-action:hover {
    background: #eaf5eb;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-top: 1px solid #edf0ec;
    color: #879388;
    font-size: 10px;
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pagination-controls button {
    display: grid;
    place-items: center;
    width: 29px;
    height: 29px;
    color: #527456;
    background: #edf4eb;
    border: 0;
    border-radius: 7px;
    cursor: pointer;
  }

  .loading-state,
  .empty-state,
  .access-denied {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 25px;
    color: #8a978b;
    text-align: center;
  }

  .empty-state h3,
  .access-denied h2 {
    margin: 12px 0 5px;
    color: #4a5b4c;
    font-size: 14px;
  }

  .empty-state p,
  .access-denied p,
  .loading-state p {
    max-width: 380px;
    margin: 5px 0 15px;
    color: #89958b;
    font-size: 11px;
    line-height: 1.6;
  }

  .page-footnote {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 3px 0 15px;
    color: #89958b;
    font-size: 10px;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    overflow-y: auto;
    background: rgba(24, 37, 27, 0.48);
    backdrop-filter: blur(3px);
  }

  .modal {
    width: min(100%, 490px);
    max-height: calc(100vh - 36px);
    overflow-y: auto;
    padding: 23px;
    background: #fff;
    border: 1px solid #e6ece5;
    border-radius: 15px;
    box-shadow: 0 20px 60px rgba(25, 45, 29, 0.2);
  }

  .password-modal {
    width: min(100%, 440px);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 22px;
  }

  .modal-header h2 {
    margin: 0;
    color: #2d4032;
    font-size: 18px;
  }

  .modal-header p {
    margin: 6px 0 0;
    color: #849087;
    font-size: 11px;
    line-height: 1.5;
  }

  .modal-close {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    color: #778579;
    background: #f5f8f4;
    border: 0;
    border-radius: 8px;
    cursor: pointer;
  }

  .form-group {
    display: grid;
    gap: 7px;
    margin-bottom: 15px;
  }

  .form-group label {
    color: #526253;
    font-size: 11px;
    font-weight: 700;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    box-sizing: border-box;
    min-height: 42px;
    font-size: 12px;
  }

  .form-group small {
    color: #929c93;
    font-size: 10px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    margin-top: 23px;
    padding-top: 17px;
    border-top: 1px solid #edf0ec;
  }

  .password-warning {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 12px;
    color: #55745a;
    background: #edf5ec;
    border: 1px solid #dcebd9;
    border-radius: 9px;
    font-size: 10px;
    line-height: 1.5;
  }

  .password-warning svg {
    flex-shrink: 0;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 950px) {
    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 650px) {
    .page-header {
      flex-direction: column;
    }

    .header-actions {
      width: 100%;
    }

    .header-actions button {
      flex: 1;
    }

    .filters {
      align-items: stretch;
    }

    .search-box {
      flex-basis: 100%;
    }

    .filters select {
      flex: 1;
    }

    .filter-button {
      flex: 1;
    }

    .stats-grid {
      gap: 10px;
    }

    .stat-card {
      padding: 14px;
    }

    .stat-value {
      font-size: 23px;
    }

    .pagination {
      align-items: flex-start;
      flex-direction: column;
    }
  }

  @media (max-width: 400px) {
    .modal {
      padding: 17px;
    }

    .modal-actions {
      flex-direction: column-reverse;
    }

    .modal-actions button {
      width: 100%;
    }
  }
</style>

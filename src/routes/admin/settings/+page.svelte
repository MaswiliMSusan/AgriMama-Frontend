
<script>
  import {
    Database,
    Users,
    ChevronRight,
    Settings,
    ShieldCheck
  } from "lucide-svelte";

  import { getAuthState } from "#lib/stores/auth.svelte.js";

  const auth = getAuthState();
  const currentUser = $derived(auth.user);
  const isAdmin = $derived(currentUser?.role === "admin");
</script>

<svelte:head>
  <title>Settings | AgriMama</title>
  <meta
    name="description"
    content="Manage AgriMama platform settings and administration."
  />
</svelte:head>

<div class="settings-page">
  <div class="page-header">
    <div class="eyebrow">
      <Settings size={15} />
      PLATFORM CONFIGURATION
    </div>

    <h1>Settings</h1>

    <p>
      Manage knowledge datasets, platform users and administrative
      configurations.
    </p>
  </div>

  <section class="settings-section">
    <div class="section-heading">
      <div>
        <h2>Platform management</h2>
        <p>Configure and manage your AgriMama platform.</p>
      </div>
    </div>

    <div class="settings-grid">

      <!-- Dataset management -->
      <a href="/admin/settings/datasets" class="settings-card">
        <div class="card-top">
          <div class="card-icon green">
            <Database size={24} />
          </div>

          <span class="card-arrow">
            <ChevronRight size={20} />
          </span>
        </div>

        <div>
          <h3>Datasets Management</h3>

          <p>
            Upload and manage agricultural knowledge datasets,
            monitor ingestion status and view upload history.
          </p>
        </div>

        <div class="card-footer">
          <span>Knowledge and AI data</span>
          <span class="card-link">Manage datasets</span>
        </div>
      </a>

      <!-- User management -->
      <a href="/admin/settings/users" class="settings-card">
        <div class="card-top">
          <div class="card-icon purple">
            <Users size={24} />
          </div>

          <span class="card-arrow">
            <ChevronRight size={20} />
          </span>
        </div>

        <div>
          <h3>User Management</h3>

          <p>
            Manage administrator and staff accounts, user roles
            and platform access permissions.
          </p>
        </div>

        <div class="card-footer">
          <span>Accounts and permissions</span>
          <span class="card-link">Manage users</span>
        </div>
      </a>

    </div>
  </section>

  <section class="access-card">
    <div class="access-icon">
      <ShieldCheck size={22} />
    </div>

    <div>
      <h3>Access and permissions</h3>

      <p>
        {#if isAdmin}
          You are signed in as an administrator. You can manage
          platform users, upload datasets and view ingestion history.
        {:else}
          You are signed in as a staff member. You can view datasets
          and ingestion history. Dataset uploads and user management
          are restricted to administrators.
        {/if}
      </p>
    </div>
  </section>
</div>

<style>
  .settings-page {
    max-width: 1180px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 34px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #65836a;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.1px;
    margin-bottom: 10px;
  }

  h1 {
    margin: 0;
    color: #26382c;
    font-size: clamp(28px, 4vw, 34px);
    letter-spacing: -1px;
  }

  .page-header > p {
    margin: 9px 0 0;
    color: #778579;
    font-size: 14px;
    line-height: 1.6;
  }

  .settings-section {
    margin-bottom: 28px;
  }

  .section-heading {
    margin-bottom: 17px;
  }

  .section-heading h2 {
    margin: 0;
    font-size: 17px;
    color: #2d4032;
  }

  .section-heading p {
    margin: 6px 0 0;
    color: #849087;
    font-size: 13px;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .settings-card {
    display: flex;
    flex-direction: column;
    min-height: 225px;
    padding: 23px;
    background: #fff;
    border: 1px solid #e6ece5;
    border-radius: 14px;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }

  .settings-card:hover {
    border-color: #a8c6a8;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(38, 70, 42, 0.06);
  }

  .settings-card:focus-visible {
    outline: 3px solid #a8c6a8;
    outline-offset: 3px;
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 21px;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: grid;
    place-items: center;
  }

  .card-icon.green {
    color: #397747;
    background: #eaf4e9;
  }

  .card-icon.purple {
    color: #7560a5;
    background: #f0ecf8;
  }

  .card-arrow {
    color: #9aa69a;
  }

  .settings-card h3 {
    margin: 0 0 8px;
    color: #2c4031;
    font-size: 17px;
  }

  .settings-card p {
    max-width: 430px;
    margin: 0;
    color: #7b887e;
    font-size: 13px;
    line-height: 1.65;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
    padding-top: 22px;
    color: #879288;
    font-size: 11px;
  }

  .card-link {
    color: #397747;
    font-weight: 700;
  }

  .access-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 19px;
    border: 1px solid #e5ece3;
    border-radius: 12px;
    background: #f0f5ef;
  }

  .access-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    color: #47784e;
    background: #fff;
    border-radius: 10px;
  }

  .access-card h3 {
    margin: 1px 0 5px;
    color: #36533a;
    font-size: 13px;
  }

  .access-card p {
    margin: 0;
    color: #6c7f6e;
    font-size: 12px;
    line-height: 1.6;
  }

  @media (max-width: 700px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .settings-card {
      min-height: 210px;
    }
  }
</style>

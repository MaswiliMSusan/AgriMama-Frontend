
<script>
  import { onMount } from "svelte";

  import {
    Database,
    UploadCloud,
    FileText,
    FileSpreadsheet,
    RefreshCw,
    CheckCircle2,
    Clock3,
    XCircle,
    AlertTriangle,
    History,
    ShieldCheck,
    Search,
    X,
    FolderOpen
  } from "lucide-svelte";

  import { getAuthState } from "#lib/stores/auth.svelte.js";

  const API_BASE = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"
  ).replace(/\/$/, "");

  const auth = getAuthState();
  const currentUser = $derived(auth.user);
  const isAdmin = $derived(currentUser?.role === "admin");

  let datasets = $state([]);
  let history = $state([]);

  let loading = $state(true);
  let uploading = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");
  let duplicateMessage = $state("");

  let selectedFile = $state(null);
  let fileInput;

  let activeTab = $state("datasets");
  let searchQuery = $state("");

  const completedCount = $derived(
    datasets.filter((item) => item.status === "completed").length
  );

  const pendingCount = $derived(
    datasets.filter((item) => item.status === "pending").length
  );

  const failedCount = $derived(
    datasets.filter((item) => item.status === "failed").length
  );

  const filteredDatasets = $derived(
    datasets.filter((item) =>
      String(item.filename || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim())
    )
  );

  const filteredHistory = $derived(
    history.filter((item) =>
      String(item.filename || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim())
    )
  );

  function formatDate(value) {
    if (!value) return "—";

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

  function formatSize(bytes) {
    const size = Number(bytes || 0);

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  function getUploaderName(item) {
    return (
      item.uploader?.name ||
      item.uploader?.email ||
      "Unknown user"
    );
  }

  function statusClass(status) {
    if (status === "completed") return "status-completed";
    if (status === "pending") return "status-pending";
    if (status === "failed") return "status-failed";

    return "status-unknown";
  }

  function statusLabel(status) {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function fileIcon(filename) {
    return String(filename || "").toLowerCase().endsWith(".csv")
      ? FileSpreadsheet
      : FileText;
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || `Request failed (${response.status})`
      );
    }

    return result;
  }

  async function loadDatasets() {
    loading = true;
    errorMessage = "";

    try {
      const [datasetResult, historyResult] = await Promise.all([
        fetchJson(`${API_BASE}/admin/datasets`),
        fetchJson(`${API_BASE}/admin/datasets/history`)
      ]);

      datasets = datasetResult.datasets || [];
      history = historyResult.history || [];
    } catch (error) {
      console.error("Failed to load datasets:", error);
      errorMessage =
        error.message || "Unable to load dataset information.";
    } finally {
      loading = false;
    }
  }

  function handleFileSelection(event) {
    selectedFile = event.currentTarget.files?.[0] || null;
    successMessage = "";
    errorMessage = "";
    duplicateMessage = "";
  }

  function clearSelectedFile() {
    selectedFile = null;

    if (fileInput) {
      fileInput.value = "";
    }
  }

  async function uploadDataset() {
    if (!isAdmin) {
      errorMessage = "Only administrators can upload datasets.";
      return;
    }

    if (!selectedFile) {
      errorMessage = "Please select a dataset file.";
      return;
    }

    const allowedExtensions = [".csv", ".txt", ".md"];
    const extension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      errorMessage = "Only CSV, TXT and Markdown files are supported.";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      errorMessage = "The file exceeds the 10 MB upload limit.";
      return;
    }

    uploading = true;
    errorMessage = "";
    successMessage = "";
    duplicateMessage = "";

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${API_BASE}/admin/datasets/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData
        }
      );

      const result = await response.json();

      if (response.status === 409 && result.duplicate) {
        duplicateMessage =
          result.message || "This dataset has already been ingested.";

        clearSelectedFile();
        await loadDatasets();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Upload failed (${response.status})`
        );
      }

      successMessage = result.message || "Dataset ingested successfully.";

      clearSelectedFile();

      await loadDatasets();
    } catch (error) {
      console.error("Dataset upload failed:", error);

      errorMessage =
        error.message || "Unable to upload the dataset. Please try again.";
    } finally {
      uploading = false;
    }
  }

  async function refreshData() {
    await loadDatasets();
  }

  onMount(() => {
    loadDatasets();
  });
</script>

<svelte:head>
  <title>Datasets Ingestion | AgriMama</title>
  <meta
    name="description"
    content="Manage agricultural knowledge datasets and AI ingestion history."
  />
</svelte:head>

<div class="datasets-page">
  <div class="page-header">
    <div>
      <div class="eyebrow">
        <Database size={15} />
        KNOWLEDGE MANAGEMENT
      </div>

      <h1>Datasets Ingestion</h1>

      <p>
        Manage the agricultural knowledge used by the AgriMama AI assistant.
      </p>
    </div>

    <button
      class="refresh-button"
      onclick={refreshData}
      disabled={loading || uploading}
    >
      <RefreshCw
        size={16}
        class={loading ? "spinning" : ""}
      />
      Refresh
    </button>
  </div>

  {#if errorMessage}
    <div class="message-banner error-banner" role="alert">
      <AlertTriangle size={19} />
      <span>{errorMessage}</span>
      <button
        class="message-close"
        aria-label="Dismiss error"
        onclick={() => (errorMessage = "")}
      >
        <X size={17} />
      </button>
    </div>
  {/if}

  {#if successMessage}
    <div class="message-banner success-banner" role="status">
      <CheckCircle2 size={19} />
      <span>{successMessage}</span>
      <button
        class="message-close"
        aria-label="Dismiss message"
        onclick={() => (successMessage = "")}
      >
        <X size={17} />
      </button>
    </div>
  {/if}

  {#if duplicateMessage}
    <div class="message-banner duplicate-banner" role="alert">
      <AlertTriangle size={19} />
      <div>
        <strong>Duplicate dataset detected</strong>
        <span>{duplicateMessage}</span>
      </div>
      <button
        class="message-close"
        aria-label="Dismiss duplicate message"
        onclick={() => (duplicateMessage = "")}
      >
        <X size={17} />
      </button>
    </div>
  {/if}

  <section class="stats-grid">
    <article class="stat-card">
      <div class="stat-icon database-icon">
        <Database size={21} />
      </div>
      <div class="stat-value">{datasets.length.toLocaleString()}</div>
      <div class="stat-label">Total datasets</div>
      <div class="stat-note">Latest record per filename</div>
    </article>

    <article class="stat-card">
      <div class="stat-icon completed-icon">
        <CheckCircle2 size={21} />
      </div>
      <div class="stat-value">{completedCount.toLocaleString()}</div>
      <div class="stat-label">Successfully ingested</div>
      <div class="stat-note">Completed datasets</div>
    </article>

    <article class="stat-card">
      <div class="stat-icon pending-icon">
        <Clock3 size={21} />
      </div>
      <div class="stat-value">{pendingCount.toLocaleString()}</div>
      <div class="stat-label">Pending</div>
      <div class="stat-note">Awaiting completion</div>
    </article>

    <article class="stat-card">
      <div class="stat-icon failed-icon">
        <XCircle size={21} />
      </div>
      <div class="stat-value">{failedCount.toLocaleString()}</div>
      <div class="stat-label">Failed</div>
      <div class="stat-note">Require attention or retry</div>
    </article>
  </section>

  {#if isAdmin}
    <section class="upload-panel">
      <div class="panel-heading">
        <div class="upload-heading-icon">
          <UploadCloud size={23} />
        </div>

        <div>
          <h2>Upload knowledge dataset</h2>
          <p>
            Add new agricultural knowledge to the AgriMama AI assistant.
          </p>
        </div>
      </div>

      <div class="upload-content">
        <div class="drop-zone">
          <div class="drop-icon">
            <FolderOpen size={29} />
          </div>

          <h3>Select a dataset file</h3>

          <p>
            Choose a CSV, TXT or Markdown file from your computer.
          </p>

          <input
            bind:this={fileInput}
            type="file"
            accept=".csv,.txt,.md,text/csv,text/plain,text/markdown"
            onchange={handleFileSelection}
            disabled={uploading}
            class="hidden-input"
          />

          <button
            class="browse-button"
            onclick={() => fileInput?.click()}
            disabled={uploading}
          >
            Browse files
          </button>

          <span class="file-limit">Maximum file size: 10 MB</span>
        </div>

        {#if selectedFile}
          <div class="selected-file">
            <div class="selected-file-icon">
              <FileText size={21} />
            </div>

            <div class="selected-file-info">
              <strong>{selectedFile.name}</strong>
              <span>{formatSize(selectedFile.size)}</span>
            </div>

            <button
              class="remove-file"
              aria-label="Remove selected file"
              onclick={clearSelectedFile}
              disabled={uploading}
            >
              <X size={18} />
            </button>
          </div>

          <button
            class="upload-button"
            onclick={uploadDataset}
            disabled={uploading}
          >
            {#if uploading}
              <RefreshCw size={17} class="spinning" />
              Uploading and ingesting...
            {:else}
              <UploadCloud size={18} />
              Upload and ingest dataset
            {/if}
          </button>
        {/if}
      </div>

      <div class="upload-footnote">
        <ShieldCheck size={16} />
        Duplicate content is automatically detected before ingestion.
      </div>
    </section>
  {:else}
    <section class="staff-notice">
      <ShieldCheck size={21} />
      <div>
        <strong>View-only access</strong>
        <p>
          You can view datasets and ingestion history. Only administrators
          can upload new datasets.
        </p>
      </div>
    </section>
  {/if}

  <section class="library-panel">
    <div class="library-header">
      <div>
        <h2>Dataset library</h2>
        <p>Review uploaded datasets and their ingestion status.</p>
      </div>

      <div class="search-box">
        <Search size={17} />
        <input
          type="search"
          placeholder="Search datasets..."
          bind:value={searchQuery}
        />
      </div>
    </div>

    <div class="tabs">
      <button
        class:tab-active={activeTab === "datasets"}
        onclick={() => (activeTab = "datasets")}
      >
        Datasets
        <span>{datasets.length}</span>
      </button>

      <button
        class:tab-active={activeTab === "history"}
        onclick={() => (activeTab = "history")}
      >
        <History size={15} />
        Ingestion history
        <span>{history.length}</span>
      </button>
    </div>

    {#if loading}
      <div class="loading-state">
        <RefreshCw size={23} class="spinning" />
        <p>Loading dataset information...</p>
      </div>
    {:else if activeTab === "datasets"}
      {#if filteredDatasets.length > 0}
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Status</th>
                <th>Uploaded by</th>
                <th>Last updated</th>
                <th>Size</th>
              </tr>
            </thead>

            <tbody>
              {#each filteredDatasets as item, index (item.filename)}
                <tr>
                  <td>
                    <div class="file-cell">
                      <div class="table-file-icon">
                        {#if item.filename?.toLowerCase().endsWith(".csv")}
                          <FileSpreadsheet size={19} />
                        {:else}
                          <FileText size={19} />
                        {/if}
                      </div>

                      <div class="file-details">
                        <strong>{item.filename}</strong>
                        <small>
                          {item.contentType || "Dataset file"}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span class={`status-badge ${statusClass(item.status)}`}>
                      {#if item.status === "completed"}
                        <CheckCircle2 size={13} />
                      {:else if item.status === "pending"}
                        <Clock3 size={13} />
                      {:else if item.status === "failed"}
                        <XCircle size={13} />
                      {/if}
                      {statusLabel(item.status)}
                    </span>
                  </td>

                  <td>{getUploaderName(item)}</td>

                  <td>
                    {formatDate(
                      item.checkedAt || item.ingestedAt || item.uploadedAt
                    )}
                  </td>

                  <td>{formatSize(item.fileSize)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="empty-state">
          <Database size={31} />
          <h3>No datasets found</h3>
          <p>
            {searchQuery
              ? "Try a different search term."
              : "Uploaded knowledge datasets will appear here."}
          </p>
        </div>
      {/if}
    {:else}
      {#if filteredHistory.length > 0}
        <div class="history-list">
          {#each filteredHistory as item, index (`${item.ingestionId || item.filename}-${index}`)}
            <article class="history-item">
              <div class="history-file-icon">
                <FileText size={20} />
              </div>

              <div class="history-details">
                <strong>{item.filename}</strong>

                <div class="history-meta">
                  <span>{getUploaderName(item)}</span>
                  <span>{formatDate(item.uploadedAt)}</span>
                </div>

                {#if item.ingestionId}
                  <small class="ingestion-id">
                    Ingestion ID: {item.ingestionId}
                  </small>
                {/if}

                {#if item.aiSandboxId}
                  <small class="ingestion-id">
                    AI Sandbox ID: {item.aiSandboxId}
                  </small>
                {/if}

                {#if item.error}
                  <small class="history-error">{item.error}</small>
                {/if}
              </div>

              <span class={`status-badge ${statusClass(item.status)}`}>
                {statusLabel(item.status)}
              </span>
            </article>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <History size={31} />
          <h3>No ingestion history found</h3>
          <p>Dataset upload attempts will appear here.</p>
        </div>
      {/if}
    {/if}
  </section>

  <div class="page-footnote">
    <ShieldCheck size={15} />
    Dataset ingestion is connected to the AgriMama AI Sandbox knowledge base.
  </div>
</div>

<style>
  .datasets-page {
    max-width: 1250px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
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

  .refresh-button,
  .browse-button,
  .upload-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    border: 0;
    border-radius: 9px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    transition: background 0.2s, opacity 0.2s;
  }

  .refresh-button {
    padding: 11px 15px;
    color: #466c4b;
    background: #edf4eb;
    border: 1px solid #dfeadd;
  }

  .refresh-button:hover {
    background: #e3eee1;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .message-banner {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 13px 15px;
    margin-bottom: 15px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.5;
  }

  .message-banner > span {
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

  .duplicate-banner {
    align-items: flex-start;
    color: #8b6527;
    background: #fff8e9;
    border: 1px solid #f0e0b9;
  }

  .duplicate-banner > div {
    display: grid;
    gap: 3px;
    flex: 1;
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

  .database-icon {
    color: #47744d;
    background: #eaf3e9;
  }

  .completed-icon {
    color: #39804b;
    background: #eaf5eb;
  }

  .pending-icon {
    color: #a17b36;
    background: #fbf3df;
  }

  .failed-icon {
    color: #a64c4c;
    background: #faeceb;
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

  .upload-panel,
  .library-panel {
    margin-bottom: 23px;
    background: #fff;
    border: 1px solid #e6ece5;
    border-radius: 13px;
    overflow: hidden;
  }

  .upload-panel {
    padding: 22px;
  }

  .panel-heading {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-bottom: 21px;
  }

  .upload-heading-icon {
    display: grid;
    place-items: center;
    width: 45px;
    height: 45px;
    flex-shrink: 0;
    color: #477a4d;
    background: #eaf3e9;
    border-radius: 11px;
  }

  .panel-heading h2,
  .library-header h2 {
    margin: 0;
    color: #2d4032;
    font-size: 16px;
  }

  .panel-heading p,
  .library-header p {
    margin: 5px 0 0;
    color: #849087;
    font-size: 12px;
  }

  .drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 15px;
    text-align: center;
    background: #fafcf9;
    border: 1px dashed #b8cbb6;
    border-radius: 11px;
  }

  .drop-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    color: #55835a;
    background: #eaf3e9;
    border-radius: 14px;
  }

  .drop-zone h3 {
    margin: 14px 0 5px;
    color: #344a38;
    font-size: 14px;
  }

  .drop-zone p {
    margin: 0 0 15px;
    color: #89948a;
    font-size: 11px;
  }

  .hidden-input {
    display: none;
  }

  .browse-button {
    padding: 10px 18px;
    color: #fff;
    background: #477a4d;
  }

  .browse-button:hover,
  .upload-button:hover {
    background: #37683e;
  }

  .file-limit {
    margin-top: 11px;
    color: #929c93;
    font-size: 10px;
  }

  .selected-file {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
    padding: 12px;
    background: #f6f9f5;
    border: 1px solid #e6ece5;
    border-radius: 9px;
  }

  .selected-file-icon,
  .table-file-icon,
  .history-file-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 39px;
    height: 39px;
    color: #557d59;
    background: #eaf2e8;
    border-radius: 9px;
  }

  .selected-file-info {
    display: grid;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }

  .selected-file-info strong {
    overflow-wrap: anywhere;
    color: #3c4d3e;
    font-size: 12px;
  }

  .selected-file-info span {
    color: #89948a;
    font-size: 10px;
  }

  .remove-file {
    display: grid;
    place-items: center;
    padding: 7px;
    color: #879187;
    background: transparent;
    border: 0;
    cursor: pointer;
  }

  .upload-button {
    width: 100%;
    margin-top: 12px;
    padding: 13px;
    color: #fff;
    background: #477a4d;
  }

  .upload-footnote {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    color: #7c8a7d;
    font-size: 11px;
  }

  .staff-notice {
    display: flex;
    gap: 13px;
    align-items: flex-start;
    padding: 17px;
    margin-bottom: 22px;
    color: #47734c;
    background: #eef5ed;
    border: 1px solid #dcebd9;
    border-radius: 11px;
  }

  .staff-notice strong {
    color: #365d3b;
    font-size: 13px;
  }

  .staff-notice p {
    margin: 5px 0 0;
    color: #708472;
    font-size: 11px;
    line-height: 1.5;
  }

  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    padding: 20px 21px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    width: min(100%, 250px);
    padding: 9px 11px;
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

  .tabs {
    display: flex;
    gap: 22px;
    padding: 0 21px;
    border-bottom: 1px solid #e9eee8;
  }

  .tabs button {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 12px 1px;
    color: #849087;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 11px;
    font-weight: 700;
  }

  .tabs button span {
    padding: 3px 7px;
    color: #738074;
    background: #f0f3ef;
    border-radius: 20px;
    font-size: 10px;
  }

  .tabs button.tab-active {
    color: #477a4d;
    border-bottom-color: #477a4d;
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
    padding: 12px 17px;
    color: #89958b;
    background: #fafbf9;
    font-size: 10px;
    font-weight: 700;
  }

  td {
    padding: 13px 17px;
    color: #667469;
    border-top: 1px solid #eef1ed;
    font-size: 11px;
  }

  .file-cell {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 220px;
  }

  .table-file-icon {
    width: 35px;
    height: 35px;
  }

  .file-details {
    display: grid;
    gap: 4px;
  }

  .file-details strong {
    max-width: 230px;
    overflow: hidden;
    color: #3c4e40;
    font-size: 11px;
    text-overflow: ellipsis;
  }

  .file-details small {
    color: #9aa39b;
    font-size: 10px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 8px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
  }

  .status-completed {
    color: #367346;
    background: #eaf5eb;
  }

  .status-pending {
    color: #99752f;
    background: #fbf3df;
  }

  .status-failed {
    color: #a34b4b;
    background: #faeceb;
  }

  .status-unknown {
    color: #707c72;
    background: #f0f2ef;
  }

  .history-list {
    padding: 5px 20px;
  }

  .history-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 15px 0;
    border-bottom: 1px solid #edf0ec;
  }

  .history-item:last-child {
    border-bottom: 0;
  }

  .history-file-icon {
    width: 38px;
    height: 38px;
  }

  .history-details {
    display: grid;
    gap: 6px;
    min-width: 0;
    flex: 1;
  }

  .history-details > strong {
    color: #3b4c3e;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .history-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    color: #8a958b;
    font-size: 10px;
  }

  .ingestion-id {
    color: #849087;
    font-size: 10px;
    overflow-wrap: anywhere;
  }

  .history-error {
    color: #a34b4b;
    font-size: 10px;
    overflow-wrap: anywhere;
  }

  .history-item > .status-badge {
    flex-shrink: 0;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 185px;
    padding: 25px;
    color: #8a978b;
    text-align: center;
  }

  .empty-state h3 {
    margin: 12px 0 5px;
    color: #4a5b4c;
    font-size: 13px;
  }

  .empty-state p,
  .loading-state p {
    margin: 5px 0 0;
    font-size: 11px;
  }

  .page-footnote {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 3px 0 15px;
    color: #89958b;
    font-size: 10px;
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

  @media (max-width: 600px) {
    .page-header {
      flex-direction: column;
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

    .upload-panel {
      padding: 15px;
    }

    .library-header {
      align-items: stretch;
    }

    .search-box {
      width: 100%;
    }

    .history-item {
      flex-wrap: wrap;
    }

    .history-item > .status-badge {
      margin-left: 50px;
    }
  }
</style>

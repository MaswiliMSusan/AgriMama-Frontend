
<script>
  import {
    Sprout, Home, MessageCircle, Leaf, CloudSun, ShoppingBasket,
    BookOpen, MapPinned, Menu, X, Bell, ArrowLeft, RefreshCw,
    AlertCircle, CheckCircle2, ChevronRight, Send, MessageSquare,
    Clock, User
  } from "lucide-svelte";

  import { getAuthState } from "#lib/stores/auth.svelte.js";
  import { api } from "#lib/services/api.js";

  const auth = getAuthState();

  let mobileMenuOpen = $state(false);
  let conversations = $state([]);
  let selectedConversation = $state(null);
  let replyMessage = $state("");

  let isLoading = $state(true);
  let isLoadingDetail = $state(false);
  let isSending = $state(false);

  let errorMessage = $state("");
  let detailError = $state("");
  let replyError = $state("");
  let successMessage = $state("");

  let loaded = false;

  const navigation = [
    { label: "Overview", href: "/farmer", icon: Home },
    { label: "AI Assistant", href: "/farmer/assistant", icon: MessageCircle },
    { label: "Farms", href: "/farmer/farms", icon: MapPinned },
    { label: "Crops & Crop Cycles", href: "/farmer/crop-cycles", icon: Sprout },
    { label: "Observations", href: "/farmer/observations", icon: BookOpen },
    { label: "Conversations", href: "/farmer/conversations", icon: MessageSquare },
    { label: "Crop Advice", href: "/farmer/crops", icon: Leaf },
    { label: "Weather", href: "/farmer/weather", icon: CloudSun },
    { label: "Market Prices", href: "/farmer/market", icon: ShoppingBasket },
  ];

  $effect(() => {
    if (auth.isInitialized && auth.user?.farmerId && !loaded) {
      loaded = true;
      loadConversations();
    } else if (auth.isInitialized && !auth.user?.farmerId) {
      isLoading = false;
      errorMessage = "Your account is not linked to a farmer profile. Please contact the AgriMama team.";
    }
  });

  async function loadConversations() {
    isLoading = true;
    errorMessage = "";

    try {
      const response = await api.get("/conversations/me");

      conversations = Array.isArray(response?.conversations)
        ? response.conversations
        : [];

      // Keep the currently selected conversation open after refreshing.
      if (selectedConversation?.id) {
        const updated = conversations.find(
          (item) => item.id === selectedConversation.id
        );

        if (updated) {
          await openConversation(updated.id);
        } else {
          selectedConversation = null;
        }
      }
    } catch (error) {
      errorMessage = error instanceof Error
        ? error.message
        : "Could not load your conversations.";
    } finally {
      isLoading = false;
    }
  }

  async function openConversation(id) {
    if (!id) return;

    isLoadingDetail = true;
    detailError = "";
    replyError = "";
    successMessage = "";
    replyMessage = "";

    try {
      const response = await api.get(
        `/conversations/${encodeURIComponent(id)}`
      );

      selectedConversation = response?.conversation || response;
    } catch (error) {
      detailError = error instanceof Error
        ? error.message
        : "Could not load this conversation.";
    } finally {
      isLoadingDetail = false;
    }
  }

  async function sendReply(event) {
    event.preventDefault();

    replyError = "";
    successMessage = "";

    const conversationId = selectedConversation?.id;
    const message = replyMessage.trim();

    if (!conversationId) {
      replyError = "Please select a conversation first.";
      return;
    }

    if (!message) {
      replyError = "Please enter a message before sending.";
      return;
    }

    if (selectedConversation.status !== "awaiting_reply") {
      replyError = "This conversation is no longer awaiting a reply.";
      return;
    }

    isSending = true;

    try {
      await api.post("/messages", {
        conversationId,
        message,
      });

      replyMessage = "";
      successMessage = "Your reply has been sent.";

      // Retrieve the saved messages and updated conversation status.
      await openConversation(conversationId);
      await refreshConversationList();
    } catch (error) {
      replyError = error instanceof Error
        ? error.message
        : "Could not send your reply. Please try again.";
    } finally {
      isSending = false;
    }
  }

  async function refreshConversationList() {
    try {
      const response = await api.get("/conversations/me");

      conversations = Array.isArray(response?.conversations)
        ? response.conversations
        : [];
    } catch (error) {
      console.error("Could not refresh conversation list:", error);
    }
  }

  async function handleRefresh() {
    await loadConversations();

    if (selectedConversation?.id) {
      await openConversation(selectedConversation.id);
    }
  }

  async function handleLogout() {
    try {
      await auth.logout();
    } finally {
      window.location.href = "/login";
    }
  }

  function formatDate(value) {
    if (!value) return "Date not available";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Date not available"
      : date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  }

  function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString(undefined, {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
  }

  function titleCase(value) {
    return String(value || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getLastMessage(conversation) {
    const messages = conversation.messages || [];

    if (!messages.length) {
      return conversation.question || "Conversation started";
    }

    return messages[messages.length - 1].message;
  }

  function getConversationTitle(conversation) {
    if (conversation.cropCycle?.crop) {
      return `${titleCase(conversation.cropCycle.crop)} conversation`;
    }

    return conversation.purpose
      ? titleCase(conversation.purpose)
      : "Farming conversation";
  }

  function isPending(conversation) {
    return conversation.status === "awaiting_reply";
  }
</script>

<svelte:head>
  <title>Conversations | AgriMama</title>
  <meta
    name="description"
    content="View your conversations with AgriMama and respond to follow-up questions."
  />
</svelte:head>

<div class="farmer-app">
  <aside class:open={mobileMenuOpen} class="sidebar">
    <div class="brand">
      <div class="brand-icon"><Sprout size={25} /></div>
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
          class:active={item.label === "Conversations"}
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

    <div class="sidebar-bottom">
      <div class="help-card">
        <MessageCircle size={20} />
        <strong>Need help?</strong>
        <p>We're here to support your farming journey.</p>
        <a href="/farmer/assistant">
          Get assistance <ChevronRight size={14} />
        </a>
      </div>

      <button class="profile" onclick={handleLogout}>
        <div class="avatar">
          {auth.user?.name?.charAt(0)?.toUpperCase() || "F"}
        </div>
        <div class="profile-info">
          <strong>{auth.user?.name || "Farmer"}</strong>
          <span>Farmer account</span>
        </div>
        <span class="logout-label">Logout</span>
      </button>
    </div>
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
        <a href="/farmer">Farmer Portal</a>
        <span>/</span>
        <strong>Conversations</strong>
      </div>

      <div class="topbar-actions">
        <button class="notification-button" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div class="topbar-user">
          <div class="avatar small">
            {auth.user?.name?.charAt(0)?.toUpperCase() || "F"}
          </div>
          <span>{auth.user?.name || "Farmer"}</span>
        </div>
      </div>
    </header>

    <div class="page-content">
      <div class="page-intro">
        <div>
          <a class="back-link" href="/farmer">
            <ArrowLeft size={15} /> Back to overview
          </a>
          <p class="eyebrow">AGRIMAMA SUPPORT</p>
          <h2>Conversations</h2>
          <p class="intro-copy">
            Follow up on your farming questions and continue conversations
            with AgriMama.
          </p>
        </div>

        <button
          class="secondary-button"
          onclick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw size={15} class={isLoading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <section class="summary-row">
        <div class="summary-card">
          <div class="summary-icon">
            <MessageSquare size={21} />
          </div>
          <div>
            <span>TOTAL CONVERSATIONS</span>
            <strong>{conversations.length}</strong>
            <small>Your conversation history</small>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon pending-icon">
            <Clock size={21} />
          </div>
          <div>
            <span>AWAITING YOUR REPLY</span>
            <strong>{conversations.filter(isPending).length}</strong>
            <small>Questions needing your response</small>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon completed-icon">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>COMPLETED</span>
            <strong>
              {conversations.filter((item) => item.status === "completed").length}
            </strong>
            <small>Conversations completed</small>
          </div>
        </div>
      </section>

      {#if errorMessage}
        <div class="notice error">
          <AlertCircle size={17} />
          <span>{errorMessage}</span>
        </div>
      {/if}

      <div class="conversation-layout">
        <section class="conversation-list-panel">
          <div class="section-heading">
            <div>
              <h3>Your conversations</h3>
              <p>Select a conversation to view its messages.</p>
            </div>
          </div>

          {#if isLoading}
            <div class="state-panel">
              <RefreshCw size={23} class="spin" />
              <strong>Loading conversations...</strong>
              <p>Please wait.</p>
            </div>
          {:else if errorMessage}
            <div class="state-panel">
              <AlertCircle size={24} />
              <strong>Unable to load conversations</strong>
              <button class="secondary-button" onclick={loadConversations}>
                Try again
              </button>
            </div>
          {:else if conversations.length === 0}
            <div class="state-panel">
              <MessageSquare size={27} />
              <strong>No conversations yet</strong>
              <p>
                When AgriMama needs more information about a farming question,
                your conversation will appear here.
              </p>
              <a class="text-link" href="/farmer/observations">
                Report an observation <ChevronRight size={14} />
              </a>
            </div>
          {:else}
            <div class="conversation-list">
              {#each conversations as conversation (conversation.id)}
                <button
                  class="conversation-item"
                  class:selected={selectedConversation?.id === conversation.id}
                  onclick={() => openConversation(conversation.id)}
                >
                  <div class="conversation-item-top">
                    <div class="conversation-icon">
                      <MessageCircle size={19} />
                    </div>
                    <span
                      class="status-pill"
                      class:pending={isPending(conversation)}
                    >
                      {isPending(conversation) ? "Awaiting reply" : titleCase(conversation.status)}
                    </span>
                  </div>

                  <h4>{getConversationTitle(conversation)}</h4>

                  <p class="conversation-preview">
                    {getLastMessage(conversation)}
                  </p>

                  <div class="conversation-meta">
                    <span>
                      {conversation.farm?.name || "Your farm"}
                    </span>
                    <span>
                      {formatDate(conversation.updatedAt || conversation.askedAt || conversation.createdAt)}
                    </span>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </section>

        <section class="conversation-detail-panel">
          {#if !selectedConversation}
            <div class="detail-empty">
              <div class="detail-empty-icon">
                <MessageSquare size={30} />
              </div>
              <h3>Your conversation details</h3>
              <p>
                Select a conversation from the list to view the full
                conversation and respond to AgriMama.
              </p>
            </div>
          {:else if isLoadingDetail}
            <div class="state-panel">
              <RefreshCw size={23} class="spin" />
              <strong>Loading conversation...</strong>
            </div>
          {:else if detailError}
            <div class="state-panel">
              <AlertCircle size={24} />
              <strong>Could not load conversation</strong>
              <p>{detailError}</p>
              <button
                class="secondary-button"
                onclick={() => openConversation(selectedConversation.id)}
              >
                Try again
              </button>
            </div>
          {:else}
            <div class="detail-header">
              <div>
                <p class="eyebrow">CONVERSATION DETAILS</p>
                <h3>{getConversationTitle(selectedConversation)}</h3>
                <p class="detail-subtitle">
                  {selectedConversation.farm?.name || "Your farm"}
                  {#if selectedConversation.cropCycle?.crop}
                    · {titleCase(selectedConversation.cropCycle.crop)}
                  {/if}
                </p>
              </div>

              <span
                class="status-pill"
                class:pending={isPending(selectedConversation)}
              >
                {isPending(selectedConversation)
                  ? "Awaiting reply"
                  : titleCase(selectedConversation.status)}
              </span>
            </div>

            <div class="message-timeline">
              {#if selectedConversation.messages?.length}
                {#each selectedConversation.messages as item, index (`${selectedConversation.id}-${index}`)}
                  <div
                    class="message-row"
                    class:farmer-message={item.sender === "farmer"}
                    class:assistant-message={item.sender === "assistant"}
                  >
                    <div class="message-avatar">
                      {#if item.sender === "farmer"}
                        <User size={17} />
                      {:else}
                        <Sprout size={18} />
                      {/if}
                    </div>

                    <div class="message-content">
                      <div class="message-author">
                        {item.sender === "farmer" ? "You" : "AgriMama"}
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>

                      <div class="message-bubble">
                        {item.message}
                      </div>

                      <span class="message-channel">
                        {titleCase(item.channel || "dashboard")}
                      </span>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="state-panel">
                  <MessageCircle size={24} />
                  <strong>No messages available</strong>
                  <p>
                    This conversation does not have any saved messages yet.
                  </p>
                </div>
              {/if}
            </div>

            {#if isPending(selectedConversation)}
              <form class="reply-form" onsubmit={sendReply}>
                <div class="reply-heading">
                  <MessageCircle size={18} />
                  <div>
                    <strong>Reply to AgriMama</strong>
                    <p>Provide the additional information requested.</p>
                  </div>
                </div>

                <textarea
                  bind:value={replyMessage}
                  rows="3"
                  maxlength="5000"
                  placeholder="Type your response here..."
                  disabled={isSending}
                ></textarea>

                {#if replyError}
                  <div class="notice error">
                    <AlertCircle size={16} />
                    {replyError}
                  </div>
                {/if}

                <div class="reply-actions">
                  <small>{replyMessage.length}/5000 characters</small>
                  <button
                    type="submit"
                    class="primary-button"
                    disabled={isSending || !replyMessage.trim()}
                  >
                    {#if isSending}
                      <RefreshCw size={16} class="spin" />
                      Sending...
                    {:else}
                      <Send size={16} />
                      Send reply
                    {/if}
                  </button>
                </div>
              </form>
            {:else}
              <div class="completed-notice">
                <CheckCircle2 size={19} />
                <div>
                  <strong>Conversation completed</strong>
                  <p>
                    This conversation has been completed. You can review
                    the messages and advice above.
                  </p>
                </div>
              </div>
            {/if}
          {/if}
        </section>
      </div>

      {#if successMessage}
        <div class="notice success">
          <CheckCircle2 size={17} />
          {successMessage}
        </div>
      {/if}

      <footer class="footer">
        <span>© {new Date().getFullYear()} AgriMama</span>
        <span>Growing stronger farms together.</span>
      </footer>
    </div>
  </main>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html),
  :global(body) {
    margin: 0;
    min-height: 100%;
  }

  :global(body) {
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #34483a;
    background: #f7f9f6;
    font-size: 14px;
  }

  .farmer-app {
    min-height: 100vh;
    background: #f7f9f6;
  }

  .main-content {
    min-height: 100vh;
    margin-left: 255px;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    width: 255px;
    padding: 25px 17px 16px;
    background: #fff;
    border-right: 1px solid #e9eee8;
    transition: transform 0.25s ease;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 8px 28px;
  }

  .brand-icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #e8f5e9;
    color: #28794b;
  }

  .brand h1 {
    margin: 0;
    color: #28583a;
    font-size: 19px;
    font-weight: 800;
  }

  .brand span {
    color: #96a198;
    font-size: 10px;
  }

  .close-menu {
    display: none;
    margin-left: auto;
    border: 0;
    background: transparent;
    color: #526357;
    cursor: pointer;
  }

  .nav-label {
    padding: 0 12px 11px;
    color: #a0aaa2;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.2px;
  }

  nav {
    display: grid;
    gap: 5px;
  }

  nav a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    color: #718075;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }

  nav a:hover,
  nav a.active {
    background: #eaf4eb;
    color: #28794b;
  }

  .new-tag {
    margin-left: auto;
    padding: 3px 6px;
    border-radius: 5px;
    background: #eee9ff;
    color: #7958bb;
    font-size: 8px;
    font-weight: 800;
  }

  .sidebar-bottom {
    margin-top: auto;
  }

  .help-card {
    padding: 15px;
    border: 1px solid #e9eee8;
    border-radius: 11px;
    background: #fbfcfa;
  }

  .help-card strong {
    display: block;
    margin-top: 8px;
    font-size: 11px;
  }

  .help-card p {
    color: #89958c;
    font-size: 10px;
    line-height: 1.6;
  }

  .help-card a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #28794b;
    font-size: 10px;
    font-weight: 700;
    text-decoration: none;
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 15px 5px 0;
    margin-top: 15px;
    border: 0;
    border-top: 1px solid #edf0ec;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .avatar {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: #e4f0e5;
    color: #28794b;
    font-size: 13px;
    font-weight: 800;
  }

  .profile-info {
    display: grid;
    min-width: 0;
  }

  .profile-info strong {
    overflow: hidden;
    color: #526357;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-info span {
    color: #9aa49c;
    font-size: 9px;
  }

  .logout-label {
    margin-left: auto;
    color: #89958c;
    font-size: 9px;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding: 0 38px;
    border-bottom: 1px solid #e9eee8;
    background: #fff;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #a0aaa2;
    font-size: 11px;
  }

  .breadcrumb a {
    color: #849187;
    text-decoration: none;
  }

  .breadcrumb strong {
    color: #425647;
  }

  .topbar-actions,
  .topbar-user {
    display: flex;
    align-items: center;
    gap: 17px;
  }

  .notification-button,
  .menu-button {
    border: 0;
    background: transparent;
    color: #718075;
    cursor: pointer;
  }

  .topbar-user {
    gap: 9px;
    color: #647368;
    font-size: 10px;
  }

  .avatar.small {
    width: 32px;
    height: 32px;
    font-size: 11px;
  }

  .menu-button {
    display: none;
  }

  .page-content {
    width: 100%;
    max-width: 1450px;
    padding: 34px 38px;
    margin: 0 auto;
  }

  .page-intro {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 25px;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 19px;
    color: #7b8c7e;
    font-size: 11px;
    text-decoration: none;
  }

  .eyebrow {
    margin: 0 0 7px;
    color: #7c9a80;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1.1px;
  }

  .page-intro h2 {
    margin: 0;
    color: #294332;
    font-size: 27px;
    font-weight: 800;
  }

  .intro-copy {
    margin: 7px 0 0;
    color: #87948a;
    font-size: 12px;
    line-height: 1.6;
  }

  .primary-button,
  .secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 15px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
    text-decoration: none;
  }

  .primary-button {
    background: #28794b;
    color: white;
  }

  .primary-button:hover {
    background: #21653e;
  }

  .secondary-button {
    border-color: #e1e9e0;
    background: white;
    color: #526b58;
  }

  .secondary-button:hover {
    border-color: #b8d5bc;
    color: #28794b;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .summary-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px;
    margin-bottom: 24px;
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 17px;
    border: 1px solid #e9eee8;
    border-radius: 11px;
    background: white;
  }

  .summary-icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 43px;
    height: 43px;
    border-radius: 10px;
    background: #eaf4eb;
    color: #28794b;
  }

  .pending-icon {
    background: #fff5e8;
    color: #c48a3c;
  }

  .completed-icon {
    background: #eaf5ed;
    color: #3b8a58;
  }

  .summary-card span {
    display: block;
    color: #89968c;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }

  .summary-card strong {
    display: block;
    margin-top: 4px;
    color: #294332;
    font-size: 22px;
  }

  .summary-card small {
    display: block;
    margin-top: 3px;
    color: #9aa49c;
    font-size: 9px;
  }

  .conversation-layout {
    display: grid;
    grid-template-columns: minmax(280px, 0.85fr) minmax(0, 1.5fr);
    align-items: stretch;
    gap: 17px;
  }

  .conversation-list-panel,
  .conversation-detail-panel {
    min-width: 0;
    border: 1px solid #e9eee8;
    border-radius: 12px;
    background: white;
  }

  .conversation-list-panel {
    overflow: hidden;
  }

  .section-heading {
    padding: 20px;
    border-bottom: 1px solid #edf0ec;
  }

  .section-heading h3,
  .detail-header h3 {
    margin: 0;
    color: #34483a;
    font-size: 15px;
    font-weight: 750;
  }

  .section-heading p,
  .detail-subtitle {
    margin: 6px 0 0;
    color: #909b92;
    font-size: 10px;
  }

  .conversation-list {
    display: grid;
  }

  .conversation-item {
    display: block;
    width: 100%;
    padding: 17px 19px;
    border: 0;
    border-bottom: 1px solid #edf0ec;
    background: white;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }

  .conversation-item:hover,
  .conversation-item.selected {
    background: #f5f9f4;
  }

  .conversation-item.selected {
    box-shadow: inset 3px 0 #28794b;
  }

  .conversation-item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .conversation-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: #eaf4eb;
    color: #28794b;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    padding: 5px 8px;
    border-radius: 20px;
    background: #eaf5ed;
    color: #368052;
    font-size: 9px;
    font-weight: 750;
    white-space: nowrap;
  }

  .status-pill.pending {
    background: #fff3e3;
    color: #b47a2f;
  }

  .conversation-item h4 {
    margin: 12px 0 6px;
    color: #34483a;
    font-size: 12px;
    font-weight: 750;
  }

  .conversation-preview {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: #849087;
    font-size: 10px;
    line-height: 1.6;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .conversation-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 12px;
    color: #a0aaa2;
    font-size: 9px;
  }

  .conversation-detail-panel {
    display: flex;
    flex-direction: column;
    min-height: 570px;
    overflow: hidden;
  }

  .detail-empty {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 35px;
    text-align: center;
  }

  .detail-empty-icon {
    display: grid;
    place-items: center;
    width: 65px;
    height: 65px;
    border-radius: 18px;
    background: #edf6ee;
    color: #398052;
  }

  .detail-empty h3 {
    margin: 17px 0 7px;
    color: #34483a;
    font-size: 15px;
  }

  .detail-empty p {
    max-width: 300px;
    color: #89958c;
    font-size: 11px;
    line-height: 1.7;
  }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 20px;
    border-bottom: 1px solid #edf0ec;
  }

  .detail-header .eyebrow {
    margin-bottom: 7px;
  }

  .message-timeline {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 21px;
    max-height: 490px;
    min-height: 180px;
    padding: 22px;
    overflow-y: auto;
    background: #fbfcfa;
  }

  .message-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    max-width: 90%;
  }

  .message-row.farmer-message {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .message-avatar {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e8f3e9;
    color: #28794b;
  }

  .farmer-message .message-avatar {
    background: #e9eef7;
    color: #607da6;
  }

  .message-content {
    min-width: 0;
  }

  .message-author {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 6px;
    color: #526357;
    font-size: 10px;
    font-weight: 750;
  }

  .farmer-message .message-author {
    justify-content: flex-end;
  }

  .message-author span {
    color: #a0aaa2;
    font-size: 9px;
    font-weight: 400;
  }

  .message-bubble {
    padding: 12px 14px;
    border: 1px solid #e7eee6;
    border-radius: 4px 12px 12px 12px;
    background: white;
    color: #536459;
    font-size: 11px;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .farmer-message .message-bubble {
    border-color: #dce9f7;
    border-radius: 12px 4px 12px 12px;
    background: #edf4fc;
  }

  .message-channel {
    display: block;
    margin-top: 5px;
    color: #a0aaa2;
    font-size: 8px;
  }

  .farmer-message .message-channel {
    text-align: right;
  }

  .reply-form {
    padding: 19px;
    border-top: 1px solid #edf0ec;
    background: white;
  }

  .reply-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 13px;
    color: #28794b;
  }

  .reply-heading strong {
    display: block;
    color: #34483a;
    font-size: 11px;
  }

  .reply-heading p {
    margin: 4px 0 0;
    color: #89958c;
    font-size: 9px;
  }

  .reply-form textarea {
    display: block;
    width: 100%;
    min-height: 85px;
    padding: 12px;
    resize: vertical;
    border: 1px solid #e2eae1;
    border-radius: 8px;
    outline: none;
    color: #34483a;
    font-family: inherit;
    font-size: 11px;
    line-height: 1.6;
  }

  .reply-form textarea:focus {
    border-color: #39875a;
    box-shadow: 0 0 0 3px rgba(40, 121, 75, 0.08);
  }

  .reply-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 12px;
  }

  .reply-actions small {
    color: #9aa49c;
    font-size: 9px;
  }

  .completed-notice {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 17px 20px;
    border-top: 1px solid #e7eee6;
    background: #f3f8f2;
    color: #398052;
  }

  .completed-notice strong {
    color: #356b46;
    font-size: 11px;
  }

  .completed-notice p {
    margin: 5px 0 0;
    color: #829087;
    font-size: 10px;
    line-height: 1.6;
  }

  .state-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 35px 20px;
    color: #7b8b7f;
    text-align: center;
  }

  .state-panel strong {
    color: #405547;
    font-size: 12px;
  }

  .state-panel p {
    max-width: 280px;
    margin: 0;
    color: #929d94;
    font-size: 10px;
    line-height: 1.6;
  }

  .text-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 8px;
    color: #28794b;
    font-size: 10px;
    font-weight: 750;
    text-decoration: none;
  }

  .notice {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 12px 14px;
    margin-bottom: 15px;
    border-radius: 8px;
    font-size: 11px;
  }

  .notice.error {
    border: 1px solid #f0d9d5;
    background: #fff6f4;
    color: #a74c40;
  }

  .notice.success {
    border: 1px solid #d7ead9;
    background: #f1f8f1;
    color: #34784a;
    margin-top: 17px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    padding: 25px 0 5px;
    margin-top: 25px;
    border-top: 1px solid #e9eee8;
    color: #a0aaa2;
    font-size: 9px;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .mobile-overlay {
    display: none;
  }

  @media (max-width: 1100px) {
    .page-content {
      padding: 28px 24px;
    }

    .topbar {
      padding: 0 24px;
    }

    .conversation-layout {
      grid-template-columns: minmax(250px, 0.8fr) minmax(0, 1.2fr);
    }

    .summary-card {
      padding: 13px;
    }
  }

  @media (max-width: 850px) {
    .sidebar {
      transform: translateX(-100%);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .close-menu {
      display: block;
    }

    .main-content {
      margin-left: 0;
    }

    .menu-button {
      display: block;
    }

    .mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: block;
      border: 0;
      background: rgba(20, 35, 25, 0.35);
    }

    .conversation-layout {
      grid-template-columns: 1fr;
    }

    .conversation-detail-panel {
      min-height: 450px;
    }
  }

  @media (max-width: 600px) {
    .topbar {
      height: 62px;
      padding: 0 16px;
    }

    .topbar-actions {
      gap: 10px;
    }

    .topbar-user span {
      display: none;
    }

    .page-content {
      padding: 22px 15px;
    }

    .page-intro {
      align-items: flex-start;
    }

    .page-intro h2 {
      font-size: 23px;
    }

    .intro-copy {
      max-width: 260px;
    }

    .summary-row {
      grid-template-columns: 1fr;
      gap: 9px;
    }

    .summary-card {
      padding: 12px;
    }

    .conversation-detail-panel {
      min-height: 400px;
    }

    .detail-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .message-timeline {
      padding: 15px;
    }

    .message-row {
      max-width: 100%;
    }

    .reply-form {
      padding: 15px;
    }

    .footer {
      flex-direction: column;
      gap: 7px;
    }
  }
</style>

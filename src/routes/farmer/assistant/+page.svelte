<script>
  import {
    Bot,
    Languages,
    MessageCircle,
    Plus,
    Send,
    Sparkles,
    Sprout,
    UserRound,
  } from "lucide-svelte";
  import { api } from "#lib/services/api.js";

  let messages = $state([]);
  let draft = $state("");
  let conversationId = $state(null);
  let sending = $state(false);
  let errorMessage = $state("");
  let expandedTranslations = $state({});
  let nextMessageId = 0;

  const suggestedQuestions = [
    "How can I improve the fertility of my soil?",
    "What can I do about pests on my maize?",
    "When is the best time to plant beans?",
    "How can I prepare organic manure?",
  ];

  const hasMessages = $derived(messages.length > 0);

  function toggleTranslation(messageId) {
    expandedTranslations[messageId] = !expandedTranslations[messageId];
  }

  function startNewConversation() {
    messages = [];
    conversationId = null;
    draft = "";
    errorMessage = "";
    expandedTranslations = {};
  }

  function useSuggestedQuestion(question) {
    draft = question;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const messageText = draft.trim();
    if (!messageText || sending) return;

    errorMessage = "";
    sending = true;
    draft = "";

    const farmerMessageId = ++nextMessageId;
    messages = [
      ...messages,
      {
        id: farmerMessageId,
        role: "farmer",
        text: messageText,
      },
    ];

    try {
      const data = await api.post("/assistant/chat", {
        message: messageText,
        conversationId,
        channel: "dashboard",
      });

      if (!data?.success || !data?.message?.assistant) {
        throw new Error(
          data?.error || "AgriMama could not prepare a response. Please try again."
        );
      }

      conversationId = data.conversationId ?? conversationId;

      messages = [
        ...messages,
        {
          id: ++nextMessageId,
          role: "assistant",
          text: data.message.assistant,
          translation: data.message.assistantTranslation || null,
          language:
            data.interpretation?.responseLanguage ||
            data.interpretation?.detectedLanguage ||
            "en",
          followUpQuestions: Array.isArray(
            data.interpretation?.followUpQuestions
          )
            ? data.interpretation.followUpQuestions
            : [],
        },
      ];
    } catch (error) {
      // Remove the optimistic message so the farmer can safely try again.
      messages = messages.filter((item) => item.id !== farmerMessageId);
      draft = messageText;
      errorMessage =
        error?.message ||
        "We could not send your question. Please check your connection and try again.";
    } finally {
      sending = false;
    }
  }
</script>

<svelte:head>
  <title>AI Assistant | AgriMama</title>
  <meta
    name="description"
    content="Ask AgriMama for practical farming guidance in your preferred language."
  />
</svelte:head>

<section class="assistant-page">
  <header class="page-heading">
    <div>
      <p class="eyebrow">YOUR FARMING COMPANION</p>
      <h1>AI Assistant</h1>
      <p class="intro">
        Ask a farming question and get practical guidance for your farm.
        You can write in English, Kiswahili or Dholuo.
      </p>
    </div>

    <button class="new-chat-button" type="button" onclick={startNewConversation}>
      <Plus size={17} />
      <span>New conversation</span>
    </button>
  </header>

  <div class="assistant-notice">
    <div class="notice-icon">
      <Sprout size={19} />
    </div>
    <p>
      <strong>Advice that starts with your question.</strong>
      Share what is happening on your farm. AgriMama may ask a follow-up
      question when it needs more information.
    </p>
  </div>

  <main class="chat-panel">
    {#if !hasMessages}
      <div class="welcome-state">
        <div class="welcome-icon">
          <Sparkles size={25} />
        </div>
        <h2>What would you like help with today?</h2>
        <p>
          Ask about crops, pests, soil health, planting, weather or other
          farming concerns.
        </p>

        <div class="suggestion-list">
          {#each suggestedQuestions as question}
            <button
              class="suggestion"
              type="button"
              onclick={() => useSuggestedQuestion(question)}
            >
              <MessageCircle size={15} />
              <span>{question}</span>
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <div class="message-list" aria-live="polite">
        {#each messages as message (message.id)}
          <article class:farmer-message={message.role === "farmer"} class="message-row">
            <div class="message-avatar" class:farmer-avatar={message.role === "farmer"}>
              {#if message.role === "farmer"}
                <UserRound size={17} />
              {:else}
                <Bot size={18} />
              {/if}
            </div>

            <div class="message-content">
              <div class="message-meta">
                <strong>{message.role === "farmer" ? "You" : "AgriMama"}</strong>
                {#if message.role === "assistant" && message.language !== "en"}
                  <span class="language-label">
                    {message.language === "sw"
                      ? "Kiswahili"
                      : message.language === "dholuo"
                        ? "Dholuo"
                        : message.language}
                  </span>
                {/if}
              </div>

              <div class="message-bubble">
                <p>{message.text}</p>
              </div>

              {#if message.role === "assistant" && message.translation}
                <div class="translation-area">
                  <button
                    class="translation-toggle"
                    type="button"
                    onclick={() => toggleTranslation(message.id)}
                    aria-expanded={!!expandedTranslations[message.id]}
                  >
                    <Languages size={15} />
                    {expandedTranslations[message.id]
                      ? "Hide English translation"
                      : "View English translation"}
                  </button>

                  {#if expandedTranslations[message.id]}
                    <div class="translation-box">
                      <span>English translation</span>
                      <p>{message.translation}</p>
                      {#if message.language === "dholuo"}
                        <small>
                          Dholuo responses are experimental and should be
                          checked by a fluent speaker.
                        </small>
                      {/if}
                    </div>
                  {/if}
                </div>
              {/if}

              {#if message.role === "assistant" && message.followUpQuestions?.length}
                <div class="follow-up-list">
                  {#each message.followUpQuestions as question}
                    <button
                      type="button"
                      class="follow-up"
                      onclick={() => useSuggestedQuestion(question)}
                    >
                      {question}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </article>
        {/each}

        {#if sending}
          <div class="message-row">
            <div class="message-avatar assistant-avatar">
              <Bot size={18} />
            </div>
            <div class="message-content">
              <div class="message-meta"><strong>AgriMama</strong></div>
              <div class="typing-bubble">
                <span></span><span></span><span></span>
                <em>Thinking about your question…</em>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    {#if errorMessage}
      <div class="error-message" role="alert">
        {errorMessage}
      </div>
    {/if}

    <form class="composer" onsubmit={handleSubmit}>
      <label class="sr-only" for="assistant-message">Your farming question</label>
      <textarea
        id="assistant-message"
        bind:value={draft}
        rows="2"
        placeholder="Type your farming question…"
        disabled={sending}
        onkeydown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
          }
        }}
      ></textarea>

      <div class="composer-footer">
        <span>Enter to send · Shift + Enter for a new line</span>
        <button
          class="send-button"
          type="submit"
          disabled={!draft.trim() || sending}
          aria-label="Send question"
        >
          <Send size={17} />
          <span>{sending ? "Sending…" : "Send"}</span>
        </button>
      </div>
    </form>
  </main>

  <p class="privacy-note">
    <Bot size={14} />
    AgriMama can make mistakes. For serious crop problems, confirm advice with
    a qualified agricultural extension officer.
  </p>
</section>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  .assistant-page {
    width: min(100%, 1120px);
    margin: 0 auto;
    padding: 34px 38px 42px;
    color: #34483a;
  }

  .page-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 24px;
  }

  .eyebrow {
    margin: 0 0 8px;
    color: #7b987f;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
  }

  h1 {
    margin: 0;
    color: #28583a;
    font-size: clamp(25px, 3vw, 32px);
    font-weight: 800;
    letter-spacing: -0.8px;
  }

  .intro {
    max-width: 650px;
    margin: 9px 0 0;
    color: #7a887d;
    font-size: 13px;
    line-height: 1.7;
  }

  .new-chat-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
    padding: 11px 15px;
    border: 1px solid #dce8dd;
    border-radius: 9px;
    background: #fff;
    color: #36734a;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .new-chat-button:hover {
    border-color: #a9c8ae;
    background: #f5faf5;
  }

  .assistant-notice {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 14px 17px;
    margin-bottom: 20px;
    border: 1px solid #e2eee2;
    border-radius: 11px;
    background: #f4f9f3;
  }

  .notice-icon {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #e4f1e3;
    color: #37804c;
  }

  .assistant-notice p {
    margin: 0;
    color: #738276;
    font-size: 11px;
    line-height: 1.65;
  }

  .assistant-notice strong {
    color: #3d6245;
  }

  .chat-panel {
    display: flex;
    min-height: 570px;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e8eee7;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 5px 22px rgb(38 72 45 / 4%);
  }

  .welcome-state {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 55px 24px 40px;
    text-align: center;
  }

  .welcome-icon {
    display: grid;
    place-items: center;
    width: 55px;
    height: 55px;
    margin-bottom: 18px;
    border-radius: 17px;
    background: #eaf5e9;
    color: #39804c;
  }

  .welcome-state h2 {
    margin: 0;
    color: #315b3c;
    font-size: 19px;
    font-weight: 750;
  }

  .welcome-state > p {
    max-width: 440px;
    margin: 9px 0 24px;
    color: #89958b;
    font-size: 12px;
    line-height: 1.7;
  }

  .suggestion-list {
    display: grid;
    width: min(100%, 620px);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .suggestion {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 48px;
    padding: 11px 13px;
    border: 1px solid #e8eee7;
    border-radius: 9px;
    background: #fff;
    color: #637768;
    font-size: 11px;
    line-height: 1.5;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .suggestion svg {
    flex: 0 0 auto;
    color: #6b9b73;
  }

  .suggestion:hover {
    border-color: #b9d4bc;
    background: #f8fbf7;
  }

  .message-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 23px;
    padding: 27px clamp(16px, 4vw, 42px);
  }

  .message-row {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    max-width: 850px;
  }

  .message-row.farmer-message {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .message-avatar {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 11px;
    background: #e9f3e8;
    color: #347348;
  }

  .message-avatar.farmer-avatar {
    background: #edf0ed;
    color: #6d7c70;
  }

  .message-content {
    min-width: 0;
    max-width: min(690px, calc(100% - 46px));
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 1px 0 7px;
    color: #48634d;
    font-size: 11px;
  }

  .language-label {
    padding: 3px 7px;
    border-radius: 5px;
    background: #f0f5ef;
    color: #758b77;
    font-size: 9px;
    font-weight: 650;
  }

  .message-bubble {
    padding: 13px 16px;
    border: 1px solid #e8eee7;
    border-radius: 3px 12px 12px 12px;
    background: #fbfcfa;
  }

  .farmer-message .message-bubble {
    border-color: #e2eee2;
    border-radius: 12px 3px 12px 12px;
    background: #f0f7ef;
  }

  .message-bubble p,
  .translation-box p {
    margin: 0;
    color: #526456;
    font-size: 12px;
    line-height: 1.8;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .translation-area {
    margin-top: 8px;
  }

  .translation-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: #438052;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
  }

  .translation-box {
    padding: 11px 13px;
    margin-top: 5px;
    border-left: 2px solid #a8c9a9;
    border-radius: 0 7px 7px 0;
    background: #f7faf6;
  }

  .translation-box > span {
    display: block;
    margin-bottom: 5px;
    color: #7d927f;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .translation-box small {
    display: block;
    margin-top: 8px;
    color: #987a48;
    font-size: 10px;
    line-height: 1.5;
  }

  .follow-up-list {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 10px;
  }

  .follow-up {
    padding: 7px 10px;
    border: 1px solid #dce9dc;
    border-radius: 8px;
    background: #fff;
    color: #4f7958;
    font-size: 10px;
    text-align: left;
    cursor: pointer;
  }

  .follow-up:hover {
    background: #f3f8f2;
  }

  .typing-bubble {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 13px 15px;
    border: 1px solid #e8eee7;
    border-radius: 3px 12px 12px 12px;
    background: #fbfcfa;
  }

  .typing-bubble span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #8eae91;
    animation: pulse 1.1s infinite ease-in-out;
  }

  .typing-bubble span:nth-child(2) {
    animation-delay: 0.15s;
  }

  .typing-bubble span:nth-child(3) {
    animation-delay: 0.3s;
  }

  .typing-bubble em {
    margin-left: 5px;
    color: #879489;
    font-size: 10px;
    font-style: normal;
  }

  @keyframes pulse {
    0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
    30% { opacity: 1; transform: translateY(-3px); }
  }

  .error-message {
    padding: 10px 13px;
    margin: 0 24px 12px;
    border: 1px solid #f0d5d0;
    border-radius: 8px;
    background: #fff8f6;
    color: #a34e42;
    font-size: 11px;
    line-height: 1.5;
  }

  .composer {
    padding: 16px 20px 18px;
    border-top: 1px solid #edf1ec;
    background: #fff;
  }

  .composer textarea {
    display: block;
    width: 100%;
    min-height: 55px;
    max-height: 150px;
    resize: vertical;
    padding: 12px 13px;
    border: 1px solid #e3eae2;
    border-radius: 9px;
    outline: none;
    background: #fcfdfb;
    color: #3e5543;
    font: inherit;
    font-size: 12px;
    line-height: 1.6;
  }

  .composer textarea:focus {
    border-color: #9fc4a3;
    box-shadow: 0 0 0 3px rgb(105 157 111 / 10%);
  }

  .composer textarea::placeholder {
    color: #a3ada4;
  }

  .composer-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
  }

  .composer-footer > span {
    color: #a0aaa1;
    font-size: 9px;
  }

  .send-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 94px;
    padding: 10px 16px;
    border: 0;
    border-radius: 8px;
    background: #34794a;
    color: #fff;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
    transition: background 0.2s;
  }

  .send-button:hover:not(:disabled) {
    background: #28643c;
  }

  .send-button:disabled {
    background: #a9bca9;
    cursor: not-allowed;
  }

  .privacy-note {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 13px 2px 0;
    color: #929d93;
    font-size: 10px;
    line-height: 1.6;
  }

  .privacy-note svg {
    flex: 0 0 auto;
    margin-top: 1px;
    color: #86a58a;
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

  @media (max-width: 760px) {
    .assistant-page {
      padding: 24px 18px 30px;
    }

    .page-heading {
      flex-direction: column;
      gap: 15px;
    }

    .new-chat-button {
      align-self: flex-start;
    }

    .chat-panel {
      min-height: 590px;
    }

    .suggestion-list {
      grid-template-columns: 1fr;
    }

    .welcome-state {
      padding: 38px 18px;
    }

    .message-list {
      padding: 22px 14px;
    }

    .composer {
      padding: 13px;
    }
  }

  @media (max-width: 420px) {
    .assistant-notice {
      align-items: flex-start;
      padding: 12px;
    }

    .composer-footer {
      align-items: flex-end;
    }

    .composer-footer > span {
      max-width: 145px;
      line-height: 1.5;
    }
  }
</style>

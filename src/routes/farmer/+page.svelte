<script>
  import {
    Sprout,
    CloudSun,
    MessageCircle,
    TrendingUp,
    Leaf,
    ShoppingBasket,
    MapPin,
    ArrowRight,
    Send,
    Sun,
    BookOpen,
    Bell,
  } from "lucide-svelte";

  import { getAuthState } from "#lib/stores/auth.svelte.js";

  const auth = getAuthState();

  let message = $state("");
  let feedback = $state("");

  const quickQuestions = [
    "How do I control maize pests?",
    "When should I plant beans?",
    "How can I improve soil fertility?",
  ];

  /**
   * @param {string} question
   */
  function selectQuestion(question) {
    message = question;
  }

  /**
   * @param {SubmitEvent} event
   */
  function handleAsk(event) {
    event.preventDefault();

    if (!message.trim()) return;

    feedback = "Your question is ready. Open AI Assistant to start a conversation.";
  }
</script>

<svelte:head>
  <meta
    name="description"
    content="Your AgriMama farming dashboard."
  />
</svelte:head>

<div class="dashboard-content">

      <section class="welcome-section">
        <div>
          <div class="welcome-label">
            <Sun size={16} />
            YOUR FARMING COMPANION
          </div>
          <h2>Hello, {auth.user?.name || "Farmer"}! <span>🌱</span></h2>
          <p>
            Welcome to AgriMama. Let's make your farming journey more productive.
          </p>
        </div>

        <div class="location-chip">
          <MapPin size={16} />
          <span>Farm location</span>
        </div>
      </section>

      <section class="hero-card">
        <div class="hero-content">
          <span class="hero-tag">
            <Sprout size={15} />
            YOUR AI FARMING COMPANION
          </span>
          <h2>Grow better.<br />Harvest more.</h2>
          <p>
            Get farming advice, learn about your crops and make informed
            decisions with AgriMama.
          </p>
          <a href="/farmer/assistant" class="hero-button">
            Explore AI Assistant <ArrowRight size={17} />
          </a>
        </div>

        <div class="hero-decoration">
          <div class="hero-circle">
            <Sprout size={100} strokeWidth={1.2} />
          </div>
          <div class="floating-leaf leaf-one">🌿</div>
          <div class="floating-leaf leaf-two">🌱</div>
        </div>
      </section>

      <section class="section">
        <div class="section-heading">
          <div>
            <h3>Your farming services</h3>
            <p>Everything you need to support your farm.</p>
          </div>
        </div>

        <div class="services-grid">
          <a href="/farmer/assistant" class="service-card">
            <div class="service-icon purple">
              <MessageCircle size={23} />
            </div>
            <h4>AI Farming Assistant</h4>
            <p>Ask questions and get farming guidance.</p>
            <span class="service-link">Ask AgriMama <ArrowRight size={15} /></span>
          </a>

          <a href="/farmer/crops" class="service-card">
            <div class="service-icon green">
              <Leaf size={23} />
            </div>
            <h4>Crop Advice</h4>
            <p>Get guidance on crop health and management.</p>
            <span class="service-link">Explore crops <ArrowRight size={15} /></span>
          </a>

          <a href="/farmer/weather" class="service-card">
            <div class="service-icon blue">
              <CloudSun size={23} />
            </div>
            <h4>Weather Updates</h4>
            <p>Stay informed about weather conditions.</p>
            <span class="service-link">View weather <ArrowRight size={15} /></span>
          </a>

          <a href="/farmer/market" class="service-card">
            <div class="service-icon orange">
              <TrendingUp size={23} />
            </div>
            <h4>Market Information</h4>
            <p>Explore agricultural market information.</p>
            <span class="service-link">Explore markets <ArrowRight size={15} /></span>
          </a>
        </div>
      </section>

      <section class="lower-grid">
        <div class="panel assistant-panel">
          <div class="panel-heading">
            <div class="heading-icon">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3>Ask AgriMama</h3>
              <p>Your farming questions, answered with AI.</p>
            </div>
          </div>

          <div class="question-area">
            <span class="question-label">TRY ASKING</span>

            {#each quickQuestions as question}
              <button
                class="question-chip"
                onclick={() => selectQuestion(question)}
              >
                {question}
                <ArrowRight size={14} />
              </button>
            {/each}
          </div>

          <form class="ask-form" onsubmit={handleAsk}>
            <input
              type="text"
              placeholder="Ask a farming question..."
              bind:value={message}
              aria-label="Your farming question"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              aria-label="Prepare question"
            >
              <Send size={18} />
            </button>
          </form>

          {#if feedback}
            <p class="feedback">{feedback}</p>
          {/if}
        </div>

        <div class="panel updates-panel">
          <div class="panel-heading">
            <div class="heading-icon">
              <Bell size={20} />
            </div>
            <div>
              <h3>Farm updates</h3>
              <p>Stay informed about your farming activities.</p>
            </div>
          </div>

          <div class="empty-state">
            <div class="empty-icon">
              <BookOpen size={27} />
            </div>
            <strong>No updates yet</strong>
            <p>
              Your weather alerts, farming tips and important notifications
              will appear here.
            </p>
          </div>
        </div>
      </section>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    background: #f7f9f6;
    color: #263b2d;
    font-family: Inter, Arial, sans-serif;
  }

  .farmer-app {
    min-height: 100vh;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    width: 255px;
    padding: 25px 18px;
    background: #fff;
    border-right: 1px solid #e9eee8;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 8px 30px;
  }

  .brand-icon {
    display: grid;
    place-items: center;
    width: 43px;
    height: 43px;
    border-radius: 12px;
    background: #28794b;
    color: white;
  }

  .brand h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: #234c35;
  }

  .brand span {
    color: #859188;
    font-size: 11px;
  }

  .close-menu {
    display: none;
    margin-left: auto;
    border: 0;
    background: transparent;
    color: #526357;
  }

  .nav-label {
    padding: 0 10px;
    margin-bottom: 12px;
    color: #a0aaa2;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 1.2px;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  nav a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 12px;
    border-radius: 9px;
    color: #718075;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    transition: 0.2s;
  }

  nav a:hover,
  nav a.active {
    background: #edf6ee;
    color: #28794b;
  }

  .new-tag {
    margin-left: auto;
    padding: 3px 6px;
    border-radius: 5px;
    background: #eee8ff;
    color: #7954ba;
    font-size: 9px;
  }

  .sidebar-bottom {
    margin-top: auto;
  }

  .help-card {
    padding: 17px;
    margin-bottom: 18px;
    border-radius: 12px;
    background: #f2f7f0;
  }

  .help-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    margin-bottom: 12px;
    border-radius: 9px;
    background: white;
    color: #28794b;
  }

  .help-card strong {
    font-size: 13px;
  }

  .help-card p {
    margin: 7px 0 12px;
    color: #829087;
    font-size: 11px;
    line-height: 1.6;
  }

  .help-card a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #28794b;
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 12px 5px 0;
    border: 0;
    border-top: 1px solid #edf0ed;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }

  .avatar {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #e4f1e5;
    color: #28794b;
    font-size: 15px;
    font-weight: 750;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .profile-info strong {
    overflow: hidden;
    color: #34483a;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-info span {
    color: #929d94;
    font-size: 10px;
  }

  .logout-label {
    margin-left: auto;
    color: #a65d5d;
    font-size: 10px;
  }

  .main-content {
    min-height: 100vh;
    margin-left: 255px;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    padding: 0 38px;
    border-bottom: 1px solid #e9eee8;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #99a39b;
    font-size: 12px;
  }

  .breadcrumb strong {
    color: #34483a;
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 23px;
  }

  .notification-button {
    position: relative;
    border: 0;
    background: transparent;
    color: #748178;
    cursor: pointer;
  }

  .notification-dot {
    position: absolute;
    top: 0;
    right: 0;
    width: 7px;
    height: 7px;
    border: 1px solid white;
    border-radius: 50%;
    background: #e36b58;
  }

  .topbar-user {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #526357;
    font-size: 12px;
    font-weight: 600;
  }

  .avatar.small {
    width: 33px;
    height: 33px;
    font-size: 12px;
  }

  .menu-button {
    display: none;
    border: 0;
    background: transparent;
    color: #526357;
  }

  .page-content {
    max-width: 1450px;
    padding: 35px 38px;
    margin: 0 auto;
  }

  .welcome-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 25px;
  }

  .welcome-label {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 9px;
    color: #77927c;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 1px;
  }

  .welcome-section h2 {
    margin: 0;
    color: #263b2d;
    font-size: 27px;
    font-weight: 800;
  }

  .welcome-section p {
    margin: 8px 0 0;
    color: #859188;
    font-size: 13px;
  }

  .location-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 13px;
    border: 1px solid #e4ebe3;
    border-radius: 8px;
    background: white;
    color: #718075;
    font-size: 11px;
    white-space: nowrap;
  }

  .hero-card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 260px;
    padding: 35px 43px;
    overflow: hidden;
    border-radius: 17px;
    background: linear-gradient(110deg, #1e5738, #328052);
    color: white;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 480px;
  }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 10px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 20px;
    color: #e0f3e3;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
  }

  .hero-content h2 {
    margin: 17px 0 10px;
    font-size: 34px;
    line-height: 1.15;
    font-weight: 800;
  }

  .hero-content p {
    max-width: 400px;
    margin: 0 0 20px;
    color: #d3e8d8;
    font-size: 12px;
    line-height: 1.7;
  }

  .hero-button {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 11px 16px;
    border-radius: 8px;
    background: white;
    color: #286442;
    font-size: 11px;
    font-weight: 750;
    text-decoration: none;
  }

  .hero-decoration {
    position: absolute;
    top: 0;
    right: 0;
    width: 42%;
    height: 100%;
    display: grid;
    place-items: center;
  }

  .hero-circle {
    display: grid;
    place-items: center;
    width: 200px;
    height: 200px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.09);
    color: rgba(255, 255, 255, 0.85);
  }

  .floating-leaf {
    position: absolute;
    font-size: 31px;
  }

  .leaf-one {
    top: 38px;
    right: 28%;
  }

  .leaf-two {
    right: 13%;
    bottom: 36px;
  }

  .section {
    margin-top: 34px;
  }

  .section-heading {
    margin-bottom: 17px;
  }

  .section-heading h3,
  .panel-heading h3 {
    margin: 0;
    color: #34483a;
    font-size: 16px;
    font-weight: 750;
  }

  .section-heading p,
  .panel-heading p {
    margin: 6px 0 0;
    color: #909b92;
    font-size: 11px;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 15px;
  }

  .service-card {
    min-width: 0;
    padding: 19px;
    border: 1px solid #e9eee8;
    border-radius: 12px;
    background: white;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .service-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 22px rgba(30, 70, 40, 0.07);
  }

  .service-icon {
    display: grid;
    place-items: center;
    width: 43px;
    height: 43px;
    margin-bottom: 15px;
    border-radius: 11px;
  }

  .service-icon.purple {
    background: #f0ebff;
    color: #8060c5;
  }

  .service-icon.green {
    background: #e8f5e9;
    color: #31814c;
  }

  .service-icon.blue {
    background: #e8f1ff;
    color: #5482bd;
  }

  .service-icon.orange {
    background: #fff0e3;
    color: #cf8743;
  }

  .service-card h4 {
    margin: 0 0 8px;
    color: #34483a;
    font-size: 12px;
    font-weight: 750;
  }

  .service-card p {
    min-height: 35px;
    margin: 0 0 15px;
    color: #89958c;
    font-size: 10px;
    line-height: 1.6;
  }

  .service-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #28794b;
    font-size: 10px;
    font-weight: 750;
  }

  .lower-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 17px;
    margin-top: 27px;
  }

  .panel {
    padding: 21px;
    border: 1px solid #e9eee8;
    border-radius: 12px;
    background: white;
  }

  .panel-heading {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .heading-icon {
    display: grid;
    place-items: center;
    width: 39px;
    height: 39px;
    border-radius: 10px;
    background: #edf6ee;
    color: #28794b;
  }

  .question-area {
    margin-top: 24px;
  }

  .question-label {
    display: block;
    margin-bottom: 10px;
    color: #9aa49c;
    font-size: 9px;
    font-weight: 750;
    letter-spacing: 1px;
  }

  .question-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    padding: 11px 12px;
    margin-bottom: 8px;
    border: 1px solid #edf0ec;
    border-radius: 8px;
    background: #fbfcfa;
    color: #617267;
    font-size: 10px;
    text-align: left;
    cursor: pointer;
  }

  .question-chip:hover {
    border-color: #b8d8bf;
    color: #28794b;
  }

  .ask-form {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .ask-form input {
    min-width: 0;
    flex: 1;
    padding: 12px;
    border: 1px solid #e3eae2;
    border-radius: 8px;
    outline: none;
    font-size: 11px;
  }

  .ask-form input:focus {
    border-color: #39875a;
  }

  .ask-form button {
    display: grid;
    place-items: center;
    width: 43px;
    border: 0;
    border-radius: 8px;
    background: #28794b;
    color: white;
    cursor: pointer;
  }

  .ask-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .feedback {
    color: #28794b;
    font-size: 11px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 15px 10px;
    text-align: center;
  }

  .empty-icon {
    display: grid;
    place-items: center;
    width: 53px;
    height: 53px;
    margin-bottom: 12px;
    border-radius: 50%;
    background: #f1f6ef;
    color: #789b7d;
  }

  .empty-state strong {
    color: #526357;
    font-size: 12px;
  }

  .empty-state p {
    max-width: 230px;
    color: #929d94;
    font-size: 10px;
    line-height: 1.7;
  }


  .mobile-overlay {
    display: none;
  }

  @media (max-width: 1100px) {
    .services-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .page-content {
      padding: 28px 25px;
    }

    .topbar {
      padding: 0 25px;
    }
  }

  @media (max-width: 760px) {
    .sidebar {
      transform: translateX(-100%);
      transition: transform 0.25s ease;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .close-menu {
      display: block;
    }

    .mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: block;
      border: 0;
      background: rgba(20, 35, 25, 0.4);
    }

    .main-content {
      margin-left: 0;
    }

    .menu-button {
      display: block;
    }

    .topbar {
      height: 62px;
      padding: 0 17px;
    }

    .topbar-user span {
      display: none;
    }

    .topbar-actions {
      gap: 15px;
    }

    .page-content {
      padding: 25px 17px;
    }

    .welcome-section {
      align-items: flex-start;
      flex-direction: column;
    }

    .welcome-section h2 {
      font-size: 23px;
    }

    .hero-card {
      min-height: 280px;
      padding: 26px 23px;
    }

    .hero-content {
      max-width: 100%;
    }

    .hero-content h2 {
      font-size: 29px;
    }

    .hero-content p {
      max-width: 270px;
    }

    .hero-decoration {
      opacity: 0.25;
      width: 55%;
    }

    .hero-circle {
      width: 160px;
      height: 160px;
    }

    .lower-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 420px) {
    .services-grid {
      grid-template-columns: 1fr 1fr;
      gap: 9px;
    }

    .service-card {
      padding: 13px;
    }

    .service-card h4 {
      font-size: 11px;
    }

    .service-card p {
      font-size: 9px;
    }

    .location-chip {
      font-size: 10px;
    }

    .footer {
      flex-direction: column;
    }
  }
</style>

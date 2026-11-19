<script>
  import {
    Sprout,
    MessageCircle,
    Leaf,
    MapPinned,
    ClipboardList,
    MessagesSquare,
    ArrowRight,
    Sun,
    Send,
  } from "lucide-svelte";

  import { getAuthState } from "#lib/stores/auth.svelte.js";

  const auth = getAuthState();

  let message = $state("");

  const quickQuestions = [
    "How do I control maize pests?",
    "When should I plant beans?",
    "How can I improve soil fertility?",
  ];

  function openAssistant(question = "") {
    const target = question
      ? `/farmer/assistant?message=${encodeURIComponent(question)}`
      : "/farmer/assistant";

    window.location.href = target;
  }
</script>

<svelte:head>
  <meta name="description" content="Your AgriMama farming dashboard." />
  <title>Overview | AgriMama</title>
</svelte:head>

<div class="dashboard-content">
  <section class="welcome-section">
    <div>
      <div class="welcome-label">
        <Sun size={16} />
        YOUR FARMING COMPANION
      </div>
      <h2>Hello, {auth.user?.name || "Farmer"}! <span>🌱</span></h2>
      <p>Welcome back. Here's a simple place to manage your farm.</p>
    </div>
  </section>

  <section class="hero-card">
    <div class="hero-content">
      <span class="hero-tag">
        <Sprout size={15} />
        YOUR FARMING COMPANION
      </span>
      <h2>Grow with confidence.</h2>
      <p>
        Keep track of your farm, manage your crops and get practical guidance
        whenever you need it.
      </p>
      <a href="/farmer/farms" class="hero-button">
        View my farms <ArrowRight size={17} />
      </a>
    </div>
    <div class="hero-decoration" aria-hidden="true">
      <div class="hero-circle"><Sprout size={76} strokeWidth={1.2} /></div>
      <span class="floating-leaf leaf-one">🌿</span>
      <span class="floating-leaf leaf-two">🌱</span>
    </div>
  </section>

  <section class="section">
    <div class="section-heading">
      <div>
        <h3>Manage your farm</h3>
        <p>Quick access to your farming activities.</p>
      </div>
    </div>

    <div class="services-grid">
      <a href="/farmer/farms" class="service-card">
        <div class="service-icon green"><MapPinned size={22} /></div>
        <h4>My Farms</h4>
        <p>View and manage your registered farms.</p>
        <span class="service-link">Open farms <ArrowRight size={15} /></span>
      </a>

      <a href="/farmer/crops" class="service-card">
        <div class="service-icon light-green"><Leaf size={22} /></div>
        <h4>Crops & Crop Cycles</h4>
        <p>Keep track of crops and their growing stages.</p>
        <span class="service-link">View crops <ArrowRight size={15} /></span>
      </a>

      <a href="/farmer/observations" class="service-card">
        <div class="service-icon amber"><ClipboardList size={22} /></div>
        <h4>Observations</h4>
        <p>Record and review what is happening in your fields.</p>
        <span class="service-link">View observations <ArrowRight size={15} /></span>
      </a>

      <a href="/farmer/conversations" class="service-card">
        <div class="service-icon blue"><MessagesSquare size={22} /></div>
        <h4>Conversations</h4>
        <p>Return to your previous farming conversations.</p>
        <span class="service-link">View conversations <ArrowRight size={15} /></span>
      </a>
    </div>
  </section>

  <section class="assistant-prompt">
    <div class="assistant-intro">
      <div class="assistant-icon"><MessageCircle size={22} /></div>
      <div>
        <h3>Need farming advice?</h3>
        <p>Ask AgriMama about your crops, soil or farming challenges.</p>
      </div>
    </div>

    <div class="quick-questions">
      {#each quickQuestions as question}
        <button type="button" class="question-chip" onclick={() => openAssistant(question)}>
          {question}
          <ArrowRight size={14} />
        </button>
      {/each}
    </div>
    <button class="text-link" type="button" onclick={() => openAssistant()}>
      Open AI Assistant <ArrowRight size={15} />
    </button>
  </section>
</div>


<style>
  :global(*) { box-sizing: border-box; }

  :global(body) {
    margin: 0;
    background: #f7f9f6;
    color: #26382c;
    font-family: Inter, Arial, sans-serif;
  }

  .dashboard-content {
    width: 100%;
    max-width: 1450px;
    padding: 30px 38px 105px;
    margin: 0 auto;
  }

  .welcome-section { margin-bottom: 22px; }

  .welcome-label {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 8px;
    color: #526f58;
    font-size: 12px;
    font-weight: 750;
    letter-spacing: .8px;
  }

  .welcome-section h2 {
    margin: 0;
    color: #173f28;
    font-size: 29px;
    line-height: 1.25;
    font-weight: 800;
  }

  .welcome-section p {
    margin: 8px 0 0;
    color: #526357;
    font-size: 16px;
  }

  .hero-card {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 190px;
    padding: 27px 34px;
    overflow: hidden;
    border-radius: 16px;
    background: linear-gradient(110deg, #1e5738, #328052);
    color: white;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 570px;
  }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 20px;
    color: #e5f3e7;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .5px;
  }

  .hero-content h2 {
    margin: 12px 0 7px;
    color: #fff;
    font-size: 29px;
    line-height: 1.2;
    font-weight: 800;
  }

  .hero-content p {
    max-width: 490px;
    margin: 0 0 15px;
    color: #f0f8f1;
    font-size: 15px;
    line-height: 1.55;
  }

  .hero-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    padding: 9px 14px;
    border-radius: 8px;
    background: #fff;
    color: #205b39;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
  }

  .hero-decoration {
    position: absolute;
    inset: 0 0 0 auto;
    display: grid;
    place-items: center;
    width: 32%;
    pointer-events: none;
  }

  .hero-circle {
    display: grid;
    place-items: center;
    width: 145px;
    height: 145px;
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 50%;
    background: rgba(255,255,255,.09);
    color: rgba(255,255,255,.85);
  }

  .floating-leaf { position: absolute; font-size: 25px; }
  .leaf-one { top: 22px; right: 30%; }
  .leaf-two { right: 12%; bottom: 22px; }

  .section { margin-top: 29px; }

  .section-heading { margin-bottom: 14px; }

  .section-heading h3,
  .assistant-intro h3 {
    margin: 0;
    color: #173f28;
    font-size: 20px;
    font-weight: 750;
  }

  .section-heading p,
  .assistant-intro p {
    margin: 5px 0 0;
    color: #526357;
    font-size: 14px;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .service-card {
    min-width: 0;
    padding: 17px;
    border: 1px solid #e3ebe2;
    border-radius: 12px;
    background: #fff;
    text-decoration: none;
    transition: transform .2s, box-shadow .2s, border-color .2s;
  }

  .service-card:hover {
    transform: translateY(-2px);
    border-color: #c5ddc9;
    box-shadow: 0 7px 20px rgba(30,70,40,.06);
  }

  .service-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    margin-bottom: 12px;
    border-radius: 10px;
  }

  .service-icon.green { background: #e8f5e9; color: #28794b; }
  .service-icon.light-green { background: #eef5e9; color: #507d3f; }
  .service-icon.amber { background: #fff4df; color: #9a6a19; }
  .service-icon.blue { background: #eaf2fb; color: #416f9f; }

  .service-card h4 {
    margin: 0 0 6px;
    color: #26382c;
    font-size: 17px;
    font-weight: 750;
  }

  .service-card p {
    min-height: 43px;
    margin: 0 0 11px;
    color: #405448;
    font-size: 14px;
    line-height: 1.5;
  }

  .service-link,
  .text-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #176638;
    font-size: 13px;
    font-weight: 700;
  }

  .assistant-prompt {
    margin-top: 23px;
    padding: 20px 22px;
    border: 1px solid #e3ebe2;
    border-radius: 13px;
    background: #fff;
  }

  .assistant-intro {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .assistant-icon {
    display: grid;
    place-items: center;
    flex: 0 0 42px;
    width: 42px;
    height: 42px;
    border-radius: 11px;
    background: #e8f5e9;
    color: #28794b;
  }

  .assistant-intro h3 { font-size: 18px; }
  .assistant-intro p { font-size: 14px; }

  .quick-questions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 17px;
  }

  .question-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 8px 11px;
    border: 1px solid #dfe9df;
    border-radius: 8px;
    background: #f9fbf8;
    color: #34483a;
    font: inherit;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
  }

  .question-chip:hover {
    border-color: #a9cfb0;
    color: #145c32;
  }

  .text-link {
    margin-top: 15px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .floating-assistant {
    position: fixed;
    right: 25px;
    bottom: 25px;
    z-index: 40;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 54px;
    padding: 0 19px;
    border: 0;
    border-radius: 999px;
    background: #237448;
    box-shadow: 0 7px 22px rgba(20,75,43,.25);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: background .2s, transform .2s;
  }

  .floating-assistant:hover {
    transform: translateY(-2px);
    background: #185d37;
  }

  a:focus-visible, button:focus-visible {
    outline: 3px solid #25834a;
    outline-offset: 3px;
  }

  @media (max-width: 1100px) {
    .services-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dashboard-content { padding-right: 25px; padding-left: 25px; }
  }

  @media (max-width: 760px) {
    .dashboard-content { padding: 24px 17px 100px; }
    .welcome-section h2 { font-size: 25px; }
    .welcome-section p { font-size: 15px; }
    .hero-card { min-height: 185px; padding: 23px; }
    .hero-content { max-width: 100%; }
    .hero-content h2 { font-size: 26px; }
    .hero-content p { max-width: 340px; font-size: 14px; }
    .hero-decoration { width: 35%; opacity: .25; }
    .hero-circle { width: 120px; height: 120px; }
    .service-card { padding: 14px; }
    .service-card h4 { font-size: 16px; }
    .service-card p { font-size: 13px; }
    .floating-assistant { right: 17px; bottom: 17px; min-height: 52px; }
  }

  @media (max-width: 440px) {
    .services-grid { grid-template-columns: 1fr 1fr; gap: 9px; }
    .service-card { padding: 12px; }
    .service-card h4 { font-size: 15px; }
    .service-card p { min-height: 58px; font-size: 13px; }
    .hero-decoration { display: none; }
    .floating-assistant { width: 54px; height: 54px; min-height: 54px; justify-content: center; padding: 0; }
    .floating-assistant span { display: none; }
    .assistant-prompt { padding: 16px; }
  }
</style>

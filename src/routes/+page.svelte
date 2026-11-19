<svelte:head>
  <title>AgriMama | Grow with confidence</title>
  <meta
    name="description"
    content="AgriMama is an AI-powered farming companion supporting women in agriculture with practical guidance and farm-management tools to make informed decisions and work towards better yields."
  />
  <meta name="theme-color" content="#f7f9f6" />
</svelte:head>

<script>
  const highlights = [
    {
      number: "01",
      title: "Know your farm",
      description: "Keep your farms, crops and growing seasons organised."
    },
    {
      number: "02",
      title: "Make informed decisions",
      description: "Record what is happening in your fields and follow progress."
    },
    {
      number: "03",
      title: "Get guidance when you need it",
      description: "Ask AgriMama questions and explore practical next steps."
    }
  ];
</script>

<div class="landing">
  <header class="topbar">
    <a class="brand" href="/" aria-label="AgriMama home">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <path d="M20 33V17" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M20 22C9 22 6 15 7 7c9-1 17 3 17 12" fill="currentColor" opacity=".18"/>
          <path d="M20 22C9 22 6 15 7 7c9-1 17 3 17 12" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
          <path d="M20 17c1-8 7-12 15-11 0 8-4 14-15 14" fill="currentColor" opacity=".18"/>
          <path d="M20 17c1-8 7-12 15-11 0 8-4 14-15 14" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="brand-name">Agri<span>Mama</span></span>
    </a>

    <nav aria-label="Main navigation">
      <a class="login-button" href="/login">
        Login
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 10h11M10 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">
          <span class="eyebrow-line"></span>
          YOUR FARM. YOUR FUTURE.
        </div>

        <h1>Grow smarter.<br /><span>Harvest better.</span></h1>

        <p class="hero-description">
          AgriMama is an AI-powered farming companion created to support women
          in agriculture. We bring practical guidance and simple farm-management
          tools together to help women farmers make informed decisions, care for
          their crops and work towards better yields.
        </p>

        <div class="hero-actions">
          <a class="primary-button" href="/login">
            Get started
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h11M10 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <span class="action-note">Practical support for every growing season.</span>
        </div>

        <div class="trust-line">
          <span class="trust-icon" aria-hidden="true">✦</span>
          Built around the people who grow our food
        </div>
      </div>

      <div class="hero-visual">
        <div class="image-frame">
          <img
            src="/images/agrimama-farmer-hero.png"
            alt="A woman farmer tending leafy green crops in her field"
          />
          <div class="image-shade"></div>
          <div class="image-caption">
            <span class="caption-mark">✳</span>
            <span>
              <strong>Rooted in your success</strong>
              <small>Growing stronger, together.</small>
            </span>
          </div>
        </div>
        <div class="visual-orbit orbit-one"></div>
        <div class="visual-orbit orbit-two"></div>
        <div class="leaf-decoration" aria-hidden="true">✳</div>
      </div>
    </section>

    <section class="benefits" aria-label="How AgriMama helps">
      <div class="benefits-intro">
        <span>FARM WITH CONFIDENCE</span>
        <h2>Small steps.<br />Stronger harvests.</h2>
      </div>

      {#each highlights as item}
        <article class="benefit">
          <span class="benefit-number">{item.number}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      {/each}
    </section>
  </main>

  <footer class="footer">
    <span>AgriMama</span>
    <span>Growing knowledge. Growing opportunity.</span>
  </footer>

  <a class="ask-button" href="/login" aria-label="Ask AgriMama — login to get started">
    <span class="ask-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3 2v-5.2A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 11.5h.01M12.5 11.5h.01M17 11.5h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      </svg>
    </span>
    <span>Ask AgriMama</span>
    <span class="ask-arrow" aria-hidden="true">↗</span>
  </a>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    min-width: 320px;
    background: #f7f9f6;
  }

  :global(body) {
    margin: 0;
    color: #263b2d;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .landing {
    min-height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(circle at 80% 17%, rgba(219, 235, 215, .5), transparent 27rem),
      #f7f9f6;
  }

  .topbar {
    width: min(1240px, calc(100% - 64px));
    height: 88px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(43, 91, 57, .09);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #1f5938;
    text-decoration: none;
  }

  .brand-mark {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    border-radius: 14px;
    background: #e5f0e4;
  }

  .brand-mark svg {
    width: 30px;
    height: 30px;
  }

  .brand-name {
    font-size: 23px;
    font-weight: 800;
    letter-spacing: -1.1px;
  }

  .brand-name span {
    color: #7a9c54;
  }

  .login-button,
  .primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-decoration: none;
    font-weight: 700;
    transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .login-button {
    min-height: 44px;
    padding: 0 19px;
    border: 1px solid #d6e3d5;
    border-radius: 999px;
    color: #285d3c;
    background: rgba(255,255,255,.72);
    font-size: 14px;
  }

  .login-button:hover {
    background: #edf4eb;
    transform: translateY(-1px);
  }

  .login-button svg,
  .primary-button svg {
    width: 18px;
    height: 18px;
  }

  main {
    width: min(1240px, calc(100% - 64px));
    margin: 0 auto;
  }

  .hero {
    min-height: 590px;
    padding: 64px 0 72px;
    display: grid;
    grid-template-columns: .92fr 1.08fr;
    align-items: center;
    gap: 58px;
  }

  .hero-copy {
    position: relative;
    z-index: 2;
    padding: 8px 0 18px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 24px;
    color: #63845f;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2.2px;
  }

  .eyebrow-line {
    width: 29px;
    height: 2px;
    border-radius: 2px;
    background: #8ba96d;
  }

  h1 {
    margin: 0;
    color: #203c2b;
    font-size: clamp(48px, 5.5vw, 72px);
    font-weight: 800;
    letter-spacing: -3.8px;
    line-height: 1.04;
  }

  h1 span {
    color: #6d914f;
  }

  .hero-description {
    max-width: 485px;
    margin: 25px 0 30px;
    color: #68786d;
    font-size: 16px;
    line-height: 1.8;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
  }

  .primary-button {
    min-height: 54px;
    padding: 0 24px;
    border-radius: 12px;
    background: #28794b;
    box-shadow: 0 9px 20px rgba(40, 121, 75, .17);
    color: #fff;
    font-size: 14px;
  }

  .primary-button:hover {
    background: #1f673e;
    box-shadow: 0 12px 24px rgba(40, 121, 75, .24);
    transform: translateY(-2px);
  }

  .action-note {
    color: #89968c;
    font-size: 11px;
  }

  .trust-line {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-top: 42px;
    color: #879489;
    font-size: 12px;
    font-weight: 500;
  }

  .trust-icon {
    color: #86a65f;
    font-size: 18px;
  }

  .hero-visual {
    position: relative;
    min-width: 0;
    padding: 12px 12px 25px 0;
  }

  .image-frame {
    position: relative;
    z-index: 1;
    height: 430px;
    overflow: hidden;
    border: 9px solid rgba(255,255,255,.86);
    border-radius: 30px 110px 30px 30px;
    background: #dce9d7;
    box-shadow: 0 25px 65px rgba(43, 78, 49, .14);
  }

  .image-frame img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: 62% center;
  }

  .image-shade {
    position: absolute;
    inset: 45% 0 0;
    background: linear-gradient(transparent, rgba(17, 42, 25, .58));
  }

  .image-caption {
    position: absolute;
    right: 24px;
    bottom: 24px;
    left: 24px;
    display: flex;
    align-items: center;
    gap: 13px;
    color: #fff;
  }

  .caption-mark {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    border: 1px solid rgba(255,255,255,.42);
    border-radius: 50%;
    background: rgba(255,255,255,.15);
    font-size: 21px;
  }

  .image-caption strong,
  .image-caption small {
    display: block;
  }

  .image-caption strong {
    font-size: 14px;
  }

  .image-caption small {
    margin-top: 4px;
    color: rgba(255,255,255,.8);
    font-size: 11px;
  }

  .visual-orbit {
    position: absolute;
    border: 1px solid rgba(123, 157, 95, .25);
    border-radius: 50%;
  }

  .orbit-one {
    width: 125px;
    height: 125px;
    top: -24px;
    right: -24px;
  }

  .orbit-two {
    width: 78px;
    height: 78px;
    top: 0;
    right: 0;
  }

  .leaf-decoration {
    position: absolute;
    z-index: 2;
    left: -25px;
    bottom: 0;
    display: grid;
    width: 58px;
    height: 58px;
    place-items: center;
    border: 7px solid #f7f9f6;
    border-radius: 20px;
    background: #dcebd7;
    color: #5c884b;
    font-size: 27px;
  }

  .benefits {
    display: grid;
    grid-template-columns: 1.05fr repeat(3, 1fr);
    gap: 30px;
    padding: 34px 0 42px;
    border-top: 1px solid #e4ebe3;
  }

  .benefits-intro > span {
    color: #7a966c;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
  }

  .benefits-intro h2 {
    margin: 10px 0 0;
    color: #294432;
    font-size: 22px;
    letter-spacing: -.7px;
    line-height: 1.2;
  }

  .benefit {
    padding: 4px 0 0 20px;
    border-left: 1px solid #e0e9df;
  }

  .benefit-number {
    color: #9aaf8b;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .benefit h3 {
    margin: 10px 0 7px;
    color: #344b39;
    font-size: 14px;
    font-weight: 750;
  }

  .benefit p {
    max-width: 210px;
    margin: 0;
    color: #849087;
    font-size: 11px;
    line-height: 1.65;
  }

  .footer {
    width: min(1240px, calc(100% - 64px));
    min-height: 58px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #e8eee7;
    color: #9aa49b;
    font-size: 10px;
  }

  .footer span:first-child {
    color: #66836a;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .3px;
  }

  .ask-button {
    position: fixed;
    right: 28px;
    bottom: 24px;
    z-index: 20;
    display: inline-flex;
    min-height: 54px;
    align-items: center;
    gap: 11px;
    padding: 0 19px 0 13px;
    border: 1px solid #1d6b40;
    border-radius: 999px;
    background: #28794b;
    box-shadow: 0 10px 28px rgba(28, 87, 49, .25);
    color: #fff;
    font-size: 13px;
    font-weight: 750;
    text-decoration: none;
    transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
  }

  .ask-button:hover {
    transform: translateY(-3px);
    background: #1f673e;
    box-shadow: 0 14px 32px rgba(28, 87, 49, .3);
  }

  .ask-icon {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 50%;
    background: rgba(255,255,255,.16);
  }

  .ask-icon svg {
    width: 19px;
    height: 19px;
  }

  .ask-arrow {
    margin-left: 2px;
    color: #cfe5d1;
    font-size: 16px;
  }

  @media (max-width: 900px) {
    .hero {
      min-height: auto;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      padding: 58px 0 62px;
    }

    h1 {
      font-size: clamp(43px, 6vw, 60px);
      letter-spacing: -2.7px;
    }

    .image-frame {
      height: 360px;
      border-top-right-radius: 82px;
    }

    .benefits {
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
    }

    .benefits-intro {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .topbar,
    main,
    .footer {
      width: calc(100% - 40px);
    }

    .topbar {
      height: 72px;
    }

    .brand-mark {
      width: 37px;
      height: 37px;
    }

    .brand-name {
      font-size: 21px;
    }

    .login-button {
      min-height: 40px;
      padding: 0 15px;
    }

    .hero {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 34px;
      padding: 48px 0 52px;
    }

    .hero-copy {
      padding: 0;
    }

    .eyebrow {
      margin-bottom: 18px;
      font-size: 9px;
      letter-spacing: 1.8px;
    }

    h1 {
      font-size: clamp(46px, 12vw, 61px);
      letter-spacing: -2.8px;
    }

    .hero-description {
      margin: 19px 0 24px;
      font-size: 14px;
      line-height: 1.7;
    }

    .hero-actions {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
    }

    .primary-button {
      min-height: 50px;
    }

    .trust-line {
      margin-top: 25px;
      font-size: 11px;
    }

    .hero-visual {
      padding: 4px 7px 18px 0;
    }

    .image-frame {
      height: 310px;
      border-width: 6px;
      border-radius: 24px 76px 24px 24px;
    }

    .image-frame img {
      object-position: 60% center;
    }

    .image-caption {
      right: 15px;
      bottom: 16px;
      left: 15px;
    }

    .leaf-decoration {
      left: -12px;
      width: 48px;
      height: 48px;
    }

    .benefits {
      grid-template-columns: 1fr;
      gap: 22px;
      padding: 28px 0 34px;
    }

    .benefits-intro {
      grid-column: auto;
    }

    .benefit {
      padding: 0 0 0 15px;
    }

    .benefit p {
      max-width: 100%;
    }

    .footer {
      min-height: 64px;
      gap: 12px;
      font-size: 9px;
    }

    .ask-button {
      right: 15px;
      bottom: 15px;
      min-height: 49px;
      padding: 0 15px 0 10px;
      font-size: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
      animation-duration: .01ms !important;
    }
  }
</style>

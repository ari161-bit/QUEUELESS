import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "./api.js";
import {
  Bell,
  CheckCircle2,
  ArrowLeft,
  Menu,
  X,
  PlusCircle,
  Users,
  Clock,
  BarChart3,
  Stethoscope,
  Scissors,
  Wrench,
  Armchair,
  Tv,
} from "lucide-react";

/* ---------------------------------------------------------
   3D tilt hook — used to give key cards real depth/perspective
   that responds to the pointer, instead of a flat hover state.
---------------------------------------------------------- */
function useTilt(maxTiltDeg = 10) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = px * maxTiltDeg * 2;
    const rotateX = -py * maxTiltDeg * 2;
    setStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px) scale(1.035)`,
      "--glare-x": `${(px + 0.5) * 100}%`,
      "--glare-y": `${(py + 0.5) * 100}%`,
      "--glare-o": 1,
    });
  };

  const onMouseLeave = () => {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)",
      "--glare-o": 0,
    });
  };

  return { ref, style, onMouseMove, onMouseLeave };
}

/* ---------------------------------------------------------
   Design tokens and global styles
---------------------------------------------------------- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    :root{
      --bg:#080B18;
      --surface:#121732;
      --surface-strong:#171D45;
      --ink:#F5F7FF;
      --ink-soft:#A6ACD4;
      --ink-faint:#6D75A3;
      --primary:#93A4FF;
      --primary-soft:rgba(147,164,255,0.14);
      --accent:#F0A63C;
      --accent-dark:#FFC163;
      --accent-soft:rgba(240,166,60,0.16);
      --on-accent:#1A1330;
      --urgent:#FF7A69;
      --urgent-soft:rgba(255,122,105,0.16);
      --line:rgba(255,255,255,0.09);
      --radius-lg:22px;
      --radius-md:14px;
      --radius-sm:9px;
      --shadow-card:0 1px 2px rgba(0,0,0,0.35), 0 16px 40px rgba(0,0,0,0.45);
      --shadow-pop:0 34px 90px rgba(0,0,0,0.6);
    }

    *{ box-sizing:border-box; }
    .qls-root{
      background:var(--bg);
      color:var(--ink);
      font-family:'Inter',sans-serif;
      min-height:100vh;
      line-height:1.5;
      -webkit-font-smoothing:antialiased;
    }
    .qls-root h1, .qls-root h2, .qls-root h3, .qls-root h4{
      font-family:'Space Grotesk',sans-serif;
      font-weight:600;
      letter-spacing:-0.01em;
      margin:0;
      color:var(--ink);
    }
    .qls-root p{ margin:0; }
    .qls-root button{ font-family:'Inter',sans-serif; cursor:pointer; color:var(--ink); background:none; }
    .qls-root input, .qls-root select, .qls-root textarea{ font-family:'Inter',sans-serif; color:var(--ink); }
    .qls-root a{ color:inherit; text-decoration:none; }
    .qls-root *:focus-visible{
      outline:2px solid var(--accent-dark);
      outline-offset:2px;
      border-radius:6px;
    }
    @media (prefers-reduced-motion: reduce){
      .qls-root *{ animation:none !important; transition:none !important; }
    }
    .mono{ font-family:'JetBrains Mono',monospace; }

    .container{ max-width:1160px; margin:0 auto; padding:0 24px; }

    /* ---------- 3D tilt cards ---------- */
    .tilt-card{
      transition:transform 160ms cubic-bezier(.2,.8,.2,1), box-shadow 160ms ease;
      transform-style:preserve-3d;
      will-change:transform;
      position:relative;
      isolation:isolate;
    }
    .tilt-card::before{
      content:"";
      position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:5;
      background:radial-gradient(circle at var(--glare-x,50%) var(--glare-y,50%), rgba(255,255,255,0.35), transparent 55%);
      opacity:var(--glare-o,0);
      transition:opacity 160ms ease;
    }
    .tilt-card:hover{ box-shadow:0 46px 90px rgba(16,22,43,0.34), 0 8px 22px rgba(16,22,43,0.16); }

    /* ---------- Nav ---------- */
    .nav{
      position:sticky; top:0; z-index:60;
      background:rgba(8,11,24,0.82);
      backdrop-filter:blur(12px);
      border-bottom:1px solid var(--line);
    }
    .nav-inner{
      max-width:1160px; margin:0 auto; padding:14px 24px;
      display:flex; align-items:center; justify-content:space-between; gap:16px;
    }
    .logo-btn{ background:none; border:none; padding:0; display:flex; align-items:center; gap:9px; }
    .logo-mark{
      width:34px; height:34px; border-radius:10px;
      background:var(--surface-strong);
      display:flex; align-items:center; justify-content:center;
      color:var(--accent); font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:17px;
      flex-shrink:0;
    }
    .logo-word{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:20px; color:var(--primary); }
    .nav-links{ display:flex; align-items:center; gap:6px; }
    .nav-link{
      background:none; border:none; padding:9px 14px; border-radius:999px;
      font-size:14.5px; font-weight:500; color:var(--ink-soft);
    }
    .nav-link:hover{ color:var(--ink); background:rgba(255,255,255,0.07); }
    .nav-link.active{ color:var(--primary); background:var(--primary-soft); font-weight:600; }
    .nav-right{ display:flex; align-items:center; gap:10px; }
    .btn-outline-nav{
      background:none; border:1px solid var(--line); color:var(--ink);
      padding:9px 17px; border-radius:999px; font-size:14.5px; font-weight:600;
    }
    .btn-outline-nav:hover{ border-color:var(--primary); color:var(--primary); }
    .btn-amber{
      background:var(--accent); color:var(--on-accent); border:none;
      padding:10px 18px; border-radius:999px; font-size:14.5px; font-weight:700;
      box-shadow:0 6px 16px rgba(240,166,60,0.35);
      transition:transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
    }
    .btn-amber:hover{ background:var(--accent-dark); transform:translateY(-2px); box-shadow:0 10px 22px rgba(240,166,60,0.42); }
    .btn-amber:active{ transform:translateY(1px); }
    .hamburger{ display:none; background:none; border:none; padding:6px; color:var(--ink); }
    .mobile-menu{
      display:none; flex-direction:column; gap:2px; padding:10px 24px 16px;
      border-bottom:1px solid var(--line); background:var(--bg);
    }
    .mobile-menu.open{ display:flex; }
    .mobile-menu .nav-link{ text-align:left; width:100%; }
    .mobile-menu .btn-amber, .mobile-menu .btn-outline-nav{ width:100%; margin-top:8px; text-align:center; justify-content:center; }

    @media (max-width:860px){
      .nav-links{ display:none; }
      .nav-right .btn-outline-nav, .nav-right .btn-amber{ display:none; }
      .hamburger{ display:flex; }
    }

    /* ---------- Shared buttons ---------- */
    .btn-primary{
      background:var(--accent); color:var(--on-accent); border:none;
      padding:14px 26px; border-radius:999px; font-size:15.5px; font-weight:700;
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      box-shadow:0 10px 24px rgba(240,166,60,0.32), 0 2px 0 rgba(206,134,32,0.9) inset;
      transition:transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }
    .btn-primary:hover{ background:var(--accent-dark); transform:translateY(-2px); box-shadow:0 16px 30px rgba(240,166,60,0.4), 0 2px 0 rgba(206,134,32,0.9) inset; }
    .btn-primary:active{ transform:translateY(1px); box-shadow:0 6px 14px rgba(240,166,60,0.3), 0 2px 0 rgba(206,134,32,0.9) inset; }
    .btn-primary:disabled{ background:#252B52; color:#6D75A3; box-shadow:none; cursor:not-allowed; transform:none; }
    .btn-secondary{
      background:var(--surface); color:var(--ink); border:1px solid var(--line);
      padding:13px 24px; border-radius:999px; font-size:15px; font-weight:600;
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      transition:transform 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
    }
    .btn-secondary:hover{ border-color:var(--primary); color:var(--primary); transform:translateY(-2px); box-shadow:0 10px 22px rgba(16,22,43,0.1); }
    .btn-secondary:active{ transform:translateY(1px); box-shadow:none; }
    .btn-dark{
      background:var(--surface-strong); color:#fff; border:none;
      padding:14px 26px; border-radius:999px; font-size:15.5px; font-weight:700;
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      box-shadow:0 10px 24px rgba(16,22,43,0.28);
      transition:transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }
    .btn-dark:hover{ background:#232B5E; transform:translateY(-2px); box-shadow:0 16px 30px rgba(0,0,0,0.4); }
    .btn-dark:active{ transform:translateY(1px); }
    .btn-text{
      background:none; border:none; color:var(--primary); font-weight:600; font-size:14.5px;
      display:inline-flex; align-items:center; gap:6px; padding:4px 0;
    }

    /* ---------- Hero ---------- */
    .hero{ padding:56px 0 40px; }
    .hero-grid{ display:grid; grid-template-columns:1.05fr 0.95fr; gap:56px; align-items:center; }
    @media (max-width:900px){ .hero-grid{ grid-template-columns:1fr; gap:40px; } }

    .hero-eyebrow{
      display:inline-flex; align-items:center; gap:7px;
      background:var(--primary-soft); color:var(--primary);
      padding:7px 14px; border-radius:999px; font-size:13.5px; font-weight:600;
      margin-bottom:20px;
    }
    .hero h1{ font-size:44px; line-height:1.08; margin-bottom:18px; }
    @media (max-width:520px){ .hero h1{ font-size:33px; } }
    .hero-sub{ font-size:17px; color:var(--ink-soft); max-width:460px; margin-bottom:30px; }

    /* token board hero visual */
    .hero-visual{ position:relative; display:flex; justify-content:center; }
    .chip-behind{
      position:absolute; width:100%; max-width:360px; height:100%; top:16px; left:50%;
      transform:translateX(-50%) rotate(-3deg);
      background:var(--primary-soft); border-radius:24px; z-index:-1;
    }
    .board-card{
      width:100%; max-width:360px; background:var(--surface-strong);
      border-radius:24px; box-shadow:var(--shadow-pop); overflow:hidden;
      padding:26px 26px 24px;
      animation:heroIn 700ms ease-out both;
    }
    .board-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
    .board-label{ font-size:12px; letter-spacing:0.04em; color:rgba(255,255,255,0.55); font-weight:600; }
    .board-live{ display:flex; align-items:center; gap:6px; font-size:12px; color:var(--accent); font-weight:600; }
    .board-dot{ width:7px; height:7px; border-radius:50%; background:var(--accent); }
    .board-your-token{ margin-bottom:20px; }
    .board-your-token .num{ font-size:52px; font-weight:700; color:var(--accent); line-height:1; }
    .board-row{ display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-top:1px solid rgba(255,255,255,0.12); }
    .board-row .k{ font-size:13px; color:rgba(255,255,255,0.62); }
    .board-row .v{ font-size:18px; color:#fff; font-weight:600; }
    .board-progress-track{ height:8px; border-radius:99px; background:rgba(255,255,255,0.14); margin:16px 0 10px; overflow:hidden; }
    .board-progress-fill{ height:100%; border-radius:99px; background:var(--accent); }
    .board-caption{ font-size:13px; color:rgba(255,255,255,0.7); }

    /* ---------- Sections ---------- */
    .section{ padding:44px 0; }
    .section-head{ margin-bottom:26px; max-width:640px; }
    .section-head h2{ font-size:28px; margin-bottom:8px; }
    .section-head p{ color:var(--ink-soft); font-size:15px; }

    /* benefits */
    .benefit-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; perspective:1000px; }
    @media (max-width:760px){ .benefit-grid{ grid-template-columns:1fr; } }
    .benefit-card{
      background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-lg); padding:28px;
      transition:transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
    }
    .benefit-card:hover{
      transform:translateY(-8px) rotateX(4deg); box-shadow:0 26px 50px rgba(16,22,43,0.16); border-color:transparent;
    }
    .benefit-icon{ width:44px; height:44px; border-radius:12px; background:var(--primary-soft); color:var(--primary); display:flex; align-items:center; justify-content:center; margin-bottom:18px; }
    .benefit-card h4{ font-size:18px; margin-bottom:9px; }
    .benefit-card p{ font-size:14.5px; color:var(--ink-soft); }

    /* how it works */
    .steps{ display:grid; grid-template-columns:repeat(4,1fr); gap:20px; perspective:1000px; }
    @media (max-width:900px){ .steps{ grid-template-columns:repeat(2,1fr);} }
    @media (max-width:520px){ .steps{ grid-template-columns:1fr; } }
    .step-card{
      background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-lg); padding:24px;
      transition:transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
    }
    .step-card:hover{
      transform:translateY(-8px) rotateX(4deg); box-shadow:0 26px 50px rgba(16,22,43,0.16); border-color:transparent;
    }
    .step-num{
      width:34px; height:34px; border-radius:10px; background:var(--surface-strong); color:var(--accent);
      display:flex; align-items:center; justify-content:center; font-weight:700; font-family:'Space Grotesk',sans-serif;
      margin-bottom:16px; font-size:15px;
    }
    .step-card h4{ font-size:16px; margin-bottom:8px; }
    .step-card p{ font-size:14px; color:var(--ink-soft); }

    /* pricing */
    .price-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
    @media (max-width:900px){ .price-grid{ grid-template-columns:1fr; max-width:420px; margin:0 auto; } }
    .price-card{ background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-lg); padding:30px; display:flex; flex-direction:column; position:relative; }
    .price-card.highlight{ border-color:var(--primary); box-shadow:var(--shadow-pop); }
    .price-pop{ position:absolute; top:-13px; left:30px; background:var(--surface-strong); color:var(--accent); font-size:12px; font-weight:700; padding:5px 12px; border-radius:999px; }
    .price-tier{ font-size:13px; color:var(--ink-faint); font-weight:600; margin-bottom:10px; }
    .price-amount{ font-family:'Space Grotesk',sans-serif; font-size:30px; font-weight:700; margin-bottom:4px; }
    .price-period{ font-size:13.5px; color:var(--ink-soft); margin-bottom:22px; }
    .price-features{ list-style:none; margin:0 0 26px; padding:0; display:flex; flex-direction:column; gap:11px; flex:1; }
    .price-features li{ display:flex; align-items:flex-start; gap:9px; font-size:14.5px; color:var(--ink-soft); }
    .price-features li svg{ flex-shrink:0; margin-top:2px; color:var(--primary); }
    .pricing-note{ font-size:13.5px; color:var(--ink-faint); margin-top:10px; }

    /* cta banner */
    .cta-banner{
      background:var(--surface-strong); border-radius:28px; padding:44px 40px;
      display:flex; align-items:center; justify-content:space-between; gap:30px; color:#fff; flex-wrap:wrap;
    }
    .cta-banner h3{ color:#fff; font-size:25px; margin-bottom:6px; max-width:420px; }
    .cta-banner p{ color:rgba(255,255,255,0.72); font-size:14.5px; }
    .cta-actions{ display:flex; gap:12px; flex-wrap:wrap; }

    /* ---------- Footer ---------- */
    .footer{ border-top:1px solid var(--line); padding:40px 0 30px; margin-top:20px; }
    .footer-top{ display:flex; justify-content:space-between; gap:40px; flex-wrap:wrap; margin-bottom:26px; }
    .footer-col h5{ font-size:13px; color:var(--ink-faint); font-weight:600; margin-bottom:12px; }
    .footer-col a, .footer-col button{
      display:block; background:none; border:none; padding:0; text-align:left;
      font-size:14.5px; color:var(--ink-soft); margin-bottom:9px;
    }
    .footer-col a:hover, .footer-col button:hover{ color:var(--primary); }
    .footer-bottom{ font-size:13px; color:var(--ink-faint); border-top:1px solid var(--line); padding-top:18px; }

    /* ---------- Businesses list ---------- */
    .page-shell{ padding:34px 0 60px; }
    .back-link{
      display:inline-flex; align-items:center; gap:7px; color:var(--ink-soft); background:none; border:none;
      font-size:14.5px; font-weight:500; margin-bottom:22px;
    }
    .back-link:hover{ color:var(--primary); }

    .chip-row{ display:flex; gap:9px; flex-wrap:wrap; margin-bottom:26px; }
    .chip{
      background:var(--surface); border:1px solid var(--line); color:var(--ink-soft);
      padding:9px 16px; border-radius:999px; font-size:14px; font-weight:500;
    }
    .chip:hover{ border-color:var(--primary); color:var(--primary); }
    .chip.active{ background:var(--surface-strong); border-color:var(--primary); color:#fff; font-weight:600; }

    .business-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
    @media (max-width:900px){ .business-grid{ grid-template-columns:repeat(2,1fr);} }
    @media (max-width:620px){ .business-grid{ grid-template-columns:1fr; } }
    .business-card{
      background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-lg);
      padding:24px; text-align:left; width:100%; display:flex; flex-direction:column; gap:14px;
      transition:transform 180ms ease, box-shadow 180ms ease;
    }
    .business-card:hover{ transform:translateY(-5px); box-shadow:var(--shadow-pop); }
    .business-icon{ width:52px; height:52px; border-radius:14px; background:var(--primary-soft); color:var(--primary); display:flex; align-items:center; justify-content:center; }
    .business-name{ font-size:18px; }
    .business-cat{ display:inline-block; background:var(--accent-soft); color:var(--accent-dark); font-size:12px; font-weight:700; padding:4px 10px; border-radius:999px; margin-top:4px; }
    .business-meta{ display:flex; justify-content:space-between; font-size:13px; color:var(--ink-soft); margin-top:auto; padding-top:10px; border-top:1px solid var(--line); }

    /* ---------- Business detail / token page ---------- */
    .detail-grid{ display:grid; grid-template-columns:1fr 1fr; gap:44px; align-items:start; }
    @media (max-width:840px){ .detail-grid{ grid-template-columns:1fr; } }
    .service-list{ display:flex; flex-direction:column; gap:12px; }
    .service-pill{
      background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-md);
      padding:16px 18px; display:flex; align-items:center; justify-content:space-between; text-align:left; width:100%;
      font-size:15.5px; font-weight:600; color:var(--ink);
    }
    .service-pill:hover{ border-color:var(--primary); background:var(--primary-soft); }
    .service-pill span.tag{ font-size:12.5px; color:var(--ink-faint); font-weight:500; }

    .token-card{ background:var(--surface-strong); border-radius:var(--radius-lg); padding:30px; color:#fff; margin-bottom:22px; }
    .token-card .biz{ font-size:13.5px; color:rgba(255,255,255,0.6); margin-bottom:2px; font-weight:600; }
    .token-card .svc{ font-size:19px; font-weight:600; color:#fff; margin-bottom:22px; }
    .token-pair{ display:flex; gap:30px; margin-bottom:20px; flex-wrap:wrap; }
    .token-block .label{ font-size:12px; color:rgba(255,255,255,0.55); font-weight:600; margin-bottom:6px; }
    .token-block .num{ font-size:38px; font-weight:700; color:var(--accent); }
    .token-block.serving .num{ color:#fff; }
    .token-progress-track{ height:9px; border-radius:99px; background:rgba(255,255,255,0.14); overflow:hidden; margin-bottom:14px; }
    .token-progress-fill{ height:100%; border-radius:99px; background:var(--accent); transition:width 400ms ease; }
    .token-status{ font-size:17px; font-weight:700; margin-bottom:4px; }
    .token-status.urgent{ color:var(--accent); }
    .token-people{ font-size:13.5px; color:rgba(255,255,255,0.7); }

    .confirm-card{
      display:flex; align-items:flex-start; gap:12px; background:var(--primary-soft); border-radius:var(--radius-md);
      padding:16px 18px; margin-top:16px;
    }
    .confirm-card .icon{ color:var(--primary); flex-shrink:0; margin-top:2px; }
    .confirm-card h5{ font-size:15px; margin-bottom:3px; }
    .confirm-card p{ font-size:13.5px; color:var(--ink-soft); }

    .action-row{ display:flex; gap:12px; flex-wrap:wrap; margin-top:20px; }

    /* push notification */
    .push-notif{
      position:fixed; top:20px; right:20px; z-index:210; background:var(--surface);
      border:1px solid var(--line); border-radius:16px; padding:16px 18px; max-width:320px;
      box-shadow:var(--shadow-pop); display:flex; gap:12px; animation:pushIn 260ms ease-out;
    }
    @media (max-width:480px){ .push-notif{ left:16px; right:16px; max-width:none; } }
    .push-notif-icon{ width:38px; height:38px; border-radius:11px; background:var(--urgent-soft); color:var(--urgent); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .push-notif-body{ flex:1; }
    .push-notif-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
    .push-notif h5{ font-size:15px; margin-bottom:4px; }
    .push-notif p{ font-size:13.5px; color:var(--ink-soft); margin-bottom:6px; }
    .push-notif .cap{ font-size:11.5px; color:var(--ink-faint); }
    .push-notif-close{ background:none; border:none; color:var(--ink-faint); flex-shrink:0; padding:2px; }
    @keyframes pushIn{ from{ opacity:0; transform:translateX(30px);} to{ opacity:1; transform:translateX(0);} }
    @keyframes heroIn{ from{ opacity:0; transform:translateY(18px);} to{ opacity:1; transform:translateY(0);} }

    /* toast */
    .toast{
      position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:200;
      background:var(--surface-strong); color:#fff; padding:13px 22px; border-radius:999px;
      font-size:14.5px; font-weight:600; display:flex; align-items:center; gap:9px;
      box-shadow:var(--shadow-pop); animation:toastIn 220ms ease-out;
    }
    @keyframes toastIn{ from{ opacity:0; transform:translate(-50%,-10px);} to{ opacity:1; transform:translate(-50%,0);} }

    /* ---------- Business dashboard ---------- */
    .dash-head{ display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:22px; flex-wrap:wrap; }
    .dash-title{ display:flex; align-items:center; gap:12px; }
    .dash-avatar{ width:48px; height:48px; border-radius:14px; background:var(--surface-strong); color:var(--accent); display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:18px; }
    .stat-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:26px; perspective:1000px; }
    @media (max-width:900px){ .stat-grid{ grid-template-columns:repeat(2,1fr);} }
    @media (max-width:480px){ .stat-grid{ grid-template-columns:1fr; } }
    .stat-card{
      background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-md); padding:20px;
      transition:transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
    }
    .stat-card:hover{
      transform:translateY(-6px) rotateX(4deg); box-shadow:0 20px 40px rgba(16,22,43,0.14); border-color:transparent;
    }
    .stat-icon{ width:36px; height:36px; border-radius:10px; background:var(--primary-soft); color:var(--primary); display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
    .stat-value{ font-family:'Space Grotesk',sans-serif; font-size:24px; font-weight:700; margin-bottom:2px; }
    .stat-label{ font-size:13px; color:var(--ink-soft); }

    .call-next-card{
      background:var(--surface-strong); border-radius:var(--radius-lg); padding:26px 28px;
      display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; margin-bottom:30px;
    }
    .call-next-card h3{ color:#fff; font-size:19px; margin-bottom:4px; }
    .call-next-card p{ color:rgba(255,255,255,0.65); font-size:13.5px; }
    .btn-call-next{
      background:var(--accent); color:var(--on-accent); border:none;
      padding:16px 30px; border-radius:999px; font-size:16.5px; font-weight:700;
      box-shadow:0 10px 24px rgba(240,166,60,0.32); flex-shrink:0;
      transition:transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
    }
    .btn-call-next:hover{ background:var(--accent-dark); transform:translateY(-2px) scale(1.02); box-shadow:0 16px 32px rgba(240,166,60,0.4); }
    .btn-call-next:active{ transform:translateY(1px) scale(1); }
    .btn-call-next:disabled{ background:rgba(255,255,255,0.25); color:rgba(255,255,255,0.6); box-shadow:none; cursor:not-allowed; transform:none; }

    .queue-head-row{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:10px; }

    .queue-table{ width:100%; border-collapse:collapse; background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-md); overflow:hidden; }
    .queue-table th{ text-align:left; font-size:12.5px; color:var(--ink-faint); font-weight:600; padding:14px 18px; border-bottom:1px solid var(--line); }
    .queue-table td{ padding:14px 18px; border-bottom:1px solid var(--line); font-size:14.5px; }
    .queue-table tr:last-child td{ border-bottom:none; }
    .queue-token{ font-weight:700; }
    .status-pill{ font-size:12px; font-weight:700; padding:5px 12px; border-radius:999px; display:inline-block; }
    .status-pill.serving{ background:var(--accent-soft); color:var(--accent-dark); }
    .status-pill.waiting{ background:var(--primary-soft); color:var(--primary); }
    .table-empty{ padding:26px 18px; text-align:center; color:var(--ink-soft); font-size:14.5px; }

    /* add customer form */
    .add-form-card{ background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-lg); padding:26px; margin-bottom:24px; max-width:480px; }
    .field{ margin-bottom:18px; }
    .field label{ display:block; font-size:13.5px; font-weight:600; color:var(--ink-soft); margin-bottom:7px; }
    .field input, .field select{
      width:100%; border:1px solid var(--line); border-radius:11px; padding:12px 14px;
      font-size:15px; color:var(--ink); outline:none; background:var(--bg);
    }
    .field input:focus, .field select:focus{ border-color:var(--primary); background:var(--surface); }
    .field-error{ color:var(--urgent); font-size:13px; margin-top:6px; }
    .form-actions{ display:flex; align-items:center; gap:14px; margin-top:6px; }

    .empty-state{
      text-align:center; padding:60px 20px; color:var(--ink-soft); background:var(--surface);
      border-radius:var(--radius-lg); border:1px dashed var(--line);
    }

    /* ---------- Notification center ---------- */
    .notif-row{ position:relative; display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }
    .notif-bell-btn{
      position:relative; background:var(--surface); border:1px solid var(--line); border-radius:999px;
      width:40px; height:40px; display:flex; align-items:center; justify-content:center; color:var(--ink-soft);
    }
    .notif-bell-btn:hover{ border-color:var(--primary); color:var(--primary); }
    .notif-badge{
      position:absolute; top:-3px; right:-3px; min-width:17px; height:17px; padding:0 4px; border-radius:999px;
      background:var(--urgent); color:#fff; font-size:10.5px; font-weight:700; display:flex; align-items:center; justify-content:center;
    }
    .notif-panel{
      position:absolute; top:48px; right:0; width:300px; max-height:340px; overflow-y:auto; z-index:80;
      background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-md); box-shadow:var(--shadow-pop);
      padding:8px;
    }
    .notif-item{ padding:11px 12px; border-radius:10px; }
    .notif-item + .notif-item{ margin-top:2px; }
    .notif-item .msg{ font-size:13.5px; color:var(--ink); margin-bottom:3px; }
    .notif-item .time{ font-size:11.5px; color:var(--ink-faint); }
    .notif-empty{ padding:20px 12px; text-align:center; font-size:13.5px; color:var(--ink-faint); }

    /* ---------- Display screen (waiting-room TV) ---------- */
    .display-screen{
      position:fixed; inset:0; color:#fff; display:flex; flex-direction:column;
      align-items:center; justify-content:center; text-align:center; font-family:'Inter',sans-serif; z-index:300; padding:40px;
      background:
        radial-gradient(ellipse 60% 50% at 50% 38%, rgba(240,166,60,0.16), transparent 65%),
        radial-gradient(ellipse 80% 60% at 50% 100%, rgba(23,34,74,0.6), transparent 70%),
        #0A1024;
      perspective:1400px;
    }
    .display-header{ position:absolute; top:0; left:0; right:0; display:flex; align-items:center; justify-content:space-between; padding:28px 44px; }
    .display-biz{ font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:700; color:#fff; }
    .display-live{ display:flex; align-items:center; gap:8px; font-size:14px; color:var(--accent); font-weight:600; }
    .display-live .dot{ width:9px; height:9px; border-radius:50%; background:var(--accent); box-shadow:0 0 12px 2px rgba(240,166,60,0.7); animation:displayPulse 1.6s ease-in-out infinite; }
    .display-now-label{ font-size:20px; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.55); font-weight:600; margin-bottom:18px; }
    .display-token{
      font-family:'JetBrains Mono',monospace; font-size:clamp(90px,16vw,220px); font-weight:700; color:var(--accent); line-height:1;
      text-shadow:
        1px 1px 0 #CE8620, 2px 2px 0 #CE8620, 3px 3px 0 #CE8620, 4px 4px 0 #CE8620,
        5px 5px 0 #B06B19, 6px 6px 0 #B06B19, 7px 7px 0 #B06B19, 8px 8px 0 #B06B19,
        10px 10px 18px rgba(0,0,0,0.5), 0 0 70px rgba(240,166,60,0.4);
      animation:displayFloat 4s ease-in-out infinite;
      transform-style:preserve-3d;
    }
    .display-service{ font-size:24px; color:rgba(255,255,255,0.75); margin-top:14px; }
    .display-upnext{ margin-top:56px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; justify-content:center; }
    .display-upnext-label{ font-size:13px; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-right:6px; }
    .display-chip{
      font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:600; color:#fff;
      background:rgba(255,255,255,0.08); border-radius:12px; padding:10px 18px;
      border:1px solid rgba(255,255,255,0.1);
      box-shadow:0 8px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14);
    }
    .display-footer{ position:absolute; bottom:24px; font-size:13px; color:rgba(255,255,255,0.35); }
    @keyframes displayFloat{ 0%,100%{ transform:translateZ(0) translateY(0);} 50%{ transform:translateZ(40px) translateY(-10px);} }
    @keyframes displayPulse{ 0%,100%{ opacity:1;} 50%{ opacity:0.4;} }
  `}</style>
);

/* ---------------------------------------------------------
   Constants
---------------------------------------------------------- */
const CATEGORY_ICON = {
  Clinic: Stethoscope,
  Salon: Scissors,
  "Service Center": Wrench,
};

const CATEGORIES = ["All", "Clinic", "Salon", "Service Center"];
const CUSTOMER_TOKEN_KEY = "queueless_customer_token";
const AUTH_KEY = "queueless_auth";

function tokenNumber(token) {
  return parseInt(token.replace(/\D/g, ""), 10);
}

/* ---------------------------------------------------------
   Shared pieces
---------------------------------------------------------- */
function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast">
      <CheckCircle2 size={17} />
      {message}
    </div>
  );
}

function PushNotification({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="push-notif">
      <div className="push-notif-icon">
        <Bell size={18} />
      </div>
      <div className="push-notif-body">
        <div className="push-notif-top">
          <h5>You're almost next.</h5>
          <button className="push-notif-close" onClick={onClose} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
        <p>Please return to the business.</p>
        <span className="cap">This is only a prototype simulation.</span>
      </div>
    </div>
  );
}

function Nav({ page, goTo, onScrollHow, onScrollPricing }) {
  const [open, setOpen] = useState(false);
  const navItem = (label, targetPage, action) => (
    <button
      className={"nav-link" + (page === targetPage ? " active" : "")}
      onClick={() => {
        setOpen(false);
        action ? action() : goTo(targetPage);
      }}
    >
      {label}
    </button>
  );
  return (
    <div className="nav">
      <div className="nav-inner">
        <button className="logo-btn" onClick={() => goTo("home")}>
          <span className="logo-mark">Q</span>
          <span className="logo-word">QUEUELESS</span>
        </button>
        <div className="nav-links">
          {navItem("Home", "home")}
          {navItem("How It Works", "home", onScrollHow)}
          {navItem("Pricing", "home", onScrollPricing)}
        </div>
        <div className="nav-right">
          <button className="btn-outline-nav" onClick={() => goTo("dashboard")}>
            For Businesses
          </button>
          <button className="btn-amber" onClick={() => goTo("businesses")}>
            Join a Queue
          </button>
          <button className="hamburger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <div className={"mobile-menu" + (open ? " open" : "")}>
        {navItem("Home", "home")}
        {navItem("How It Works", "home", onScrollHow)}
        {navItem("Pricing", "home", onScrollPricing)}
        <button className="btn-outline-nav" onClick={() => { setOpen(false); goTo("dashboard"); }}>
          For Businesses
        </button>
        <button className="btn-amber" onClick={() => { setOpen(false); goTo("businesses"); }}>
          Join a Queue
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Home page
---------------------------------------------------------- */
function HomePage({ businesses, goTo, howRef, pricingRef }) {
  const preview = businesses[0];
  const peopleAhead = preview.queue.length;
  const previewTokenNum = tokenNumber(preview.servingCustomer.token) + peopleAhead + 1;
  const estWait = Math.round(preview.avgServiceMinutes * peopleAhead);
  const progressPct = peopleAhead === 0 ? 100 : 8;
  const tilt = useTilt(16);
  const priceTilt = useTilt(12);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow">Stop Waiting. Start Living.</div>
            <h1>Your queue shouldn't own your time.</h1>
            <p className="hero-sub">
              Take a digital token, leave the waiting room and come back when you're almost next.
            </p>
            <button className="btn-primary" onClick={() => goTo("businesses")}>
              Join a Queue
            </button>
          </div>

          <div className="hero-visual">
            <div className="chip-behind" />
            <div
              ref={tilt.ref}
              className="board-card tilt-card"
              style={tilt.style}
              onMouseMove={tilt.onMouseMove}
              onMouseLeave={tilt.onMouseLeave}
            >
              <div className="board-top">
                <span className="board-label">{preview.name}</span>
                <span className="board-live">
                  <span className="board-dot" />
                  Live
                </span>
              </div>
              <div className="board-your-token">
                <div className="board-label">Your token</div>
                <div className="num mono">{preview.prefix}{previewTokenNum}</div>
              </div>
              <div className="board-progress-track">
                <div className="board-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="board-row">
                <span className="k">Currently serving</span>
                <span className="v mono">{preview.servingCustomer.token}</span>
              </div>
              <div className="board-row">
                <span className="k">People ahead</span>
                <span className="v">{peopleAhead}</span>
              </div>
              <div className="board-caption">Estimated wait, {estWait} minutes</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Stop Waiting. Start Living.</h2>
            <p>QUEUELESS helps businesses replace physical waiting with predictable digital queues.</p>
          </div>
          <div className="benefit-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <Clock size={20} />
              </div>
              <h4>Save customer time</h4>
              <p>Customers take a token and leave the waiting room instead of standing around for their turn.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <Armchair size={20} />
              </div>
              <h4>Reduce crowded waiting areas</h4>
              <p>Fewer people sitting in your lobby at once means a calmer space for staff and customers alike.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <BarChart3 size={20} />
              </div>
              <h4>Understand your busiest hours</h4>
              <p>See how your queue moves through the day so you can plan staffing around real demand.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" ref={howRef}>
        <div className="container">
          <div className="section-head">
            <h2>How It Works</h2>
          </div>
          <div className="steps">
            <div className="step-card">
              <div className="step-num">1</div>
              <h4>Scan the QR code</h4>
              <p>Customers scan a code at the counter to open the queue for that business.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h4>Get your digital token</h4>
              <p>A token is issued right away, showing their place in line.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h4>Leave the waiting area</h4>
              <p>No need to sit and wait. Run an errand or wait somewhere more comfortable.</p>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <h4>Return when you're almost next</h4>
              <p>QUEUELESS lets them know when it's nearly their turn to come back.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" ref={pricingRef}>
        <div className="container">
          <div className="section-head">
            <h2>Pricing</h2>
            <p>Proposed pricing for this prototype, to be validated with real businesses.</p>
          </div>
          <div className="price-grid">
            <div className="price-card">
              <div className="price-tier">Starter</div>
              <div className="price-amount">Rs 3,000</div>
              <div className="price-period">per month</div>
              <ul className="price-features">
                <li><CheckCircle2 size={16} /> Digital queue</li>
                <li><CheckCircle2 size={16} /> Customer notifications</li>
                <li><CheckCircle2 size={16} /> Basic dashboard</li>
              </ul>
              <button className="btn-secondary" onClick={() => goTo("dashboard")}>
                Get Started
              </button>
            </div>
            <div
              ref={priceTilt.ref}
              className="price-card highlight tilt-card"
              style={priceTilt.style}
              onMouseMove={priceTilt.onMouseMove}
              onMouseLeave={priceTilt.onMouseLeave}
            >
              <span className="price-pop">Most popular</span>
              <div className="price-tier">Professional</div>
              <div className="price-amount">Rs 7,000</div>
              <div className="price-period">per month</div>
              <ul className="price-features">
                <li><CheckCircle2 size={16} /> Everything in Starter</li>
                <li><CheckCircle2 size={16} /> Queue analytics</li>
                <li><CheckCircle2 size={16} /> Peak hour insights</li>
                <li><CheckCircle2 size={16} /> Advanced notifications</li>
              </ul>
              <button className="btn-primary" onClick={() => goTo("dashboard")}>
                Get Started
              </button>
            </div>
            <div className="price-card">
              <div className="price-tier">Enterprise</div>
              <div className="price-amount">Custom pricing</div>
              <div className="price-period">For large organizations</div>
              <ul className="price-features">
                <li><CheckCircle2 size={16} /> Multiple branch support</li>
                <li><CheckCircle2 size={16} /> Dedicated onboarding</li>
                <li><CheckCircle2 size={16} /> Custom integrations</li>
              </ul>
              <a href="mailto:hello@queueless.pk" className="btn-secondary">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h3>See QUEUELESS in action.</h3>
              <p>Try the customer flow or open the business dashboard.</p>
            </div>
            <div className="cta-actions">
              <button className="btn-primary" onClick={() => goTo("businesses")}>
                Join a Queue
              </button>
              <button className="btn-secondary" style={{ background: "transparent", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }} onClick={() => goTo("dashboard")}>
                For Businesses
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------
   Businesses list page
---------------------------------------------------------- */
function BusinessCard({ business: b, onClick }) {
  const tilt = useTilt(14);
  const Icon = CATEGORY_ICON[b.category] || Stethoscope;
  const estWait = Math.round(b.avgServiceMinutes * b.queue.length);

  return (
    <button
      ref={tilt.ref}
      className="business-card tilt-card"
      style={tilt.style}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      onClick={onClick}
    >
      <div className="business-icon">
        <Icon size={24} />
      </div>
      <div>
        <div className="business-name">{b.name}</div>
        <span className="business-cat">{b.category}</span>
      </div>
      <div className="business-meta">
        <span>{b.services.length} services</span>
        <span>About {estWait} min wait</span>
      </div>
    </button>
  );
}

function BusinessesPage({ businesses, goToBusiness }) {
  const [category, setCategory] = useState("All");
  const filtered = businesses.filter((b) => category === "All" || b.category === category);

  return (
    <div className="container page-shell">
      <div className="section-head">
        <h2>Choose a business</h2>
        <p>Pick a business below to join their queue and get a digital token.</p>
      </div>

      <div className="chip-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={"chip" + (category === c ? " active" : "")}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="business-grid">
        {filtered.map((b) => (
          <BusinessCard key={b.id} business={b} onClick={() => goToBusiness(b.id)} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Business detail / token page
---------------------------------------------------------- */
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function NotificationBell({ entryId, status, peopleAhead, joinMessage }) {
  const storageKey = `queueless_notifications_${entryId}`;
  const [notifications, setNotifications] = useState(() => readStoredJSON(storageKey) || []);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const prevRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notifications));
  }, [notifications, storageKey]);

  useEffect(() => {
    const prev = prevRef.current;
    let message = null;

    if (prev === null) {
      message = joinMessage;
    } else if (prev.status !== status) {
      if (status === "serving") message = "It's your turn — please return to the business.";
      else if (status === "done") message = "Your visit is complete.";
    } else if (status === "waiting" && prev.peopleAhead !== peopleAhead) {
      message = peopleAhead === 0 ? "You're almost next." : `${peopleAhead} people ahead of you now.`;
    }

    if (message) {
      setNotifications((list) => [{ id: crypto.randomUUID(), message, time: Date.now() }, ...list]);
      setUnread((n) => n + 1);
    }
    prevRef.current = { status, peopleAhead };
  }, [status, peopleAhead, joinMessage]);

  return (
    <div className="notif-bell-wrap" style={{ position: "relative" }}>
      <button
        className="notif-bell-btn"
        onClick={() => {
          setOpen((o) => !o);
          setUnread(0);
        }}
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          {notifications.length === 0 ? (
            <div className="notif-empty">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="notif-item">
                <div className="msg">{n.message}</div>
                <div className="time">{formatTime(n.time)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function BusinessDetailPage({ business, customerToken, onJoin, onLeave, onBack, onSimulate }) {
  const [notified, setNotified] = useState(false);
  const tilt = useTilt(11);

  if (!business) {
    return (
      <div className="container page-shell">
        <p>This business could not be found.</p>
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={16} /> Back to businesses
        </button>
      </div>
    );
  }

  const joined = customerToken && customerToken.businessId === business.id;
  const Icon = CATEGORY_ICON[business.category] || Stethoscope;

  let peopleAhead = 0;
  let status = "waiting";
  if (joined) {
    const idx = business.queue.findIndex((c) => c.id === customerToken.id);
    if (idx !== -1) {
      peopleAhead = idx;
      status = "waiting";
    } else if (business.servingCustomer && business.servingCustomer.id === customerToken.id) {
      peopleAhead = 0;
      status = "serving";
    } else {
      peopleAhead = 0;
      status = "done";
    }
  }
  const estWait = Math.round(business.avgServiceMinutes * peopleAhead);
  const initialAhead = joined ? Math.max(customerToken.initialPeopleAhead, 1) : 1;
  const progressPct =
    status === "serving" || status === "done"
      ? 100
      : Math.min(100, Math.round(((initialAhead - peopleAhead) / initialAhead) * 100));

  let statusText;
  if (status === "serving") statusText = "Please return to the business.";
  else if (status === "done") statusText = "Your visit is complete.";
  else if (peopleAhead === 0) statusText = "You're almost next";
  else statusText = `Estimated wait, ${estWait} minutes`;

  return (
    <div className="container page-shell">
      <div className="notif-row">
        <button className="back-link" onClick={onBack} style={{ marginBottom: 0 }}>
          <ArrowLeft size={16} /> Back to businesses
        </button>
        {joined && (
          <NotificationBell
            key={customerToken.id}
            entryId={customerToken.id}
            status={status}
            peopleAhead={peopleAhead}
            joinMessage={`You joined the queue for ${customerToken.service}. Your token is ${customerToken.token}.`}
          />
        )}
      </div>

      <div className="detail-grid">
        <div>
          <div className="business-icon" style={{ marginBottom: 16 }}>
            <Icon size={24} />
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>{business.name}</h1>
          <span className="business-cat" style={{ marginBottom: 20, display: "inline-block" }}>
            {business.category}
          </span>

          {!joined && (
            <>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, margin: "16px 0" }}>
                Choose a service to join the queue and get your token.
              </p>
              <div className="service-list">
                {business.services.map((s) => (
                  <button key={s} className="service-pill" onClick={() => onJoin(business.id, s)}>
                    {s}
                    <span className="tag">Tap to join</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {joined && status !== "serving" && (
            <button className="btn-text" onClick={() => onLeave(business.id)}>
              Leave this queue
            </button>
          )}
        </div>

        <div>
          {joined ? (
            <>
              <div
                ref={tilt.ref}
                className="token-card tilt-card"
                style={tilt.style}
                onMouseMove={tilt.onMouseMove}
                onMouseLeave={tilt.onMouseLeave}
              >
                <div className="biz">{business.name}</div>
                <div className="svc">{customerToken.service}</div>
                <div className="token-pair">
                  <div className="token-block">
                    <div className="label">Your token</div>
                    <div className="num mono">{customerToken.token}</div>
                  </div>
                  <div className="token-block serving">
                    <div className="label">Currently serving</div>
                    <div className="num mono">
                      {business.servingCustomer ? business.servingCustomer.token : "None"}
                    </div>
                  </div>
                </div>
                <div className="token-progress-track">
                  <div className="token-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <div className={"token-status" + (peopleAhead === 0 || status === "serving" ? " urgent" : "")}>
                  {statusText}
                </div>
                {status === "waiting" && <div className="token-people">{peopleAhead} people ahead of you</div>}
              </div>

              <div className="action-row">
                <button
                  className="btn-primary"
                  disabled={notified}
                  onClick={() => setNotified(true)}
                >
                  {notified ? "You're all set" : "Notify Me When I'm Close"}
                </button>
                <button className="btn-secondary" onClick={onSimulate}>
                  Simulate Next Notification
                </button>
              </div>

              {notified && (
                <div className="confirm-card">
                  <CheckCircle2 size={20} className="icon" />
                  <div>
                    <h5>You're all set.</h5>
                    <p>We'll notify you when you're close to your turn.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Your token and estimated wait will appear here once you choose a service.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Business dashboard
---------------------------------------------------------- */
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-shell">
      <div className="section-head">
        <h2>Business login</h2>
        <p>Log in to manage your queue.</p>
      </div>
      <form className="add-form-card" onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.pk"
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>
        {error && <div className="field-error">{error}</div>}
        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log In"}
          </button>
        </div>
      </form>
      <div className="add-form-card">
        <p style={{ fontWeight: 600, marginBottom: 10 }}>Demo accounts</p>
        <p className="mono" style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 4 }}>
          citycare@queueless.pk / demo1234
        </p>
        <p className="mono" style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 4 }}>
          glow@queueless.pk / demo1234
        </p>
        <p className="mono" style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
          quickfix@queueless.pk / demo1234
        </p>
      </div>
    </div>
  );
}

function DashboardPage({ businesses, auth, onLogin, onLogout, onCallNext, onAddCustomer }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [errors, setErrors] = useState({});

  if (!auth) return <LoginForm onLogin={onLogin} />;

  const business = businesses.find((b) => b.id === auth.business.id);
  if (!business) {
    return (
      <div className="container page-shell">
        <p>Loading your business…</p>
      </div>
    );
  }

  const waitingCount = business.queue.length;
  const avgWait =
    waitingCount > 0 ? Math.round((business.avgServiceMinutes * (waitingCount - 1)) / 2) : 0;

  const openForm = () => {
    setService(business.services[0]);
    setShowAddForm(true);
    setErrors({});
  };

  const submitForm = () => {
    const e = {};
    if (!name.trim()) e.name = "Enter the customer's name.";
    if (!service) e.service = "Choose a service.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onAddCustomer(business.id, name.trim(), service);
    setName("");
    setShowAddForm(false);
  };

  return (
    <div className="container page-shell">
      <div className="dash-head">
        <div className="dash-title">
          <div className="dash-avatar">{business.name.charAt(0)}</div>
          <div>
            <h2 style={{ fontSize: 22 }}>{business.name}</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Manage today's queue</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-outline-nav"
            onClick={() =>
              window.open(
                `${window.location.origin}${window.location.pathname}?display=${business.id}`,
                "_blank"
              )
            }
          >
            <Tv size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
            Open Display Screen
          </button>
          <button className="btn-outline-nav" onClick={onLogout}>
            Log Out
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Bell size={18} />
          </div>
          <div className="stat-value mono">
            {business.servingCustomer ? business.servingCustomer.token : "None"}
          </div>
          <div className="stat-label">Currently serving</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={18} />
          </div>
          <div className="stat-value">{waitingCount}</div>
          <div className="stat-label">Waiting customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={18} />
          </div>
          <div className="stat-value">{avgWait} min</div>
          <div className="stat-label">Average waiting time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={18} />
          </div>
          <div className="stat-value">{business.completedCount}</div>
          <div className="stat-label">Completed customers</div>
        </div>
      </div>

      <div className="call-next-card">
        <div>
          <h3>Ready to call the next customer</h3>
          <p>{waitingCount > 0 ? `${waitingCount} customers waiting in line` : "No customers waiting right now"}</p>
        </div>
        <button className="btn-call-next" disabled={waitingCount === 0} onClick={() => onCallNext(business.id)}>
          Call Next Customer
        </button>
      </div>

      <div className="queue-head-row">
        <h2 style={{ fontSize: 20 }}>Today's queue</h2>
        <button className="btn-secondary" onClick={openForm}>
          <PlusCircle size={17} />
          Add Customer
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-card">
          <div className="field">
            <label>Customer name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter customer name" />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="field">
            <label>Service</label>
            <select value={service} onChange={(e) => setService(e.target.value)}>
              {business.services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.service && <div className="field-error">{errors.service}</div>}
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={submitForm}>
              Add to Queue
            </button>
            <button className="btn-text" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="queue-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Customer</th>
            <th>Service</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {business.servingCustomer && (
            <tr>
              <td className="queue-token mono">{business.servingCustomer.token}</td>
              <td>{business.servingCustomer.name}</td>
              <td>{business.servingCustomer.service}</td>
              <td>
                <span className="status-pill serving">Serving</span>
              </td>
            </tr>
          )}
          {business.queue.map((c) => (
            <tr key={c.id}>
              <td className="queue-token mono">{c.token}</td>
              <td>{c.name}</td>
              <td>{c.service}</td>
              <td>
                <span className="status-pill waiting">Waiting</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!business.servingCustomer && business.queue.length === 0 && (
        <div className="table-empty">No customers in the queue right now.</div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Footer
---------------------------------------------------------- */
function Footer({ goTo }) {
  return (
    <div className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="logo-btn" style={{ marginBottom: 12 }}>
              <span className="logo-mark">Q</span>
              <span className="logo-word">QUEUELESS</span>
            </div>
            <p style={{ color: "var(--ink-soft)", fontSize: 14, maxWidth: 260 }}>
              Stop waiting. Start living.
            </p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <button onClick={() => goTo("home")}>Home</button>
            <button onClick={() => goTo("businesses")}>Join a Queue</button>
          </div>
          <div className="footer-col">
            <h5>Business</h5>
            <button onClick={() => goTo("dashboard")}>For Businesses</button>
          </div>
          <div className="footer-col">
            <h5>Contact</h5>
            <a href="mailto:hello@queueless.pk">hello@queueless.pk</a>
            <span style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>Karachi, Pakistan</span>
          </div>
        </div>
        <div className="footer-bottom">© 2026 QUEUELESS. All rights reserved.</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Display screen (waiting-room TV / caller board)
---------------------------------------------------------- */
function DisplayScreen({ businessId }) {
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await api.getBusiness(businessId);
        if (!cancelled) {
          setBusiness(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load this business.");
      }
    };
    load();
    const interval = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [businessId]);

  if (!business) {
    return (
      <div className="qls-root">
        <GlobalStyles />
        <div className="display-screen">
          <p style={{ color: "rgba(255,255,255,0.6)" }}>{error || "Loading…"}</p>
        </div>
      </div>
    );
  }

  const upNext = business.queue.slice(0, 4);

  return (
    <div className="qls-root">
      <GlobalStyles />
      <div className="display-screen">
        <div className="display-header">
          <span className="display-biz">{business.name}</span>
          <span className="display-live">
            <span className="dot" />
            Live
          </span>
        </div>

        <div className="display-now-label">Now Serving</div>
        <div className="display-token">{business.servingCustomer ? business.servingCustomer.token : "—"}</div>
        {business.servingCustomer && <div className="display-service">{business.servingCustomer.service}</div>}

        {upNext.length > 0 && (
          <div className="display-upnext">
            <span className="display-upnext-label">Up next</span>
            {upNext.map((c) => (
              <span key={c.id} className="display-chip">
                {c.token}
              </span>
            ))}
          </div>
        )}

        <div className="display-footer">QUEUELESS</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   App
---------------------------------------------------------- */
function readStoredJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const displayBusinessId = new URLSearchParams(window.location.search).get("display");
  if (displayBusinessId) {
    return <DisplayScreen businessId={Number(displayBusinessId)} />;
  }
  return <MainApp />;
}

function MainApp() {
  const [page, setPage] = useState("home");
  const [businesses, setBusinesses] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [selectedBusinessId, setSelectedBusinessId] = useState(1);
  const [customerToken, setCustomerToken] = useState(() => readStoredJSON(CUSTOMER_TOKEN_KEY));
  const [auth, setAuth] = useState(() => readStoredJSON(AUTH_KEY));
  const [toast, setToast] = useState("");
  const [showPush, setShowPush] = useState(false);
  const howRef = useRef(null);
  const pricingRef = useRef(null);

  const refreshBusinesses = useCallback(async () => {
    try {
      const data = await api.getBusinesses();
      setBusinesses(data);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message || "Could not reach the QUEUELESS server.");
    }
  }, []);

  useEffect(() => {
    refreshBusinesses();
    const interval = setInterval(refreshBusinesses, 4000);
    return () => clearInterval(interval);
  }, [refreshBusinesses]);

  useEffect(() => {
    if (customerToken) localStorage.setItem(CUSTOMER_TOKEN_KEY, JSON.stringify(customerToken));
    else localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  }, [customerToken]);

  useEffect(() => {
    if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    else localStorage.removeItem(AUTH_KEY);
  }, [auth]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!showPush) return;
    const t = setTimeout(() => setShowPush(false), 5000);
    return () => clearTimeout(t);
  }, [showPush]);

  const goTo = (target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (ref) => {
    if (page !== "home") {
      setPage("home");
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } else {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToBusiness = (id) => {
    setSelectedBusinessId(id);
    setPage("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJoin = async (businessId, service) => {
    const business = businesses.find((b) => b.id === businessId);
    if (!business) return;
    const initialPeopleAhead = business.queue.length;
    try {
      const result = await api.join(businessId, service);
      setCustomerToken({ id: result.id, businessId, token: result.token, service, initialPeopleAhead });
      refreshBusinesses();
    } catch (err) {
      setToast(err.message || "Could not join the queue.");
    }
  };

  const handleLeaveQueue = async () => {
    if (!customerToken) return;
    try {
      await api.leave(customerToken.id);
    } catch {
      // entry may already be gone server-side; still clear it locally
    }
    localStorage.removeItem(`queueless_notifications_${customerToken.id}`);
    setCustomerToken(null);
    refreshBusinesses();
  };

  const handleCallNext = async (businessId) => {
    if (!auth) return;
    try {
      const updated = await api.callNext(businessId, auth.token);
      setToast(`Now serving ${updated.servingCustomer.token}`);
      refreshBusinesses();
    } catch (err) {
      setToast(err.message || "Could not call the next customer.");
    }
  };

  const handleAddCustomer = async (businessId, name, service) => {
    if (!auth) return;
    try {
      await api.addCustomer(businessId, auth.token, name, service);
      setToast(`${name} added to the queue`);
      refreshBusinesses();
    } catch (err) {
      setToast(err.message || "Could not add the customer.");
    }
  };

  const handleLogin = async (email, password) => {
    const result = await api.login(email, password);
    setAuth({ token: result.token, business: result.business });
  };

  const handleLogout = () => setAuth(null);

  if (businesses === null) {
    return (
      <div className="qls-root">
        <GlobalStyles />
        <div className="container page-shell">
          <p>Loading QUEUELESS…</p>
          {loadError && <p style={{ color: "var(--urgent)", marginTop: 10 }}>{loadError}</p>}
        </div>
      </div>
    );
  }

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);

  return (
    <div className="qls-root">
      <GlobalStyles />
      <Toast message={toast} />
      <PushNotification show={showPush} onClose={() => setShowPush(false)} />
      <Nav
        page={page}
        goTo={goTo}
        onScrollHow={() => scrollToSection(howRef)}
        onScrollPricing={() => scrollToSection(pricingRef)}
      />

      {page === "home" && (
        <HomePage businesses={businesses} goTo={goTo} howRef={howRef} pricingRef={pricingRef} />
      )}
      {page === "businesses" && <BusinessesPage businesses={businesses} goToBusiness={goToBusiness} />}
      {page === "detail" && (
        <BusinessDetailPage
          business={selectedBusiness}
          customerToken={customerToken}
          onJoin={handleJoin}
          onLeave={handleLeaveQueue}
          onBack={() => goTo("businesses")}
          onSimulate={() => setShowPush(true)}
        />
      )}
      {page === "dashboard" && (
        <DashboardPage
          businesses={businesses}
          auth={auth}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onCallNext={handleCallNext}
          onAddCustomer={handleAddCustomer}
        />
      )}

      <Footer goTo={goTo} />
    </div>
  );
}

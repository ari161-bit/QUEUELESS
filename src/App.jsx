import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCircle2,
  ArrowLeft,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  Users,
  Clock,
  BarChart3,
  Stethoscope,
  Scissors,
  Wrench,
  Armchair,
} from "lucide-react";

/* ---------------------------------------------------------
   Design tokens and global styles
---------------------------------------------------------- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    :root{
      --bg:#F3F5F9;
      --surface:#FFFFFF;
      --ink:#10162B;
      --ink-soft:#565F76;
      --ink-faint:#9AA1B8;
      --primary:#17224A;
      --primary-soft:#E7EAF6;
      --accent:#F0A63C;
      --accent-dark:#CE8620;
      --accent-soft:#FCEACB;
      --urgent:#E15241;
      --urgent-soft:#FBE1DC;
      --line:#E1E4EC;
      --radius-lg:22px;
      --radius-md:14px;
      --radius-sm:9px;
      --shadow-card:0 1px 2px rgba(16,22,43,0.05), 0 10px 26px rgba(16,22,43,0.07);
      --shadow-pop:0 24px 60px rgba(16,22,43,0.22);
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
    .qls-root button{ font-family:'Inter',sans-serif; cursor:pointer; }
    .qls-root input, .qls-root select, .qls-root textarea{ font-family:'Inter',sans-serif; }
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

    /* ---------- Nav ---------- */
    .nav{
      position:sticky; top:0; z-index:60;
      background:rgba(243,245,249,0.88);
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
      background:var(--primary);
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
    .nav-link:hover{ color:var(--ink); background:rgba(23,34,74,0.06); }
    .nav-link.active{ color:var(--primary); background:var(--primary-soft); font-weight:600; }
    .nav-right{ display:flex; align-items:center; gap:10px; }
    .btn-outline-nav{
      background:none; border:1px solid var(--line); color:var(--ink);
      padding:9px 17px; border-radius:999px; font-size:14.5px; font-weight:600;
    }
    .btn-outline-nav:hover{ border-color:var(--primary); color:var(--primary); }
    .btn-amber{
      background:var(--accent); color:var(--primary); border:none;
      padding:10px 18px; border-radius:999px; font-size:14.5px; font-weight:700;
      box-shadow:0 6px 16px rgba(240,166,60,0.35);
    }
    .btn-amber:hover{ background:var(--accent-dark); }
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
      background:var(--accent); color:var(--primary); border:none;
      padding:14px 26px; border-radius:999px; font-size:15.5px; font-weight:700;
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      box-shadow:0 10px 24px rgba(240,166,60,0.32);
    }
    .btn-primary:hover{ background:var(--accent-dark); }
    .btn-primary:disabled{ background:#CBD0DE; color:#7C8399; box-shadow:none; cursor:not-allowed; }
    .btn-secondary{
      background:var(--surface); color:var(--ink); border:1px solid var(--line);
      padding:13px 24px; border-radius:999px; font-size:15px; font-weight:600;
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
    }
    .btn-secondary:hover{ border-color:var(--primary); color:var(--primary); }
    .btn-dark{
      background:var(--primary); color:#fff; border:none;
      padding:14px 26px; border-radius:999px; font-size:15.5px; font-weight:700;
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
    }
    .btn-dark:hover{ background:#0E1733; }
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
      width:100%; max-width:360px; background:var(--primary);
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
    .benefit-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
    @media (max-width:760px){ .benefit-grid{ grid-template-columns:1fr; } }
    .benefit-card{ background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-lg); padding:28px; }
    .benefit-icon{ width:44px; height:44px; border-radius:12px; background:var(--primary-soft); color:var(--primary); display:flex; align-items:center; justify-content:center; margin-bottom:18px; }
    .benefit-card h4{ font-size:18px; margin-bottom:9px; }
    .benefit-card p{ font-size:14.5px; color:var(--ink-soft); }

    /* how it works */
    .steps{ display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
    @media (max-width:900px){ .steps{ grid-template-columns:repeat(2,1fr);} }
    @media (max-width:520px){ .steps{ grid-template-columns:1fr; } }
    .step-card{ background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-lg); padding:24px; }
    .step-num{
      width:34px; height:34px; border-radius:10px; background:var(--primary); color:var(--accent);
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
    .price-pop{ position:absolute; top:-13px; left:30px; background:var(--primary); color:var(--accent); font-size:12px; font-weight:700; padding:5px 12px; border-radius:999px; }
    .price-tier{ font-size:13px; color:var(--ink-faint); font-weight:600; margin-bottom:10px; }
    .price-amount{ font-family:'Space Grotesk',sans-serif; font-size:30px; font-weight:700; margin-bottom:4px; }
    .price-period{ font-size:13.5px; color:var(--ink-soft); margin-bottom:22px; }
    .price-features{ list-style:none; margin:0 0 26px; padding:0; display:flex; flex-direction:column; gap:11px; flex:1; }
    .price-features li{ display:flex; align-items:flex-start; gap:9px; font-size:14.5px; color:var(--ink-soft); }
    .price-features li svg{ flex-shrink:0; margin-top:2px; color:var(--primary); }
    .pricing-note{ font-size:13.5px; color:var(--ink-faint); margin-top:10px; }

    /* cta banner */
    .cta-banner{
      background:var(--primary); border-radius:28px; padding:44px 40px;
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
    .chip.active{ background:var(--primary); border-color:var(--primary); color:#fff; font-weight:600; }

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

    .token-card{ background:var(--primary); border-radius:var(--radius-lg); padding:30px; color:#fff; margin-bottom:22px; }
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
      background:var(--primary); color:#fff; padding:13px 22px; border-radius:999px;
      font-size:14.5px; font-weight:600; display:flex; align-items:center; gap:9px;
      box-shadow:var(--shadow-pop); animation:toastIn 220ms ease-out;
    }
    @keyframes toastIn{ from{ opacity:0; transform:translate(-50%,-10px);} to{ opacity:1; transform:translate(-50%,0);} }

    /* ---------- Business dashboard ---------- */
    .dash-head{ display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:22px; flex-wrap:wrap; }
    .dash-title{ display:flex; align-items:center; gap:12px; }
    .dash-avatar{ width:48px; height:48px; border-radius:14px; background:var(--primary); color:var(--accent); display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:18px; }
    .biz-select-wrap{
      position:relative; display:inline-flex; align-items:center; gap:8px;
      background:var(--surface); border:1px solid var(--line); border-radius:12px;
      padding:9px 34px 9px 14px; font-size:14.5px; font-weight:500;
    }
    .biz-select-wrap select{ appearance:none; border:none; background:none; font-size:14.5px; font-weight:600; color:var(--ink); outline:none; }
    .biz-select-chevron{ position:absolute; right:12px; pointer-events:none; color:var(--ink-faint); }

    .stat-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:18px; margin-bottom:26px; }
    @media (max-width:900px){ .stat-grid{ grid-template-columns:repeat(2,1fr);} }
    @media (max-width:480px){ .stat-grid{ grid-template-columns:1fr; } }
    .stat-card{ background:var(--surface); border:1px solid var(--line); border-radius:var(--radius-md); padding:20px; }
    .stat-icon{ width:36px; height:36px; border-radius:10px; background:var(--primary-soft); color:var(--primary); display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
    .stat-value{ font-family:'Space Grotesk',sans-serif; font-size:24px; font-weight:700; margin-bottom:2px; }
    .stat-label{ font-size:13px; color:var(--ink-soft); }

    .call-next-card{
      background:var(--primary); border-radius:var(--radius-lg); padding:26px 28px;
      display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap; margin-bottom:30px;
    }
    .call-next-card h3{ color:#fff; font-size:19px; margin-bottom:4px; }
    .call-next-card p{ color:rgba(255,255,255,0.65); font-size:13.5px; }
    .btn-call-next{
      background:var(--accent); color:var(--primary); border:none;
      padding:16px 30px; border-radius:999px; font-size:16.5px; font-weight:700;
      box-shadow:0 10px 24px rgba(240,166,60,0.32); flex-shrink:0;
    }
    .btn-call-next:hover{ background:var(--accent-dark); }
    .btn-call-next:disabled{ background:rgba(255,255,255,0.25); color:rgba(255,255,255,0.6); box-shadow:none; cursor:not-allowed; }

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
  `}</style>
);

/* ---------------------------------------------------------
   Mock data
---------------------------------------------------------- */
const CATEGORY_ICON = {
  Clinic: Stethoscope,
  Salon: Scissors,
  "Service Center": Wrench,
};

const WAITING_NAMES = [
  "Ali Raza", "Sara Malik", "Hassan Tariq", "Ayesha Noor", "Bilal Sheikh",
  "Fatima Iqbal", "Usman Farooq", "Zainab Aslam", "Hamza Khan", "Mahnoor Butt",
  "Owais Ahmed", "Rabia Yousuf",
];

function buildQueue(prefix, startNum, count, services) {
  return Array.from({ length: count }, (_, i) => ({
    token: prefix + (startNum + i),
    name: WAITING_NAMES[(startNum + i) % WAITING_NAMES.length],
    service: services[(startNum + i) % services.length],
  }));
}

const INITIAL_BUSINESSES = [
  {
    id: 1,
    name: "CityCare Diagnostic Center",
    category: "Clinic",
    services: ["General Consultation", "Blood Test", "X-Ray", "Ultrasound"],
    prefix: "A",
    avgServiceMinutes: 5,
    completedCount: 18,
    servingCustomer: { token: "A32", name: "Nadia Farooqi", service: "General Consultation" },
    queue: buildQueue("A", 33, 5, ["General Consultation", "Blood Test", "X-Ray", "Ultrasound"]),
  },
  {
    id: 2,
    name: "Glow Salon",
    category: "Salon",
    services: ["Haircut", "Hair Color", "Manicure", "Facial"],
    prefix: "B",
    avgServiceMinutes: 10,
    completedCount: 9,
    servingCustomer: { token: "B10", name: "Ayesha Khan", service: "Haircut" },
    queue: buildQueue("B", 11, 4, ["Haircut", "Hair Color", "Manicure", "Facial"]),
  },
  {
    id: 3,
    name: "QuickFix Service Center",
    category: "Service Center",
    services: ["Mobile Repair", "Laptop Repair", "Appliance Repair"],
    prefix: "C",
    avgServiceMinutes: 15,
    completedCount: 4,
    servingCustomer: { token: "C5", name: "Bilal Ahmed", service: "Laptop Repair" },
    queue: buildQueue("C", 6, 3, ["Mobile Repair", "Laptop Repair", "Appliance Repair"]),
  },
];

const CATEGORIES = ["All", "Clinic", "Salon", "Service Center"];

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
            <div className="board-card">
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
            <div className="price-card highlight">
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
        {filtered.map((b) => {
          const Icon = CATEGORY_ICON[b.category] || Stethoscope;
          const estWait = Math.round(b.avgServiceMinutes * b.queue.length);
          return (
            <button key={b.id} className="business-card" onClick={() => goToBusiness(b.id)}>
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
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Business detail / token page
---------------------------------------------------------- */
function BusinessDetailPage({ business, customerToken, onJoin, onLeave, onBack, onSimulate }) {
  const [notified, setNotified] = useState(false);

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
    const idx = business.queue.findIndex((c) => c.token === customerToken.token);
    if (idx !== -1) {
      peopleAhead = idx;
      status = "waiting";
    } else if (business.servingCustomer && business.servingCustomer.token === customerToken.token) {
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
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> Back to businesses
      </button>

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
              <div className="token-card">
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
function DashboardPage({ businesses, selectedId, setSelectedId, onCallNext, onAddCustomer }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [errors, setErrors] = useState({});

  const business = businesses.find((b) => b.id === selectedId) || businesses[0];
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
            <h2 style={{ fontSize: 22 }}>QUEUELESS Business</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Manage today's queue</p>
          </div>
        </div>
        <div className="biz-select-wrap">
          <select value={business.id} onChange={(e) => setSelectedId(Number(e.target.value))}>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="biz-select-chevron" />
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
            <tr key={c.token}>
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
   App
---------------------------------------------------------- */
export default function App() {
  const [page, setPage] = useState("home");
  const [businesses, setBusinesses] = useState(INITIAL_BUSINESSES);
  const [selectedBusinessId, setSelectedBusinessId] = useState(1);
  const [customerToken, setCustomerToken] = useState(null);
  const [toast, setToast] = useState("");
  const [showPush, setShowPush] = useState(false);
  const howRef = useRef(null);
  const pricingRef = useRef(null);

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

  const handleJoin = (businessId, service) => {
    const business = businesses.find((b) => b.id === businessId);
    if (!business) return;
    const servingNum = business.servingCustomer ? tokenNumber(business.servingCustomer.token) : 0;
    const nextNum = servingNum + business.queue.length + 1;
    const newToken = business.prefix + nextNum;
    const initialPeopleAhead = business.queue.length;

    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === businessId
          ? { ...b, queue: [...b.queue, { token: newToken, name: "You", service }] }
          : b
      )
    );
    setCustomerToken({ businessId, token: newToken, service, initialPeopleAhead });
  };

  const handleLeaveQueue = (businessId) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === businessId ? { ...b, queue: b.queue.filter((c) => c.token !== customerToken.token) } : b
      )
    );
    setCustomerToken(null);
  };

  const handleCallNext = (businessId) => {
    const business = businesses.find((b) => b.id === businessId);
    if (!business || business.queue.length === 0) return;
    const nextCustomer = business.queue[0];
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === businessId
          ? {
              ...b,
              servingCustomer: nextCustomer,
              queue: b.queue.slice(1),
              completedCount: b.completedCount + (b.servingCustomer ? 1 : 0),
            }
          : b
      )
    );
    setToast(`Now serving ${nextCustomer.token}`);
  };

  const handleAddCustomer = (businessId, name, service) => {
    const business = businesses.find((b) => b.id === businessId);
    if (!business) return;
    const servingNum = business.servingCustomer ? tokenNumber(business.servingCustomer.token) : 0;
    const nextNum = servingNum + business.queue.length + 1;
    const newToken = business.prefix + nextNum;
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === businessId ? { ...b, queue: [...b.queue, { token: newToken, name, service }] } : b
      )
    );
    setToast(`${name} added to the queue as ${newToken}`);
  };

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
          selectedId={selectedBusinessId}
          setSelectedId={setSelectedBusinessId}
          onCallNext={handleCallNext}
          onAddCustomer={handleAddCustomer}
        />
      )}

      <Footer goTo={goTo} />
    </div>
  );
}

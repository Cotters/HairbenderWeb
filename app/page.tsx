"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  COLLECTION_LABELS,
  COLLECTION_ORDER,
  styleCollections,
} from "@/lib/styles/collections";
import type { CollectionKey, MoodboardCategory, MoodboardEntry } from "@/lib/styles/types";

const MOODBOARD_SLOTS: { category: MoodboardCategory; label: string; icon: string }[] = [
  { category: "colour", label: "Colour", icon: "◑" },
  { category: "texture", label: "Texture", icon: "≋" },
  { category: "length-shape", label: "Length & Shape", icon: "⌇" },
];

const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
      '<rect width="100%" height="100%" fill="#e8e8e8"/>' +
      '<path d="M0 480 L160 360 L280 440 L420 320 L620 480 L800 260 L800 600 L0 600 Z" fill="#d2d2d2"/>' +
      '<text x="50%" y="50%" font-family="Courier New" font-size="28" text-anchor="middle" fill="#555">Hairbender Preview</text>' +
      "</svg>"
  );


export default function Home() {
  const [collection, setCollection] = useState<CollectionKey>("paris");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(placeholderImage);
  const [resultUrl, setResultUrl] = useState<string>(placeholderImage);
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready to process.");
  const [error, setError] = useState("");
  const [slider, setSlider] = useState(55);
  const [emailSaved, setEmailSaved] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean | null>(null);
  const [moodboard, setMoodboard] = useState<MoodboardEntry[]>([]);
  const [moodboardOpen, setMoodboardOpen] = useState(false);
  const moodboardInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mql.matches);
    const handler = (e: MediaQueryListEvent) => {
      if (document.documentElement.dataset.theme) return; // manual override active
      setDarkMode(e.matches);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (darkMode === null) return;
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const revealFrameRef = useRef<HTMLDivElement | null>(null);
  const revealDragging = useRef(false);

  const updateRevealFromPointer = (clientX: number) => {
    if (!revealFrameRef.current) return;
    const rect = revealFrameRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSlider(pct);
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!revealDragging.current) return;
      updateRevealFromPointer(e.clientX);
    };
    const handleUp = () => { revealDragging.current = false; };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  const [cropUrl, setCropUrl] = useState<string>(placeholderImage);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropViewport, setCropViewport] = useState(320);
  const [imageDims, setImageDims] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const cropContainerRef = useRef<HTMLDivElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    if (!processing) return;
    const timer = setInterval(() => {
      setProgress((value) => (value < 80 ? value + 6 : value));
    }, 350);
    return () => clearInterval(timer);
  }, [processing]);

  useEffect(() => {
    if (!rawFile) return;
    const url = URL.createObjectURL(rawFile);
    setCropUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [rawFile]);

  useEffect(() => {
    const updateViewport = () => {
      if (!cropContainerRef.current) return;
      setCropViewport(cropContainerRef.current.clientWidth);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const activeStyles = useMemo(
    () => styleCollections[collection],
    [collection]
  );

  const baseScale = useMemo(() => {
    if (!imageDims) return 1;
    return Math.min(cropViewport / imageDims.width, cropViewport / imageDims.height);
  }, [cropViewport, imageDims]);

  const effectiveScale = baseScale * cropZoom;

  const clampOffset = (nextOffset: { x: number; y: number }) => {
    if (!imageDims) return nextOffset;
    const scaledWidth = imageDims.width * effectiveScale;
    const scaledHeight = imageDims.height * effectiveScale;
    const maxX = Math.max(0, (scaledWidth - cropViewport) / 2);
    const maxY = Math.max(0, (scaledHeight - cropViewport) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, nextOffset.x)),
      y: Math.min(maxY, Math.max(-maxY, nextOffset.y)),
    };
  };

  useEffect(() => {
    setCropOffset((prev) => clampOffset(prev));
  }, [effectiveScale, cropViewport, imageDims]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(nextFile.type)) {
      setError("Only JPG or PNG files are accepted.");
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (nextFile.size > maxSize) {
      setError("File too large. Please upload under 10MB.");
      return;
    }
    setRawFile(nextFile);
    setFile(null);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setImageDims(null);
    setStep(2);
    setError("");
  };

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!dragRef.current) return;
      const nextOffset = {
        x: dragRef.current.offsetX + (event.clientX - dragRef.current.startX),
        y: dragRef.current.offsetY + (event.clientY - dragRef.current.startY),
      };
      setCropOffset(clampOffset(nextOffset));
    };

    const handleUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [cropViewport, imageDims, effectiveScale]);

  const handleCropStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageDims) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      offsetX: cropOffset.x,
      offsetY: cropOffset.y,
    };
  };

  const handleMoodboardUpload = (category: MoodboardCategory, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;

    // Revoke old preview URL if replacing
    const existing = moodboard.find((m) => m.category === category);
    if (existing) URL.revokeObjectURL(existing.previewUrl);

    const entry: MoodboardEntry = {
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      category,
    };

    setMoodboard((prev) => [
      ...prev.filter((m) => m.category !== category),
      entry,
    ]);
  };

  const handleMoodboardRemove = (category: MoodboardCategory) => {
    const existing = moodboard.find((m) => m.category === category);
    if (existing) URL.revokeObjectURL(existing.previewUrl);
    setMoodboard((prev) => prev.filter((m) => m.category !== category));
  };

  const handleStyleMe = async () => {
    if (!rawFile || !imageDims) {
      setError("Upload a selfie first.");
      return;
    }
    if (!selectedStyle) {
      setError("Select a style from the Lookbook to proceed.");
      return;
    }
    const img = cropImageRef.current;
    if (!img) return;

    const canvasSize = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaledWidth = imageDims.width * effectiveScale;
    const scaledHeight = imageDims.height * effectiveScale;
    const renderX = (cropViewport - scaledWidth) / 2 + cropOffset.x;
    const renderY = (cropViewport - scaledHeight) / 2 + cropOffset.y;
    const srcSize = cropViewport / effectiveScale;
    const srcX = Math.max(0, Math.min(imageDims.width - srcSize, -renderX / effectiveScale));
    const srcY = Math.max(0, Math.min(imageDims.height - srcSize, -renderY / effectiveScale));

    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, canvasSize, canvasSize);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });
    if (!blob) {
      setError("Unable to finalize crop. Please retry.");
      return;
    }

    const croppedFile = new File([blob], "hairbender-crop.jpg", { type: "image/jpeg" });
    setFile(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setStep(4);
    setProcessing(true);
    setStatus("Submitting to the stylist...");
    setProgress(8);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", croppedFile);
      formData.append("styleId", selectedStyle);
      formData.append("collection", collection);

      for (const entry of moodboard) {
        formData.append("moodboard_files", entry.file);
        formData.append("moodboard_categories", entry.category);
      }

      const response = await fetch("/api/tryon", { method: "POST", body: formData });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "xAI request failed.");
      }

      const data = await response.json();
      setResultUrl(data.resultImageUrl || placeholderImage);
      setProgress(100);
      setStatus("Editorial finish complete.");
      setProcessing(false);
      setStep(5);
    } catch (err) {
      setProcessing(false);
      setStep(2);
      setStatus("Ready to process.");
      setError(err instanceof Error ? err.message : "xAI request failed. Please retry.");
    }
  };

  const handleReset = () => {
    setRawFile(null);
    setFile(null);
    setSelectedStyle(null);
    setPreviewUrl(placeholderImage);
    setResultUrl(placeholderImage);
    setCropUrl(placeholderImage);
    setStep(1);
    setProcessing(false);
    setProgress(0);
    setStatus("Ready to process.");
    setError("");
    setSlider(55);
    setEmailSaved(false);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setImageDims(null);
    for (const entry of moodboard) URL.revokeObjectURL(entry.previewUrl);
    setMoodboard([]);
    setMoodboardOpen(false);
  };

  return (
    <>
      <header className="site-header">
        <nav className="nav">
          <div className="brand">
            <span className="brand-mark">HB</span>
            <span className="brand-name">Hairbender</span>
          </div>
          <div className="nav-links">
            <a href="#tryon">Try</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              className="btn btn-ghost theme-toggle"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle dark mode"
              type="button"
            >
              ◐
            </button>
            <a className="btn btn-primary" href="#tryon">
              Start Trial
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero" id="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Editorial-grade AI Hair Styling</p>
              <h1>The Vogue of Hair Apps.</h1>
              <p className="lead">
                Hairbender delivers salon-quality hair transformations in a
                single take. Photorealistic, physics-accurate, and composed like
                a fashion magazine cover.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#tryon">
                  Start Trial
                </a>
                <a className="btn btn-ghost" href="#features">
                  View Features
                </a>
              </div>
              <div className="hero-meta">
                <span>5-10s processing</span>
                <span>High-res exports</span>
                <span>Barber Protocol PDF</span>
              </div>
            </div>
            <div className="hero-frame">
              <div className="frame-top">
                <span>Issue 06 - Summer 2026</span>
                <span>Editorial Red</span>
              </div>
              <div className="frame-image">
                <div className="frame-badge">NEW LOOK</div>
                <div className="frame-caption">
                  The Textured Crop, styled for sharp lines and quiet volume.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="value-props" id="value-props">
          <div className="prop">
            <h3>Photorealistic Try-On</h3>
            <p>
              High-fidelity hair rendering tuned for texture, shine, and depth.
            </p>
          </div>
          <div className="prop">
            <h3>Editorial Reveal</h3>
            <p>
              Magazine-grade framing, before/after slider, and cover shoot
              export.
            </p>
          </div>
          <div className="prop">
            <h3>Barber Protocol</h3>
            <p>Precision cut specs and guard lengths, ready for your stylist.</p>
          </div>
        </section>

        <section className="tryon" id="tryon">
          <div className="section-head">
            <p className="eyebrow">The Editorial Process</p>
            <h2>Upload. Commission. Reveal.</h2>
            <p className="lead">
              We prioritize photorealism over gimmicks. Submit a clean selfie
              and receive a salon-grade transformation.
            </p>
          </div>

          <div className="tryon-layout">

            {/* ── Left: photo view ── */}
            <div className="photo-col">

              {/* Image box — always 1:1, never changes size */}
              {step === 1 && (
                <div className="photo-view photo-view--upload">
                  <div className="casting-overlay">
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleFileChange}
                    />
                    <div className="casting-prompt">
                      <p>Drop a selfie or click to upload</p>
                      <span>JPG or PNG · max 10MB</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div
                  className="photo-view photo-view--crop"
                  ref={cropContainerRef}
                  onMouseDown={handleCropStart}
                >
                  <img
                    ref={cropImageRef}
                    src={cropUrl}
                    alt="Crop preview"
                    onLoad={(e) => {
                      const t = e.currentTarget;
                      setImageDims({ width: t.naturalWidth, height: t.naturalHeight });
                    }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${effectiveScale})`,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                    draggable={false}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="photo-view">
                  <img
                    src={previewUrl}
                    alt="Processing"
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </div>
              )}

              {step === 5 && (
                <div
                  className="photo-view"
                  ref={revealFrameRef}
                  onPointerDown={(e) => {
                    revealDragging.current = true;
                    updateRevealFromPointer(e.clientX);
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Before"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                  <img
                    src={resultUrl}
                    alt="After"
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", display: "block",
                      clipPath: `inset(0 ${100 - slider}% 0 0)`,
                    }}
                  />
                  <div className="reveal-divider" style={{ left: `${slider}%` }}>
                    <div
                      className="reveal-handle"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        revealDragging.current = true;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Controls below image — text/buttons only, image never moves */}
              <div className="photo-controls">
                {step === 1 && (
                  <>
                    <p className="photo-controls-label">Casting</p>
                    <p className="photo-controls-desc">
                      Clean lighting, neutral expression, chin slightly up.
                    </p>
                    <div className="validation-hints">
                      <span>Face centered</span>
                      <span>Even lighting</span>
                      <span>No heavy filters</span>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="photo-controls-label">Crop</p>
                    <p className="photo-controls-desc">
                      Drag to reposition · zoom to fit.
                    </p>
                    <label
                      htmlFor="cropZoom"
                      style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", opacity: 0.5 }}
                    >
                      Zoom
                    </label>
                    <input
                      id="cropZoom"
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.01"
                      value={cropZoom}
                      style={{ width: "100%", margin: "0.4rem 0 0" }}
                      onChange={(e) => setCropZoom(Number(e.target.value))}
                    />
                    <div className="photo-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleStyleMe}
                        disabled={!selectedStyle || processing}
                      >
                        Style Me
                      </button>
                      <button className="btn btn-ghost" onClick={handleReset}>
                        Scrap
                      </button>
                    </div>
                    {!selectedStyle && (
                      <p className="photo-hint">Select a style from the Lookbook to proceed.</p>
                    )}
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="progress-card" style={{ marginBottom: "0.75rem" }}>
                      <div className="progress-line" style={{ width: `${progress}%` }} />
                      <div className="progress-steps">
                        <div>Casting verified</div>
                        <div>Texture mapped</div>
                        <div>Light sculpted</div>
                        <div>Editorial finish</div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.75rem", textTransform: "uppercase" }}>
                      {status}
                    </p>
                  </>
                )}

                {step === 5 && (
                  <>
                    <p className="photo-controls-label">Reveal — drag to compare</p>
                    <div className="photo-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = resultUrl;
                          link.download = "hairbender-cover-shoot.jpg";
                          link.click();
                        }}
                      >
                        Export Cover Shoot
                      </button>
                      <button className="btn btn-ghost" onClick={handleReset}>
                        New Session
                      </button>
                    </div>
                    <form
                      className="email-capture"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setEmailSaved(true);
                      }}
                    >
                      <label htmlFor="emailInput">Save your edit to the Atelier</label>
                      <div className="email-row">
                        <input
                          id="emailInput"
                          type="email"
                          placeholder="you@studio.com"
                          required
                          disabled={emailSaved}
                        />
                        <button className="btn btn-primary" type="submit">Save</button>
                      </div>
                      <p className="email-note">We only email when your export is ready.</p>
                      <div
                        className="email-success"
                        style={{ display: emailSaved ? "block" : "none" }}
                      >
                        Saved. Your cover shoot is on its way.
                      </div>
                    </form>
                  </>
                )}

                {error && <div className="tryon-errors">{error}</div>}
              </div>
            </div>

            {/* ── Right: Lookbook ── */}
            <div className="lookbook-col">
              <h3 style={{ margin: "0 0 0.2rem" }}>Lookbook</h3>
              <p style={{ margin: "0", fontSize: "0.82rem", opacity: 0.7 }}>
                Choose a collection and commission your edit.
              </p>
              <div className="collection-tabs">
                {COLLECTION_ORDER.map((key) => (
                  <button
                    key={key}
                    className={`tab ${collection === key ? "is-active" : ""}`}
                    onClick={() => { setCollection(key); setSelectedStyle(null); }}
                    type="button"
                  >
                    {COLLECTION_LABELS[key]}
                  </button>
                ))}
              </div>
              <div className="style-grid">
                {activeStyles.map((style) => (
                  <button
                    key={style.id}
                    className={`style-card ${selectedStyle === style.id ? "is-selected" : ""}`}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setError("");
                    }}
                    type="button"
                  >
                    <strong>{style.name}</strong>
                    <span>{style.notes}</span>
                  </button>
                ))}
              </div>

              {/* ── Moodboard ── */}
              <div className="moodboard-section">
                <button
                  className="moodboard-toggle"
                  onClick={() => setMoodboardOpen((prev) => !prev)}
                  type="button"
                >
                  <h4>Moodboard</h4>
                  <span className="moodboard-badge">
                    {moodboard.length}/3 {moodboardOpen ? "▴" : "▾"}
                  </span>
                </button>

                {moodboardOpen && (
                  <>
                    <div className="moodboard-grid">
                      {MOODBOARD_SLOTS.map((slot) => {
                        const entry = moodboard.find(
                          (m) => m.category === slot.category
                        );
                        return (
                          <div
                            key={slot.category}
                            className={`moodboard-slot ${entry ? "is-filled" : ""}`}
                            onClick={() => {
                              if (!entry) {
                                moodboardInputRefs.current[slot.category]?.click();
                              }
                            }}
                          >
                            {entry ? (
                              <>
                                <img
                                  src={entry.previewUrl}
                                  alt={slot.label}
                                  draggable={false}
                                />
                                <button
                                  className="moodboard-slot-remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoodboardRemove(slot.category);
                                  }}
                                  type="button"
                                >
                                  ✕
                                </button>
                                <div className="moodboard-slot-tag">
                                  {slot.label}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="moodboard-slot-icon">
                                  {slot.icon}
                                </div>
                                <div className="moodboard-slot-label">
                                  {slot.label}
                                </div>
                              </>
                            )}
                            <input
                              ref={(el) => {
                                moodboardInputRefs.current[slot.category] = el;
                              }}
                              type="file"
                              accept="image/jpeg,image/png"
                              style={{
                                position: "absolute",
                                opacity: 0,
                                width: 0,
                                height: 0,
                                pointerEvents: "none",
                              }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f)
                                  handleMoodboardUpload(slot.category, f);
                                e.target.value = "";
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="moodboard-hint">
                      Optional. Upload references to influence colour, texture,
                      or shape.
                    </p>
                  </>
                )}
              </div>
            </div>

          </div>
        </section>

        <section className="features" id="features">
          <div className="section-head">
            <p className="eyebrow">Designed Like a Magazine</p>
            <h2>Brutalist Chic, Precision Workflow.</h2>
            <p className="lead">
              The most expensive-looking hair app on the internet. Clinical,
              deliberate, and editorial by design.
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Photorealism First</h3>
              <p>We prioritize fidelity over speed. Every strand matters.</p>
            </div>
            <div className="feature-card">
              <h3>Colorist Tools</h3>
              <p>Shift shade temperature and tone with a single prompt.</p>
            </div>
            <div className="feature-card">
              <h3>Stylist Edits</h3>
              <p>Direct the look: add volume, slick back, or soften edges.</p>
            </div>
            <div className="feature-card">
              <h3>Barber Protocol PDF</h3>
              <p>Guard lengths, scissor techniques, and product guidance.</p>
            </div>
          </div>
        </section>

        <section className="pricing" id="pricing">
          <div className="section-head">
            <p className="eyebrow">Crown Atelier</p>
            <h2>Pricing, By Issue.</h2>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <h3>Free Issue</h3>
              <p className="price">$0</p>
              <ul>
                <li>3 castings per day</li>
                <li>Standard lookbook</li>
                <li>Web resolution export</li>
              </ul>
            </div>
            <div className="price-card price-card-featured">
              <h3>Pro Atelier</h3>
              <p className="price">$9.99 / mo</p>
              <ul>
                <li>Unlimited castings</li>
                <li>The Archives</li>
                <li>4K exports + barber protocol</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="social-proof" id="social">
          <div className="section-head">
            <p className="eyebrow">Press Placeholder</p>
            <h2>"The sharpest hair AI on the market."</h2>
            <p className="lead">Fashion editors and stylists are waiting.</p>
          </div>
          <div className="logo-row">
            <span>Vogue</span>
            <span>Elle</span>
            <span>GQ</span>
            <span>Harper's Bazaar</span>
          </div>
        </section>

        <section className="faq" id="faq">
          <div className="section-head">
            <p className="eyebrow">FAQ</p>
            <h2>Details, Without Noise.</h2>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Does Hairbender store my photos?</h4>
              <p>
                Photos are processed to create your render and stored only if you
                request export.
              </p>
            </div>
            <div className="faq-item">
              <h4>What hair types are supported?</h4>
              <p>All textures: straight, wavy, curly, and coiled.</p>
            </div>
            <div className="faq-item">
              <h4>How accurate is the result?</h4>
              <p>
                We optimize for salon realism with precise texture mapping and
                lighting.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I send this to my barber?</h4>
              <p>
                Pro members receive a Barber Protocol PDF with guard lengths and
                notes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <h3>Hairbender</h3>
            <p>Editorial-grade hair transformations.</p>
          </div>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-cta">
            <p>Join the Atelier for early issues.</p>
            <button className="btn btn-ghost">Join the Atelier</button>
          </div>
        </div>
      </footer>
    </>
  );
}

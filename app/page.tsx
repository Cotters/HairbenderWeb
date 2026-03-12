"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const placeholderImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
      '<rect width="100%" height="100%" fill="#e8e8e8"/>' +
      '<path d="M0 480 L160 360 L280 440 L420 320 L620 480 L800 260 L800 600 L0 600 Z" fill="#d2d2d2"/>' +
      '<text x="50%" y="50%" font-family="Courier New" font-size="28" text-anchor="middle" fill="#555">Hairbender Preview</text>' +
      "</svg>"
  );

const styleCollections = {
  paris: [
    { id: "paris-01", name: "Chic Bob", notes: "Jaw-length, soft edge" },
    { id: "paris-02", name: "Glass Cut", notes: "Blunt, high shine" },
    { id: "paris-03", name: "Italian Lob", notes: "Mid-length, airy" },
    { id: "paris-04", name: "French Pixie", notes: "Micro fringe" },
  ],
  grunge: [
    { id: "grunge-01", name: "Shag Matrix", notes: "Layered, undone" },
    { id: "grunge-02", name: "Razor Wave", notes: "Textured depth" },
    { id: "grunge-03", name: "Soft Mullet", notes: "Short crown" },
    { id: "grunge-04", name: "Grit Fringe", notes: "Broken bangs" },
  ],
  executive: [
    { id: "exec-01", name: "The Boardroom", notes: "Clean taper" },
    { id: "exec-02", name: "Contour Fade", notes: "Sharp edges" },
    { id: "exec-03", name: "Classic Part", notes: "Defined line" },
    { id: "exec-04", name: "Executive Crop", notes: "Tidy texture" },
  ],
};

export default function Home() {
  const [collection, setCollection] =
    useState<keyof typeof styleCollections>("paris");
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
    }, 900);
    return () => clearInterval(timer);
  }, [processing]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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
    return Math.max(cropViewport / imageDims.width, cropViewport / imageDims.height);
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

  const startEnabled = Boolean(file && selectedStyle && !processing && step >= 4);

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
    setSelectedStyle(null);
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

  const handleCropConfirm = async () => {
    if (!rawFile || !imageDims) {
      setError("Upload a selfie to crop.");
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
    const srcX = Math.max(
      0,
      Math.min(imageDims.width - srcSize, -renderX / effectiveScale)
    );
    const srcY = Math.max(
      0,
      Math.min(imageDims.height - srcSize, -renderY / effectiveScale)
    );

    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcSize,
      srcSize,
      0,
      0,
      canvasSize,
      canvasSize
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });
    if (!blob) {
      setError("Unable to finalize crop. Please retry.");
      return;
    }

    const croppedFile = new File([blob], "hairbender-crop.jpg", {
      type: "image/jpeg",
    });
    setFile(croppedFile);
    setStep(3);
    setError("");
  };

  const handleStart = async () => {
    if (!file || !selectedStyle) {
      setError("Upload a selfie and select a style to proceed.");
      return;
    }
    setProcessing(true);
    setStatus("Submitting to the stylist...");
    setProgress(8);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("styleId", selectedStyle);
      formData.append("collection", collection);

      const response = await fetch("/api/tryon", {
        method: "POST",
        body: formData,
      });

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
      setStatus("Unable to reach the studio.");
      setError(
        err instanceof Error
          ? err.message
          : "xAI request failed. Please retry."
      );
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
            <a href="#tryon">Try-On</a>
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

          <div className="stepper">
            <div className={`step ${step === 1 ? "is-active" : ""}`}>1. Casting</div>
            <div className={`step ${step === 2 ? "is-active" : ""}`}>2. Crop</div>
            <div className={`step ${step === 3 ? "is-active" : ""}`}>3. Lookbook</div>
            <div className={`step ${step === 4 ? "is-active" : ""}`}>4. Processing</div>
            <div className={`step ${step === 5 ? "is-active" : ""}`}>5. Reveal</div>
          </div>

          <div className="tryon-grid">
            <div className="panel panel-upload">
              <h3>Casting</h3>
              <p className="panel-subtitle">
                Clean lighting, neutral expression, chin slightly up.
              </p>
              <div className="upload-box">
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                />
                <div className="upload-content">
                  <p>Drop a selfie or click to upload</p>
                  <span>JPG or PNG, max 10MB</span>
                </div>
              </div>
              <div className="validation-hints">
                <span>Face centered</span>
                <span>Even lighting</span>
                <span>No heavy filters</span>
              </div>
              <div className="upload-status">
                {rawFile ? "Casting accepted." : "Awaiting file."}
              </div>
            </div>

            <div className={`panel panel-crop ${step < 2 ? "is-disabled" : ""}`}>
              <h3>Crop</h3>
              <p className="panel-subtitle">
                Center your head and hair within the frame. Drag to reposition.
              </p>
              <div className="cropper">
                <div
                  className="cropper-viewport"
                  ref={cropContainerRef}
                  onMouseDown={handleCropStart}
                >
                  <img
                    ref={cropImageRef}
                    src={cropUrl}
                    alt="Crop preview"
                    onLoad={(event) => {
                      const target = event.currentTarget;
                      setImageDims({
                        width: target.naturalWidth,
                        height: target.naturalHeight,
                      });
                    }}
                    style={{
                      transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${effectiveScale})`,
                    }}
                    draggable={false}
                  />
                </div>
                <div className="cropper-controls">
                  <label htmlFor="cropZoom">Zoom</label>
                  <input
                    id="cropZoom"
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.01"
                    value={cropZoom}
                    onChange={(event) =>
                      setCropZoom(Number(event.target.value))
                    }
                  />
                  <div className="cropper-actions">
                    <button className="btn btn-primary" onClick={handleCropConfirm}>
                      Crop & Continue
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setCropOffset({ x: 0, y: 0 })}
                    >
                      Center
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`panel panel-lookbook ${step < 3 ? "is-disabled" : ""}`}>
              <h3>Lookbook</h3>
              <p className="panel-subtitle">
                Choose a collection and commission your edit.
              </p>
              <div className="collection-tabs">
                {(["paris", "grunge", "executive"] as const).map((key) => (
                  <button
                    key={key}
                    className={`tab ${collection === key ? "is-active" : ""}`}
                    onClick={() => setCollection(key)}
                    type="button"
                  >
                    {key === "paris"
                      ? "The Paris Collection"
                      : key === "grunge"
                      ? "The Grunge Issue"
                      : "The Executive"}
                  </button>
                ))}
              </div>
              <div className="style-grid">
                {activeStyles.map((style) => (
                  <button
                    key={style.id}
                    className={`style-card ${
                      selectedStyle === style.id ? "is-selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setStep(4);
                      setError("");
                    }}
                    type="button"
                  >
                    <strong>{style.name}</strong>
                    <span>{style.notes}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`panel panel-processing ${step < 4 ? "is-disabled" : ""}`}>
              <h3>Processing</h3>
              <p className="panel-subtitle">
                Your stylist is rendering. Typical time: 5-10 seconds.
              </p>
              <p className="panel-subtitle">
                Server requires <strong>XAI_API_KEY</strong> in the environment.
              </p>
              <div className="progress-card">
                <div className="progress-line" style={{ width: `${progress}%` }} />
                <div className="progress-steps">
                  <div className="progress-step">Casting verified</div>
                  <div className="progress-step">Texture mapped</div>
                  <div className="progress-step">Light sculpted</div>
                  <div className="progress-step">Editorial finish</div>
                </div>
              </div>
              <div className="processing-status">{status}</div>
              <div className="processing-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleStart}
                  disabled={!startEnabled}
                >
                  {processing ? "Rendering..." : "Start Processing"}
                </button>
                <button className="btn btn-ghost" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>

            <div className={`panel panel-reveal ${step < 5 ? "is-disabled" : ""}`}>
              <h3>Reveal</h3>
              <p className="panel-subtitle">Slide to compare the before and after.</p>
              <div
                className="reveal-frame"
                ref={revealFrameRef}
                onPointerDown={(e) => {
                  revealDragging.current = true;
                  updateRevealFromPointer(e.clientX);
                }}
              >
                <img src={previewUrl} alt="Before" />
                <img
                  src={resultUrl}
                  alt="After"
                  style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
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
              <div className="reveal-actions">
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
                <button className="btn btn-ghost">Share Polaroid</button>
              </div>
              <form
                className="email-capture"
                onSubmit={(event) => {
                  event.preventDefault();
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
                  <button className="btn btn-primary" type="submit">
                    Save
                  </button>
                </div>
                <p className="email-note">
                  We only email when your export is ready.
                </p>
                <div
                  className="email-success"
                  style={{ display: emailSaved ? "block" : "none" }}
                >
                  Saved. Your cover shoot is on its way.
                </div>
              </form>
            </div>
          </div>

          {error ? <div className="tryon-errors">{error}</div> : null}
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
              <p className="price">$5.99 / mo</p>
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

# Hairbender: The High-Fashion AI Stylist

Hairbender is a high-fidelity hair transformation platform utilising AI image gen to provide photorealistic, editorial-grade visualizations of new hairstyles using the user's uploaded image as reference. The application uses generative AI to process static, high-resolution portraits, providing users with a precise preview of salon-quality hairstyles.

## Core Features

### 1. The Casting (Upload)
Users submit a portrait.

### 2. The Lookbook (Curated Collections)
Styles are organized into themed editorial collections:
*   **The Paris Collection:** Chic, blunt bobs and sleek, high-gloss cuts.
*   **The Grunge Issue:** Heavily layered shags, mullets, and raw-edged textures.
*   **The Executive:** Polished boardroom tapers, sharp fades, and classic structured parts.

### 3. The Reveal (Generative Try-On)
The application generates a new hairstyle while maintaining pixel-perfect consistency of the user’s facial features, skin tone, and background. It utilizes an alignment algorithm to ensure the generated hair integrates naturally with the user's head shape and original framing.

### 4. The Barber Protocol (Technical Utility)
A generated "Tear Sheet" designed for professional hair stylists. This document translates the visual AI result into technical specifications, including recommended guard lengths, sectioning techniques, and product requirements.

## Design Philosophy
The platform employs a **Brutalist Chic** aesthetic:
*   **Typography:** High-contrast Serif headers (editorial) paired with Monospace data (technical).
*   **Layout:** Stark white and ink black color palette with sharp, 0px border-radius edges.
*   **Vibe:** A clinical yet artistic interface that mimics a high-end fashion magazine.

## Technical Stack
*   **Frontend:** Next.js (TypeScript) for the core web interface.
*   **Backend:** Node.js API routes communicating with a Python backend that sends images to an xAI (Grok-Imagine) model.
*   **ML/Processing:** Python script using OpenCV for facial landmark detection and post-generation alignment.

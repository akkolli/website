---
title: "Inspire Me"
date: 2026-07-03
draft: false
description: "A browser-based generative word stream for visual drift and focus."
tags: ["Web", "Canvas", "JavaScript", "Generative"]
status: "live"
weight: 40
aliases:
  - /apps/inspire-me/
links:
  - label: "Open"
    url: "https://akkolli.net/apps/inspire-me/"
toc: true
math: false
---

Inspire Me is a small browser app that displays a changing stream of words over a soft animated atmosphere. It is built as a static web app with JavaScript, Canvas, CSS typography controls, and a local word corpus.

{{< figure src="/images/projects/inspire-me/preview.png" width="1440" height="900" alt="Inspire Me showing a large word over a soft animated paper-like background." />}}

## What It Does

- Shows a fullscreen generative word stream.
- Modulates timing, typography, color, position, and background drift over time.
- Provides controls for tempo, timing rate, style variation, and visual depth.
- Runs entirely in the browser as static files.
- Supports direct hosting at `/apps/inspire-me/`.

## Technical Shape

The app is plain HTML, CSS, and JavaScript. The word stream uses a local text corpus, CSS custom properties for typography variation, and a Canvas layer for ambient motion and texture. The deployment runs as an independent nginx container on `pluto`.

## Status

Inspire Me is live as an experimental browser app. Current work is focused on interaction polish, responsive behavior, and making the visual state more immersive without adding framework complexity.

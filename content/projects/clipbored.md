---
title: "ClipBored"
date: 2026-07-01
draft: false
description: "A local-only macOS clipboard manager with a keyboard-first bottom panel."
tags: ["Swift", "AppKit", "macOS", "Clipboard", "SQLite"]
status: "open beta"
weight: 20
aliases:
  - /apps/clipbored/
links:
  - label: "GitHub"
    url: "https://github.com/akkolli/clipbored"
  - label: "Gitea"
    url: "https://code.akkolli.net/lepton/clipbored"
toc: true
math: false
---

ClipBored is a small native macOS clipboard manager. It captures local clipboard history and opens a keyboard-first responsive bottom panel for search, sorting, copy, paste, pinning, deletion, and organization.

{{< figure src="/images/projects/clipbored/panel.png" alt="ClipBored clipboard panel snapshot." />}}

## What It Does

- Runs as a dockless menu-bar utility by default.
- Opens with a global shortcut.
- Captures text, links, images, media, PDFs, files, and rich text.
- Supports search, sorting, pinning, collections, copy, paste, preview, and deletion.
- Keeps storage local and dependency-light.
- Uses SQLite persistence with bounded history and encrypted app-managed payloads.

## Technical Shape

ClipBored is built with Swift Package Manager, AppKit, Carbon hotkeys, SQLite, and system frameworks. It avoids network APIs and telemetry. Clipboard history is stored locally under Application Support, with privacy controls for ignored apps, content kinds, and sensitive-content exclusion.

The project is designed as a small native utility rather than a heavy Electron-style clipboard database.

## Status

ClipBored is in open beta. Current work focuses on interaction polish, keyboard navigation, persistence, privacy controls, and reliable local packaging.

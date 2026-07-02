---
title: "I Hate PDFs"
date: 2026-07-01
draft: false
description: "A tiny native macOS PDF reader for local reading, highlighting, commenting, and review."
tags: ["Swift", "SwiftUI", "PDFKit", "macOS"]
status: "open beta"
weight: 30
links:
  - label: "GitHub"
    url: "https://github.com/akkolli/ihatepdfs"
  - label: "Download"
    url: "https://github.com/akkolli/ihatepdfs/releases/latest"
  - label: "Privacy Policy"
    url: "/projects/ihatepdfs/privacy/"
toc: true
math: false
---

I Hate PDFs is a small native macOS PDF reader for local reading, highlighting, commenting, and review. It uses SwiftUI, AppKit, and PDFKit, keeps documents on your Mac, and avoids accounts, tracking, and cloud upload.

{{< figure src="/images/apps/ihatepdfs/default-reading.png" alt="I Hate PDFs default reading mode." />}}

## What It Does

- Opens local PDFs without accounts, analytics, tracking, or cloud upload.
- Supports highlighting, comments, replies, bookmarks, search, and sidebars.
- Writes standards-compatible annotations back into PDFs.
- Stays intentionally small by relying on system frameworks.
- Ships as a direct-download macOS app, with App Store packaging support.

## Technical Shape

The project is a Swift Package with a core PDF annotation target and a SwiftUI macOS app target. The app uses PDFKit for rendering and annotation behavior, AppKit bridges where needed, and strict release-size checks to keep the bundle small.

The design rule is simple: stay native, local, and small unless a feature clearly justifies its weight.

## Status

I Hate PDFs is in open beta and actively maintained. The current public release line focuses on fast local PDF review, standards-compatible annotations, and small distribution artifacts.

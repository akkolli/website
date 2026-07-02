---
title: "FeedMe"
date: 2026-07-01
draft: false
description: "A local-first native SwiftUI feed reader for macOS and iOS."
tags: ["Swift", "SwiftUI", "RSS", "macOS", "iOS"]
status: "open beta"
weight: 10
links: []
toc: true
math: false
---

FeedMe is a small native SwiftUI feed reader for macOS and iOS. It is local-first, account-free, and built around a shared Swift package for feed parsing, OPML import/export, refresh orchestration, and SQLite persistence.

{{< figure src="/images/apps/feedme/demo.png" alt="FeedMe running with a local demo library on iOS." />}}

## What It Does

- Reads RSS, Atom, and JSON Feed sources.
- Imports and exports OPML.
- Stores the feed library locally in SQLite.
- Tracks folders, unread/read state, starred items, refresh history, and retention cleanup.
- Shares one SwiftUI reader interface across macOS and iOS.
- Includes a real-feed validation CLI for release checks.

## Technical Shape

The app is split into a reusable feed core and a shared UI package. The core owns parsing, feed discovery, refresh behavior, OPML, fetching, and persistence. The UI layer handles the reader, feed organization, article rendering, search, and platform commands.

The release build is intentionally size-conscious: local package code is statically linked where practical, release symbols are stripped, and the verification script checks app size as part of the release gate.

## Status

FeedMe is in open beta. Current work is focused on release hardening, real-feed validation, and keeping the app small while preserving a useful local reader workflow.

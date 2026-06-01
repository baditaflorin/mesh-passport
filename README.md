# mesh-passport

[![pages](https://img.shields.io/badge/live-baditaflorin.github.io%2Fmesh-passport-fbbf24)](https://baditaflorin.github.io/mesh-passport/)
[![version](https://img.shields.io/badge/version-0.1.1-blue)](https://github.com/baditaflorin/mesh-passport/blob/main/package.json)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

> Collect a stamp for every person in the room — completionist passport book

**Live → https://baditaflorin.github.io/mesh-passport/**

**Source → https://github.com/baditaflorin/mesh-passport**

**Tip the dev (buy a coffee) → https://www.paypal.com/paypalme/florinbadita**

**Security audit (programmatic, headless, CPU-only) → [docs/security-audit.md](./docs/security-audit.md)** — re-run with `npm run audit:security`

---

![screenshot](docs/screenshot.png)

## What it is

A **rootless-computing** peer-to-peer browser app. No backend of its own beyond the self-hosted WebRTC stack listed below. State lives in a Yjs mesh shared by everyone in the same room.

A networking icebreaker: everyone in the room gets a passport. You and another person scan each other's QR to collect a stamp. Your passport is "complete" once you've met everyone present. A shared leaderboard ranks who's met the most people.

Read the principles → **https://baditaflorin.github.io/rootless-computing/principles.html**

## Quickstart

**Try it in 30 seconds:** open the live URL in two browser tabs. In one tab, expand "your passport QR"; copy its payload into the other tab's "paste a payload" box and hit **use**. The first tab's passport fills to 100% and both tabs' leaderboards update live.

In a real room: open the live URL on two devices in the same room (set in ⚙ settings, or scan the room QR), type your name, and scan each other's QR. Everything else is in-app.

For local hacking:

```bash
git clone https://github.com/baditaflorin/mesh-common
git clone https://github.com/baditaflorin/mesh-passport
cd mesh-passport
npm install
npm run dev
```

`mesh-common` must sit as a **sibling** directory because `package.json` references it via `file:../mesh-common`.

## Self-hosted infrastructure

| Repo                                              | Endpoint                               | Purpose                     |
| ------------------------------------------------- | -------------------------------------- | --------------------------- |
| https://github.com/baditaflorin/signaling-server  | `wss://turn.0docker.com/ws`            | y-webrtc signaling fan-out  |
| https://github.com/baditaflorin/turn-token-server | `https://turn.0docker.com/credentials` | HMAC TURN creds, 1-hour TTL |
| https://github.com/baditaflorin/coturn-hetzner    | `turn:turn.0docker.com:3479`           | TURN relay                  |

## Settings overrides

The settings drawer lets the user override signaling and TURN endpoints. localStorage keys:

- `mesh-passport:signalingUrl`
- `mesh-passport:turnTokenUrl`
- `mesh-passport:iceServers`
- `mesh-passport:room`

If endpoints are blank or unreachable, the app falls back to STUN-only.

## Version + commit on every screen

The bottom-right footer on every screen of the live app shows:

- `source` → this repo
- `tip ♥` → PayPal
- `vX.Y.Z · <short-sha>` — version from `package.json` plus the build-time git commit

## Build & deploy

GitHub Pages serves the committed `docs/` directory on the `main` branch. There is no GitHub Actions build workflow; local Husky-style hooks gate formatting / typecheck / smoke build before each push.

```bash
npm run smoke                                    # build + sanity-check docs/
bash ../mesh-common/scripts/screenshot-app.sh    # regenerate docs/screenshot.png
```

## Privacy

See `docs/privacy.md` for the threat model — what other peers in the mesh see, what the self-hosted infra sees, what stays local.

## License

MIT — see `LICENSE`.

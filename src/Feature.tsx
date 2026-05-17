import { useEffect, useState } from "react";
import {
  MeshNameInput,
  QRExchange,
  makeScanPayload,
  type MeshConfig,
  type YRoom,
  type Edge,
} from "@baditaflorin/mesh-common";

type Props = { room: YRoom | null; config: MeshConfig };
const NAME_KEY = (p: string) => `${p}:displayName`;

export function Feature({ room, config }: Props) {
  if (!room) {
    return (
      <div className="viral-screen">
        <h1>passport</h1>
        <p className="viral-status">Connecting…</p>
      </div>
    );
  }
  return <Body room={room} config={config} />;
}

function Body({ room, config }: { room: YRoom; config: MeshConfig }) {
  const [name, setName] = useState(
    () => localStorage.getItem(NAME_KEY(config.storagePrefix)) ?? "",
  );
  const [, rerender] = useState(0);

  useEffect(() => {
    if (name) localStorage.setItem(NAME_KEY(config.storagePrefix), name);
  }, [name, config.storagePrefix]);

  useEffect(() => {
    const stamps = room.doc.getArray<Edge>("stamps");
    const names = room.doc.getMap<string>("names");
    const cb = () => rerender((n) => n + 1);
    stamps.observe(cb);
    names.observe(cb);
    return () => {
      stamps.unobserve(cb);
      names.unobserve(cb);
    };
  }, [room]);

  const stamps = room.doc.getArray<Edge>("stamps");
  const names = room.doc.getMap<string>("names");

  useEffect(() => {
    if (name.trim()) names.set(room.peerId, name.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, room.peerId]);

  const stampList = stamps.toArray();

  const addStamp = (otherId: string, otherName?: string) => {
    if (!name.trim() || otherId === room.peerId) return;
    if (stampList.some((s) => s.from === room.peerId && s.to === otherId)) return;
    if (otherName) names.set(otherId, otherName);
    stamps.push([{ from: room.peerId, to: otherId, ts: Date.now() }]);
  };

  const myStamps = stampList.filter((s) => s.from === room.peerId);
  const knownPeers = new Set<string>();
  names.forEach((_v, k) => knownPeers.add(k));
  // also include peers we've stamped
  stampList.forEach((s) => {
    knownPeers.add(s.from);
    knownPeers.add(s.to);
  });
  const otherPeers = Array.from(knownPeers).filter((p) => p !== room.peerId);
  const pct = otherPeers.length > 0 ? Math.round((myStamps.length / otherPeers.length) * 100) : 0;

  const myPayload = makeScanPayload(room.roomId, room.peerId, name.trim() || "anon");

  // leaderboard: who has stamped the most
  const counts = new Map<string, number>();
  for (const s of stampList) counts.set(s.from, (counts.get(s.from) ?? 0) + 1);

  return (
    <div className="viral-screen">
      <header>
        <h1>passport</h1>
        <p className="viral-status">
          you've stamped {myStamps.length}/{otherPeers.length} ({pct}%) · {room.peerCount + 1}{" "}
          present
        </p>
      </header>

      <MeshNameInput
        className="viral-name"
        value={name}
        onChange={setName}
        placeholder="your name"
        maxLength={48}
      />

      <QRExchange
        myPayload={myPayload}
        showLabel="your passport QR"
        scanLabel="scan to collect their stamp"
        onScan={(parsed) => addStamp(parsed.peerId, parsed.extra ?? undefined)}
      />

      <section>
        <h2 className="viral-section-title">your collected stamps</h2>
        {myStamps.length === 0 ? (
          <p className="viral-empty">no stamps yet</p>
        ) : (
          <ul className="pp-grid">
            {myStamps.map((s) => (
              <li key={s.to}>
                <span className="pp-stamp">✓</span>
                <strong>{names.get(s.to) ?? s.to.slice(0, 6)}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pct === 100 && otherPeers.length > 0 && (
        <div className="pp-complete">🎉 PASSPORT COMPLETE — you've met everyone!</div>
      )}

      <section>
        <h2 className="viral-section-title">completionist leaderboard</h2>
        {counts.size === 0 ? (
          <p className="viral-empty">none yet</p>
        ) : (
          <ol className="pp-board">
            {Array.from(counts.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([id, n]) => (
                <li key={id} className={id === room.peerId ? "is-me" : ""}>
                  <strong>{names.get(id) ?? id.slice(0, 6)}</strong>
                  <span>{n} stamps</span>
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}

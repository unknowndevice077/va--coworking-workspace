"use client";

import type { DesignElement } from "@/lib/canvas-doc/types";
import { gIcons, type GIconName } from "@/lib/canvas-doc/icons";
import styles from "./canvas-editor.module.css";

const SWATCHES = ["#131b26", "#2a496f", "#ba904c", "#1f4b36", "#5c1f2e", "#163a4d", "#8a3a44", "#ffffff", "#5c6b63", "#000000"];
const ICON_CHOICES = Object.keys(gIcons) as GIconName[];

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className={styles.swatchRow}>
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Use color ${c}`}
            className={`${styles.swatch} ${value.toLowerCase() === c ? styles.swatchOn : ""}`}
            style={{ background: c, border: c === "#ffffff" ? "1px solid var(--border)" : undefined }}
            onClick={() => onChange(c)}
          />
        ))}
        <label className={styles.customSwatch} style={{ background: value }}>
          <input type="color" value={/^#/.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

export function PropertiesPanel({
  el,
  onChange,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
}: {
  el: DesignElement | undefined;
  onChange: (patch: Partial<DesignElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}) {
  if (!el) {
    return (
      <div className={styles.emptyPanel}>
        <div className={styles.emptyPanelIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="m7 15 3.5-4.5L13 14l2-2.5L20 15" />
          </svg>
        </div>
        <div className={styles.hint}>Click an element on the canvas to edit its style, or add a new one from the left.</div>
      </div>
    );
  }

  const typeLabel = el.type === "text" ? "Text" : el.type === "shape" ? "Shape" : el.type === "icon" ? "Icon" : "Image";

  return (
    <div className={styles.propsCol}>
      <div className={styles.panelHeader}>
        <span className={styles.panelHeaderLabel}>{typeLabel}</span>
        <div className={styles.panelHeaderActions}>
          <button type="button" className={styles.iconBtn} onClick={onDuplicate} aria-label="Duplicate">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M4 16V6a2 2 0 0 1 2-2h10" />
            </svg>
          </button>
          <button type="button" className={styles.iconBtn} onClick={onDelete} aria-label="Delete" style={{ color: "var(--bad)" }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
            </svg>
          </button>
        </div>
      </div>

      {el.type === "text" && (
        <>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Text color</div>
            <ColorField value={el.color} onChange={(color) => onChange({ color })} />
          </div>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Size</div>
            <input
              type="number"
              className={styles.numInput}
              value={el.fontSize}
              min={8}
              max={200}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) || el.fontSize })}
            />
          </div>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Weight</div>
            <div className={styles.segRow}>
              {[400, 600, 700].map((w) => (
                <button
                  key={w}
                  type="button"
                  className={`${styles.segBtn} ${el.fontWeight === w ? styles.segOn : ""}`}
                  onClick={() => onChange({ fontWeight: w as 400 | 600 | 700 })}
                >
                  {w === 400 ? "Regular" : w === 600 ? "Medium" : "Bold"}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Align</div>
            <div className={styles.segRow}>
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`${styles.segBtn} ${el.align === a ? styles.segOn : ""}`}
                  onClick={() => onChange({ align: a })}
                >
                  {a[0].toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Font</div>
            <div className={styles.segRow}>
              {(["display", "body", "serif"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`${styles.segBtn} ${el.fontFamily === f ? styles.segOn : ""}`}
                  onClick={() => onChange({ fontFamily: f })}
                >
                  {f === "display" ? "Headline" : f === "body" ? "Body" : "Serif"}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {el.type === "shape" && (
        <>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Fill color</div>
            <ColorField value={el.fill} onChange={(fill) => onChange({ fill })} />
          </div>
          {el.shape === "rect" && (
            <div className={styles.propGroup}>
              <div className={styles.propLabel}>Corner radius</div>
              <input
                type="range"
                min={0}
                max={100}
                value={el.radius}
                onChange={(e) => onChange({ radius: Number(e.target.value) })}
                className={styles.rangeInput}
              />
            </div>
          )}
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Opacity</div>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(el.opacity * 100)}
              onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
              className={styles.rangeInput}
            />
          </div>
        </>
      )}

      {el.type === "icon" && (
        <>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Icon color</div>
            <ColorField value={el.color} onChange={(color) => onChange({ color })} />
          </div>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Badge background</div>
            <div className={styles.swatchRow}>
              <button type="button" className={styles.chipBtn} onClick={() => onChange({ background: undefined })}>
                None
              </button>
              {["#131b26", "#2a496f", "#1f4b36"].map((c) => (
                <button key={c} type="button" className={styles.swatch} style={{ background: c }} onClick={() => onChange({ background: c })} />
              ))}
            </div>
          </div>
          <div className={styles.propGroup}>
            <div className={styles.propLabel}>Icon</div>
            <div className={styles.iconGrid}>
              {ICON_CHOICES.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`${styles.iconChoice} ${el.icon === name ? styles.iconChoiceOn : ""}`}
                  onClick={() => onChange({ icon: name })}
                  aria-label={name}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d={gIcons[name]} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {el.type === "image" && (
        <div className={styles.propGroup}>
          <div className={styles.propLabel}>Corner radius</div>
          <input
            type="range"
            min={0}
            max={100}
            value={el.radius}
            onChange={(e) => onChange({ radius: Number(e.target.value) })}
            className={styles.rangeInput}
          />
        </div>
      )}

      <div className={styles.propGroup}>
        <div className={styles.propLabel}>Layer</div>
        <div className={styles.segRow}>
          <button type="button" className={styles.segBtn} onClick={onBringForward}>Forward</button>
          <button type="button" className={styles.segBtn} onClick={onSendBackward}>Backward</button>
        </div>
      </div>
    </div>
  );
}

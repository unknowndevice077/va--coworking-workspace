import Link from "next/link";
import { isAiConfigured } from "@/lib/anthropic";
import { isImageGenConfigured } from "@/lib/image-gen";
import { AssistForm } from "./AssistForm";
import shell from "@/components/AppShell.module.css";
import ui from "@/components/ui.module.css";
import styles from "../design-engine.module.css";

// Design Assist: Claude reasons through a structured brief (layout, copy,
// color direction — never the image itself), then an image-gen provider
// renders it, and the result lands as a new Design you can keep editing
// in the normal canvas editor. Two independent providers, two independent
// on/off switches — see src/lib/anthropic.ts and src/lib/image-gen.ts.
export default async function DesignAssistPage() {
  const aiReady = isAiConfigured();
  const imageGenReady = isImageGenConfigured();

  return (
    <div>
      <div className={shell.topline}>
        <h1 className={shell.h1}>
          Design Assist
          <span className={shell.h1sub}>Describe what you need — Claude writes the creative brief, AI renders the image, you land in the editor.</span>
        </h1>
        <Link href="/design-engine" className={shell.btnGhost}>Browse templates →</Link>
      </div>

      {!aiReady ? (
        <div className={ui.panel} style={{ borderColor: "var(--accent)" }}>
          <div className={ui.pt} style={{ marginBottom: 6 }}>Not connected yet</div>
          <p className={ui.meta} style={{ lineHeight: 1.6 }}>
            Design Assist needs an ANTHROPIC_API_KEY to write the creative brief, and an OPENAI_API_KEY to render the
            image. Add ANTHROPIC_API_KEY first to unlock this page — image rendering can follow later.
          </p>
        </div>
      ) : (
        <>
          {!imageGenReady && (
            <div className={ui.panel} style={{ borderColor: "var(--accent)", marginBottom: 20 }}>
              <div className={ui.pt} style={{ marginBottom: 6 }}>Showcase mode</div>
              <p className={ui.meta} style={{ lineHeight: 1.6 }}>
                Claude is connected, so the brief step below is fully real — but no image-gen provider is connected
                yet, so it&apos;ll show you the structured brief instead of a finished design. Add an
                OPENAI_API_KEY to unlock the full flow.
              </p>
            </div>
          )}
          <div className={styles.promptPanel}>
            <AssistForm imageGenReady={imageGenReady} />
          </div>
        </>
      )}
    </div>
  );
}

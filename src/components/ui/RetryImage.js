"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// next/image does not retry. When an optimize request fails — and ours do,
// because the optimizer re-fetches multi-megabyte PNGs over the network before
// transcoding them — the slot stays empty until the page is reloaded.
//
// This retries a failed load a few times with backoff. The cache-busting param
// is deliberate: without it the browser and the optimizer both hand back the
// same failure instead of genuinely trying again. After the last attempt it
// calls onExhausted so the caller can show its own placeholder.
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 600;

export default function RetryImage({ src, alt, onExhausted, ...rest }) {
  const [attempt, setAttempt] = useState(0);
  const timer = useRef(null);

  // A new src is a fresh subject, not a continuation of the old one's retries.
  useEffect(() => {
    setAttempt(0);
  }, [src]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!src) return null;

  const retrySrc =
    attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`;

  return (
    <Image
      // Remounting is what makes the browser re-request rather than reuse the
      // failed entry.
      key={attempt}
      src={retrySrc}
      alt={alt}
      onError={() => {
        if (attempt + 1 >= MAX_ATTEMPTS) {
          onExhausted?.();
          return;
        }
        const delay = BASE_DELAY_MS * 2 ** attempt;
        timer.current = setTimeout(() => setAttempt((a) => a + 1), delay);
      }}
      {...rest}
    />
  );
}

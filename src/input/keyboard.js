export function normalizeKey(rawKey) {
  if (!rawKey) return "";
  if (rawKey.length === 1) return rawKey.toLowerCase();
  return "";
}

export function createKeyboardInput({
  target = window,
  onKey
}) {
  function handleKeydown(event) {
    if (event.repeat) return;
    const key = normalizeKey(event.key);
    if (!key) return;
    onKey({
      key,
      timestampMs: performance.now()
    });
  }

  target.addEventListener("keydown", handleKeydown);

  return {
    destroy() {
      target.removeEventListener("keydown", handleKeydown);
    }
  };
}

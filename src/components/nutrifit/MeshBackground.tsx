"use client";

/**
 * Fluid mesh-gradient backdrop: cyan / teal / emerald blurs floating
 * over a slate-50 canvas with mix-blend-multiply.
 */
export function MeshBackground() {
  return (
    <div className="nf-mesh" aria-hidden="true">
      <div className="nf-blob nf-blob-1" />
      <div className="nf-blob nf-blob-2" />
      <div className="nf-blob nf-blob-3" />
      <div className="nf-blob nf-blob-4" />
    </div>
  );
}

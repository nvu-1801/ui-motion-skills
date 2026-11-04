import { ExtrudeGeometry, Shape } from "three";

/** Rounded rectangle centred on the origin, in the XY plane. */
export function roundedRectShape(width: number, height: number, radius: number): Shape {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);
  const shape = new Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w, h - r);
  shape.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-w + r, h);
  shape.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w, -h + r);
  shape.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/**
 * A bevelled slab: the device body. Centred so its front face sits at +depth/2.
 * The caller owns disposal.
 */
export function roundedBoxGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
  bevel = 0.012,
): ExtrudeGeometry {
  const geometry = new ExtrudeGeometry(roundedRectShape(width, height, radius), {
    depth,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geometry.center();
  return geometry;
}

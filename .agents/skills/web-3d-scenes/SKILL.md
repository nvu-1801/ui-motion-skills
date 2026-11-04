---
name: web-3d-scenes
description: Implement WebGL or React Three Fiber scenes for web UI, including scroll-driven camera movement and static fallbacks.
---

# web-3d-scenes

- Choose a scene only if depth or camera movement clarifies the subject. Give the camera one writer and interpolate position and target from ordered keyframes.
- Keep text and CTA in semantic HTML. Reserve the stage size and load the renderer separately. Confirm version compatibility from the target lockfile.
- Cap device pixel ratio and test frame time on mobile. Dispose GPU resources on teardown. Keep a poster visible when WebGL is unavailable or reduced motion is enabled.
- For externally authored GLB, verify scale, orientation, texture weight and asset provenance before integration.

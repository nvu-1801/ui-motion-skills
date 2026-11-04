export type {
  CameraKeyframe,
  CameraPreset,
  QualitySettings,
  QualityTier,
  SampledCamera,
  Story,
  Vec3,
} from "./types";
export type { StoryChapter as StoryChapterData } from "./types";

export { ScrollScene, DEFAULT_QUALITY } from "./ScrollScene";
export type { ScrollSceneProps } from "./ScrollScene";
export { SceneCanvas } from "./SceneCanvas";
export type { SceneCanvasProps } from "./SceneCanvas";
export { CameraRig } from "./CameraRig";
export type { CameraRigProps } from "./CameraRig";
export { DeviceScreen } from "./DeviceScreen";
export type { DeviceScreenProps, ScreenDraw } from "./DeviceScreen";
export { LayerStack } from "./LayerStack";
export type { LayerStackProps } from "./LayerStack";
export { StoryChapter } from "./StoryChapter";
export type { StoryChapterProps } from "./StoryChapter";
export { MotionPreferencesProvider, useReducedMotion, useSystemReducedMotion } from "./MotionPreferences";
export { SceneFallback } from "./SceneFallback";
export type { SceneFallbackProps } from "./SceneFallback";
export { DebugHud } from "./DebugHud";

export { sampleCamera, resolveCameraPosition, validatePreset } from "./camera";
export { getSnapshot, installDebugApi, subscribe } from "./registry";
export type { KitSnapshot } from "./registry";
export { useSceneControls } from "./scene-context";
export type { SceneControls } from "./scene-context";

export { travelPreset } from "./presets/travel";

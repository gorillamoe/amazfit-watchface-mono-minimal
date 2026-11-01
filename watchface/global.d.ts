interface WatchFacePageOptions {
  init?(): void;
  build(): void;
  onDestroy?(): void;
}

declare function WatchFace(options: WatchFacePageOptions): void;

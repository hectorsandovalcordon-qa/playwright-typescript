import { Locator } from "@playwright/test";

/**
 * Opciones para screenshots
 */
export interface ScreenshotConfig {
  quality?: number;
  fullPage?: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  animations?: 'disabled' | 'allow';
  caret?: 'hide' | 'initial';
  scale?: 'css' | 'device';
  mask?: Locator[];
  threshold?: number;
  thresholdType?: 'pixel' | 'percent';
}
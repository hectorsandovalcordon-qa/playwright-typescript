import { ScreenshotType } from "@core/enums/ScreenshotType";

/**
 * Información de un screenshot tomado
 */
export interface ScreenshotInfo {
  path: string;
  name: string;
  type: ScreenshotType;
  timestamp: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  testName?: string;
  stepNumber?: number;
  url?: string;
}
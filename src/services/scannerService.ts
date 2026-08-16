import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { BARCODE_FORMATS } from "@/core/constants";
import { ScannerError } from "@/core/errors";
import type { IScannerService } from "@/core/interfaces";

const FORMAT_MAP: Record<string, BarcodeFormat> = {
  EAN_13: BarcodeFormat.EAN_13,
  EAN_8: BarcodeFormat.EAN_8,
  UPC_A: BarcodeFormat.UPC_A,
  UPC_E: BarcodeFormat.UPC_E,
  CODE_128: BarcodeFormat.CODE_128,
  ITF: BarcodeFormat.ITF,
  QR_CODE: BarcodeFormat.QR_CODE,
};

function buildHints(): Map<DecodeHintType, unknown> {
  const formats = BARCODE_FORMATS.map((f) => FORMAT_MAP[f]).filter(
    (f): f is BarcodeFormat => Boolean(f)
  );
  const hints = new Map<DecodeHintType, unknown>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return hints;
}

interface TorchCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface TorchSettings extends MediaTrackSettings {
  torch?: boolean;
}

export class ScannerService implements IScannerService {
  private reader: BrowserMultiFormatReader | null = null;
  private controls: IScannerControls | null = null;
  private videoTrack: MediaStreamTrack | null = null;

  async start(
    containerId: string,
    onDetected: (barcode: string) => void
  ): Promise<void> {
    if (this.reader) await this.stop();

    const reader = new BrowserMultiFormatReader(buildHints());
    try {
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        containerId,
        (result) => {
          if (result) onDetected(result.getText().trim());
        }
      );
      this.reader = reader;
      this.controls = controls;
      const video = document.getElementById(containerId) as
        | HTMLVideoElement
        | null;
      this.videoTrack =
        (video?.srcObject as MediaStream | null)?.getVideoTracks()[0] ?? null;
    } catch {
      await this.stop();
      throw new ScannerError(
        "Could not start the camera. Make sure camera access is allowed and the page is served over HTTPS."
      );
    }
  }

  async stop(): Promise<void> {
    const controls = this.controls;
    this.reader = null;
    this.controls = null;
    this.videoTrack = null;
    if (!controls) return;
    try {
      controls.stop();
    } catch {
      // ignore stop errors
    }
  }

  isRunning(): boolean {
    return this.reader !== null;
  }

  async hasTorch(): Promise<boolean> {
    const track = this.videoTrack;
    if (!track) return false;
    try {
      return (track.getCapabilities() as TorchCapabilities).torch === true;
    } catch {
      return false;
    }
  }

  async toggleTorch(): Promise<boolean> {
    const track = this.videoTrack;
    if (!track) return false;
    try {
      const current = (track.getSettings() as TorchSettings).torch ?? false;
      await track.applyConstraints({
        advanced: [{ torch: !current }],
      } as unknown as MediaTrackConstraints);
      return !current;
    } catch {
      return false;
    }
  }

  async scanFile(file: File): Promise<string> {
    await this.stop();
    const reader = new BrowserMultiFormatReader(buildHints());
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load image"));
      });
      const result = await reader.decodeFromImageElement(img);
      return result.getText().trim();
    } catch {
      throw new ScannerError("No barcode found in that image.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

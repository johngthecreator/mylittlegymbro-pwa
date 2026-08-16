import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  Html5QrcodeScannerState,
} from "html5-qrcode";
import { BARCODE_FORMATS } from "@/core/constants";
import { ScannerError } from "@/core/errors";
import type { IScannerService } from "@/core/interfaces";

const FILE_SCAN_CONTAINER_ID = "scanner-file-container";

export class ScannerService implements IScannerService {
  private instance: Html5Qrcode | null = null;

  async start(
    containerId: string,
    onDetected: (barcode: string) => void
  ): Promise<void> {
    if (this.instance && this.isRunning()) {
      await this.stop();
    }

    this.instance = this.createInstance(containerId);

    try {
      await this.instance.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (vw, vh) => ({
            width: Math.min(vw * 0.8, 480),
            height: Math.min(vh * 0.3, 180),
          }),
        },
        (decodedText) => {
          onDetected(decodedText.trim());
        },
        () => {}
      );
    } catch {
      this.instance = null;
      throw new ScannerError(
        "Could not start the camera. Make sure camera access is allowed and the page is served over HTTPS."
      );
    }
  }

  async stop(): Promise<void> {
    if (!this.instance) return;
    try {
      const state = this.instance.getState();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await this.instance.stop();
        this.instance.clear();
      }
    } catch {
      // ignore stop errors
    } finally {
      this.instance = null;
    }
  }

  isRunning(): boolean {
    if (!this.instance) return false;
    const state = this.instance.getState();
    return (
      state === Html5QrcodeScannerState.SCANNING ||
      state === Html5QrcodeScannerState.PAUSED
    );
  }

  async hasTorch(): Promise<boolean> {
    if (!this.instance) return false;
    try {
      return this.instance
        .getRunningTrackCameraCapabilities()
        .torchFeature()
        .isSupported();
    } catch {
      return false;
    }
  }

  async toggleTorch(): Promise<boolean> {
    if (!this.instance) return false;
    try {
      const torch = this.instance
        .getRunningTrackCameraCapabilities()
        .torchFeature();
      const next = !torch.value();
      await torch.apply(next);
      return next;
    } catch {
      return false;
    }
  }

  async scanFile(file: File): Promise<string> {
    if (this.isRunning()) {
      await this.stop();
    }
    if (!this.instance) {
      this.instance = this.createInstance(this.ensureFileScanContainer());
    }
    try {
      const text = await this.instance.scanFile(file, false);
      this.instance.clear();
      return text.trim();
    } catch {
      throw new ScannerError("No barcode found in that image.");
    }
  }

  private createInstance(containerId: string): Html5Qrcode {
    const formatsToSupport = BARCODE_FORMATS.map(
      (format) => Html5QrcodeSupportedFormats[format]
    );
    return new Html5Qrcode(containerId, { formatsToSupport, verbose: false });
  }

  private ensureFileScanContainer(): string {
    let element = document.getElementById(FILE_SCAN_CONTAINER_ID);
    if (!element) {
      element = document.createElement("div");
      element.id = FILE_SCAN_CONTAINER_ID;
      element.style.display = "none";
      document.body.appendChild(element);
    }
    return FILE_SCAN_CONTAINER_ID;
  }
}

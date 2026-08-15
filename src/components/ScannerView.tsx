import type { ReactElement } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Zap, ZapOff } from "lucide-react";
import { ScannerService } from "@/services/scannerService";

export interface ScannerViewHandle {
  start(): Promise<void>;
  stop(): Promise<void>;
  scanFile(file: File): Promise<string>;
}

export interface ScannerViewProps {
  onDetected: (barcode: string) => void;
}

export const ScannerView = forwardRef<ScannerViewHandle, ScannerViewProps>(
  function ScannerView({ onDetected }, ref): ReactElement {
    const containerId = useId().replace(/:/g, "");
    const scanner = useMemo(() => new ScannerService(), []);
    const [running, setRunning] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);

    const handleDetected = useCallback(
      (barcode: string) => {
        onDetected(barcode);
        setRunning(false);
        setTorchOn(false);
        void scanner.stop();
      },
      [onDetected, scanner],
    );

    useImperativeHandle(
      ref,
      () => ({
        start: async () => {
          await scanner.start(containerId, handleDetected);
          setRunning(true);
          setTorchOn(false);
          setHasTorch(await scanner.hasTorch());
        },
        stop: async () => {
          await scanner.stop();
          setRunning(false);
          setTorchOn(false);
        },
        scanFile: async (file: File) => scanner.scanFile(file),
      }),
      [scanner, containerId, handleDetected],
    );

    useEffect(() => {
      return () => {
        void scanner.stop();
      };
    }, [scanner]);

    const handleToggleTorch = async (): Promise<void> => {
      setTorchOn(await scanner.toggleTorch());
    };

    return (
      <div className="scanner-viewfinder">
        <div id={containerId} className="h-full w-full" />

        {running && (
          <>
            <div className="scan-line" />
            <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center">
              <span className="rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur">
                Point at a barcode
              </span>
            </div>
            {hasTorch && (
              <button
                type="button"
                onClick={() => void handleToggleTorch()}
                aria-label={torchOn ? "Turn torch off" : "Turn torch on"}
                className="absolute bottom-24 right-6 z-10 flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
              >
                {torchOn ? <ZapOff /> : <Zap />}
              </button>
            )}
          </>
        )}
      </div>
    );
  },
);

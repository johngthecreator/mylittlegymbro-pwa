import { AskFoodChat } from "@/components/AskFoodChat";

export default function AskPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4">
      <div className="flex h-[calc(100dvh_-_5rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] flex-col">
        <AskFoodChat />
      </div>
    </div>
  );
}

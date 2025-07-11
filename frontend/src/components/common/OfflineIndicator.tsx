import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  isOnline: boolean;
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  className,
}) => {
  if (isOnline) {
    return null;
  }

  return (
    <Alert className={cn("border-amber-200 bg-amber-50 mb-4", className)}>
      <WifiOff className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        You're currently offline. Data will be saved locally and synced when
        connection is restored.
      </AlertDescription>
    </Alert>
  );
};

export const ConnectionStatus: React.FC<{ isOnline: boolean }> = ({
  isOnline,
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-emerald-600" />
          <span className="text-emerald-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-amber-600" />
          <span className="text-amber-600">Offline</span>
        </>
      )}
    </div>
  );
};

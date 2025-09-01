"use client";

import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface RealtimeIndicatorProps {
  lastUpdate: Date | null;
  isConnected?: boolean;
}

export function RealtimeIndicator({
  lastUpdate,
  isConnected = true,
}: RealtimeIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor(
        (now.getTime() - lastUpdate.getTime()) / 1000
      );

      if (diffInSeconds < 60) {
        setTimeAgo("hace unos segundos");
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`hace ${minutes} min`);
      } else {
        const hours = Math.floor(diffInSeconds / 3600);
        setTimeAgo(`hace ${hours}h`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="hidden md:flex items-center space-x-2 text-sm text-white">
      {isConnected ? (
        <Wifi className="w-4 h-4 text-green-400" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-500" />
      )}
      <Badge variant="outline" className="text-xs border-green-400 text-white">
        {isConnected ? "En vivo" : "Desconectado"}
      </Badge>
      {lastUpdate && <span className="text-xs text-gray-300">{timeAgo}</span>}
    </div>
  );
}

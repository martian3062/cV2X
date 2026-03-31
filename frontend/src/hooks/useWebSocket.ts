import { useState, useEffect, useRef } from 'react';

export interface TelemetryData {
  status: string;
  metrics: {
    fps: number;
    latency_ms: number;
    miou: number;
  };
  overlay?: string; // Legacy field
  sensor_data?: {
    camera_front: string;
    ego_pose: {
      translation: [number, number, number];
      rotation: [number, number, number];
    };
    detections?: Array<{
      label: string;
      confidence: number;
      distance: number;
    }>;
  };
}

export const useWebSocket = (url: string) => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log('Connected to Perception WebSocket');
    };

    socket.onmessage = (event) => {
      try {
        const receivedData: TelemetryData = JSON.parse(event.data);
        setData(receivedData);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from Perception WebSocket');
    };

    return () => {
      socket.close();
    };
  }, [url]);

  return { data, isConnected };
};

import React, { createContext, useMemo, useContext, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(
    () => io(process.env.REACT_APP_BASE_URL, { transports: ["websocket"] }),
    []
  );

  useEffect(() => {
    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    // Cleanup when component unmounts
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{props.children}</SocketContext.Provider>;
};

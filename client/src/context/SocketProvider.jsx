import React, { createContext, useMemo, useContext, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const socket = useMemo(
    () =>
      io(window?.location?.hostname || process.env.REACT_APP_BASE_URL, {
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionAttempts: 10,
        transports: ["websocket"],
        agent: false,
        upgrade: false,
        rejectUnauthorized: false,
      }),
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

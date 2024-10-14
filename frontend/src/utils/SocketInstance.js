import { io } from "socket.io-client";

const SOCKET_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}`;

const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export default socket;
import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sun,
  Moon,
  MessageSquare,
  Plus,
  Menu,
  X,
  LogOutIcon,
} from "lucide-react";
import { useDispatch } from "react-redux";
import socket from "../utils/SocketInstance";
import { setIsAuthenticated } from "../redux/slices/authSlice";

function groupMessagesByDate(messages) {
  const groups = {};
  messages.forEach((message) => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  return Object.entries(groups);
}

function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export default function ChatWindow() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [groupedMessages, setGroupedMessages] = useState();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);

    // Load sessions from local storage
    const storedSessions = localStorage.getItem("chatSessions");
    if (storedSessions) {
      const parsedSessions = JSON.parse(storedSessions).map((session) => ({
        ...session,
        messages: session.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setSessions(parsedSessions);
      setCurrentSessionId(parsedSessions[0]?.id || null);
    } else {
      // Create a default session if none exist
      const defaultSession = {
        id: "1",
        name: "New Chat",
        messages: [],
      };
      setSessions([defaultSession]);
      setCurrentSessionId("1");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if(sessions.length > 0)
        localStorage.setItem("chatSessions", JSON.stringify(sessions));

    }, [sessions]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentSessionId) {
      const newMsg = {
        id: Date.now(),
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
        sessionId: currentSessionId,
      };
      socket.emit("chat message", newMsg);
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, newMsg] }
            : session
        )
      );
      setNewMessage("");
      inputRef.current.focus();
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      name: `New Chat ${sessions.length + 1}`,
      messages: [],
    };
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const switchSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const session = sessions.find((session) => session.id === currentSessionId);
    setCurrentSession(session);
    setGroupedMessages(session ? groupMessagesByDate(session.messages) : []);
  }, [sessions, currentSessionId]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("chat message", (receivedMessage) => {
      receivedMessage.timestamp = new Date(receivedMessage?.timestamp);
      const receivedSessionId = receivedMessage.sessionId;
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === receivedSessionId
            ? { ...session, messages: [...session.messages, receivedMessage] }
            : session
        )
      );
    });

    return () => {
      socket.off("connect");
      socket.off("chat message");
    };
  }, []);

  const onLogout = () => {
    localStorage.removeItem("jwt");
    dispatch(setIsAuthenticated(false));
  };
  return (
    <div
      className={`h-screen w-screen flex transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
          : "bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-10 w-64 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          isDarkMode ? "bg-gray-800 bg-opacity-95" : "bg-white bg-opacity-95"
        } backdrop-filter backdrop-blur-lg border-r border-opacity-20 ${
          isDarkMode ? "border-gray-700" : "border-white"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-opacity-20 border-gray-200">
            <h2
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Chat Sessions
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden"
              aria-label="Close sidebar"
            >
              <X
                size={24}
                className={isDarkMode ? "text-white" : "text-gray-800"}
              />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => switchSession(session.id)}
                className={`w-full text-left p-4 hover:bg-opacity-10 ${
                  session.id === currentSessionId
                    ? isDarkMode
                      ? "bg-blue-900 bg-opacity-50"
                      : "bg-blue-100"
                    : ""
                } ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-white"
                    : "hover:bg-gray-200 text-gray-800"
                }`}
              >
                {session.name}
              </button>
            ))}
          </div>
          <button
            onClick={createNewSession}
            className={`p-4 flex items-center justify-center ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <Plus size={20} className="mr-2" /> New Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col md:ml-64">
        <div className="flex items-center justify-between p-4 border-b border-opacity-20 border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-200"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu
              size={24}
              className={isDarkMode ? "text-white" : "text-gray-800"}
            />
          </button>
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {currentSession?.name || "Chat"}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 text-yellow-300"
                  : "bg-gray-200 text-gray-800"
              } transition-colors duration-300`}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-full bg-red-100 dark:bg-red-900 transition-colors duration-200"
            >
              <LogOutIcon className="w-5 h-5 text-red-500 dark:text-red-300" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession && currentSession.messages.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center h-full text-center ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-semibold">No messages yet</p>
              <p className="text-sm">
                Send a message to start the conversation!
              </p>
            </div>
          ) : (
            groupedMessages && groupedMessages?.map(([date, dateMessages]) => (
              <div key={date}>
                <div className="flex justify-center my-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {formatDate(new Date(date))}
                  </span>
                </div>
                {dateMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    } mb-2`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === "user"
                          ? isDarkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-blue-200"
                            : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-opacity-20 border-gray-200"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className={`flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                isDarkMode
                  ? "bg-gray-700 text-white border-gray-600 focus:ring-blue-400 placeholder-gray-400"
                  : "bg-white text-gray-800 border-gray-300 focus:ring-blue-500 placeholder-gray-500"
              }`}
              ref={inputRef}
            />
            <button
              type="submit"
              className={`p-2 rounded-full ${
                isDarkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-400`}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

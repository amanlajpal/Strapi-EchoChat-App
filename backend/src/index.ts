import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    var io = require("socket.io")(strapi.server.httpServer, {
      cors: {
        // cors setup
        origin: strapi.config.get('custom.allowedOrigin'),
        methods: ["GET", "POST"],
        allowedHeaders: [],
        credentials: true,
      },
    });
    io.on("connection", (socket) => {
      console.log("A user connected");
      // Listen for messages from the client
      socket.on("chat message", (msg) => {
        console.log("Message received:", msg);
        msg.sender = "server";
        msg.id = Date.now().toString();
        // Echo the message back to the client
        socket.emit("chat message", msg);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  },
};

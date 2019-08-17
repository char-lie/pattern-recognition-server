/**
 * MIT License
 *
 * Copyright (c) 2019 char-lie
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const WebSocket = require('ws');

const MAX_PAYLOAD_KB = 1;
const MAX_PAYLOAD = Math.round(MAX_PAYLOAD_KB * (2 ** 10));

const DEFAULT_CLIENT_TTL_SECONDS = 60;
const DEFAULT_CLIENT_TTL = Math.round(DEFAULT_CLIENT_TTL_SECONDS * 1E3);

const DEFAULT_MAX_CLIENTS = 100;

/**
 * Base task server.
 * Initialize websocket server with validation of connected clients.
 * Create tasks execution sessions to watch by observers.
 */
class WSTaskServer {
  constructor({
    clientTTL = DEFAULT_CLIENT_TTL,
    Executor,
    maxPayload = MAX_PAYLOAD,
    Observer,
    server,
    socketPool,
    taskPath,
  }) {
    this.clientTTL = clientTTL;
    this.Executor = Executor;
    this.Observer = Observer;
    this.socketPool = socketPool;
    this.taskPath = taskPath;

    this.sessions = new Map();

    this.server = new WebSocket.Server({
      maxPayload,
      server,
      verifyClient: () => this.verifyClient,
    });

    this.registerListeners(this.server);
  }

  /**
   * Socket pool should not be full
   * and the client's url should match the task path.
   * Also, it should have session identifier
   * after the task path.
   */
  verifyClient(client) {
    return !this.socketPool.full()
      && typeof client.url === 'string'
      && client.url.startsWith(this.taskPath)
      && client.url.length > this.taskPath;
  }

  /**
   * Register error and new client connection events listeners.
   */
  registerListeners(server) {
    server.on('error', (error) => this.onError(error));
    server.on('close', () => this.onClose(error));
    server.on(
      'connection',
      (socket, request) => this.onConnection(socket, request),
    );
  }

  /**
   * Try not to fail, just print the error.
   */
  onError(error) {
    console.error(error);
  }

  onClose() {
    console.log('Close the server');
  }

  /**
   * When new connection is connected,
   * first check whether the socket pool is not full.
   * If it is, close the connection.
   *
   * Check whether the client is connected to existent session
   * or try to create the new one.
   */
  onConnection(socket, request) {
    if (this.socketPool.full()) {
      socket.close();
      return;
    }
    this.socketPool.add(socket);
    const sessionId = request.url.substr(this.taskPath.length);
    try {
      this.addClient({ socket, sessionId });
    } catch (error) {
      console.error(
        `Cannot connect a client to session ${sessionId}. ${error}`,
      );
      this.socketPool.remove(socket);
      socket.close();
    }
  }

  /*
   * If the session is new,
   * the client is an executor.
   * Otherwise, it's an observer and cannot interact with the server
   * but listen to messages.
   */
  addClient({
    socket,
    sessionId,
  }) {
    const clientData = {
      connectionDate: new Date(),
      socket,
      ttl: this.clientTTL,
    };

    if (this.sessions.has(sessionId)) {
      const observer = new this.Observer({
        ...clientData,
      });
      observer.afterClose = () => {
        this.removeObserver(sessionId, observer);
      };
      this.sessions.get(sessionId).add(observer);
      this.broadcastObservers(sessionId, 'New observer connected');
      console.log(`Connect to ${sessionId} session`);
    } else {
      const executor = new this.Executor({
        ...clientData,
        afterMessage: (message) => {
          this.broadcastObservers(sessionId, message);
        },
        afterClose: () => {
          this.closeSession(sessionId);
        },
      });
      this.sessions.set(
        sessionId,
        new Set([executor]),
      );
      console.log(`Open new session ${sessionId}`);
    }
  }

  broadcastObservers(sessionId, message) {
    this.sessions.get(sessionId).forEach((client) => {
      if (client instanceof this.Observer) {
        client.send(`Executor: ${message}`);
      }
    });
  }

  removeObserver(sessionId, client) {
    if (sessions.has(sessionId)) {
      this.sessions.get(sessionId).delete(client);
      this.socketPool.remove(client.socket);
    }
  }

  closeSession(sessionId) {
    this.sessions.get(sessionId).forEach((client) => {
      client.close();
      this.socketPool.remove(client.socket);
    });
    this.sessions.get(sessionId).clear();
    this.sessions.delete(sessionId);
    console.log(`Close the session ${sessionId}`);
  }
}

module.exports = WSTaskServer;
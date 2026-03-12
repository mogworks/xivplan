import http from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const port = Number.parseInt(process.env.PORT ?? '1234', 10);

const messageSync = 0;
const messageAwareness = 1;

/** @type {Map<string, { doc: Y.Doc, awareness: awarenessProtocol.Awareness, conns: Set<import('ws').WebSocket> }>} */
const rooms = new Map();

function getRoom(roomName) {
  let room = rooms.get(roomName);
  if (!room) {
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);
    room = { doc, awareness, conns: new Set() };
    rooms.set(roomName, room);

    // Broadcast document updates to all connected clients
    doc.on('update', (update, origin) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      room.conns.forEach((c) => {
        // Don't send update back to the origin connection
        if (c !== origin && c.readyState === c.OPEN) {
          c.send(message);
        }
      });
    });

    // Broadcast awareness updates to all connected clients
    awareness.on('update', ({ added, updated, removed }, conn) => {
      const changedClients = added.concat(updated, removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients));
      const message = encoding.toUint8Array(encoder);
      room.conns.forEach((c) => {
        if (c.readyState === c.OPEN) {
          c.send(message);
        }
      });
    });
  }
  return room;
}

function handleMessage(conn, room, message) {
  const decoder = decoding.createDecoder(new Uint8Array(message));
  const messageType = decoding.readVarUint(decoder);

  switch (messageType) {
    case messageSync: {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      // Pass conn as origin so it won't receive its own update back
      const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, room.doc, conn);
      if (syncMessageType !== syncProtocol.messageYjsSyncStep2 && encoding.length(encoder) > 1) {
        conn.send(encoding.toUint8Array(encoder));
      }
      break;
    }
    case messageAwareness: {
      awarenessProtocol.applyAwarenessUpdate(room.awareness, decoding.readVarUint8Array(decoder), conn);
      break;
    }
  }
}

function setupConnection(conn, roomName) {
  const room = getRoom(roomName);
  room.conns.add(conn);

  conn.on('message', (message) => {
    handleMessage(conn, room, message);
  });

  conn.on('close', () => {
    room.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(room.awareness, [room.doc.clientID], null);
    if (room.conns.size === 0) {
      room.doc.destroy();
      rooms.delete(roomName);
    }
  });

  // Send sync step 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, room.doc);
  conn.send(encoding.toUint8Array(encoder));

  // Send awareness states
  const awarenessStates = room.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(awarenessStates.keys())),
    );
    conn.send(encoding.toUint8Array(awarenessEncoder));
  }
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Yjs websocket server is running.\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  const roomName = req.url?.slice(1) || 'default';
  setupConnection(conn, roomName);
});

server.listen(port, () => {
  console.log(`Yjs websocket server listening on ws://localhost:${port}`);
});

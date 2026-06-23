let activeSocket = null;

export function setActiveSocket(socket) {
  activeSocket = socket;
}

export function clearActiveSocket() {
  activeSocket = null;
}

export function disconnectActiveSocket() {
  if (activeSocket) {
    activeSocket.disconnect();
    activeSocket = null;
  }
}

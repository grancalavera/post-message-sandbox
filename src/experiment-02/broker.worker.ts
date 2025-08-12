interface RendezvousEntry {
  parentPort?: MessagePort;
  childPort?: MessagePort;
  timestamp: number;
}

const rendezvousMap = new Map<string, RendezvousEntry>();
const TIMEOUT_MS = 30000; // 30 seconds

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rendezvousMap.entries()) {
    if (now - entry.timestamp > TIMEOUT_MS) {
      rendezvousMap.delete(key);
      console.log(`Cleaned up expired rendezvous entry for key: ${key}`);
    }
  }
}

// Clean up expired entries every 10 seconds
setInterval(cleanupExpiredEntries, 10000);

self.addEventListener('connect', (event: Event) => {
  const connectEvent = event as MessageEvent;
  const port = connectEvent.ports[0];
  
  port.addEventListener('message', (messageEvent: MessageEvent) => {
    const { type, key, role } = messageEvent.data;
    
    if (type === 'register') {
      console.log(`Registering ${role} for key: ${key}`);
      
      let entry = rendezvousMap.get(key);
      if (!entry) {
        entry = { timestamp: Date.now() };
        rendezvousMap.set(key, entry);
      }
      
      // Store the port based on role
      if (role === 'parent') {
        entry.parentPort = port;
      } else if (role === 'child') {
        entry.childPort = port;
      } else {
        port.postMessage({ type: 'error', message: 'Invalid role' });
        return;
      }
      
      // Check if both parent and child are registered
      if (entry.parentPort && entry.childPort) {
        console.log(`Both parent and child registered for key: ${key}, creating MessageChannel`);
        
        // Create MessageChannel and transfer ports
        const channel = new MessageChannel();
        
        try {
          // Send port1 to parent
          entry.parentPort.postMessage(
            { type: 'port', port: channel.port1 },
            [channel.port1]
          );
          
          // Send port2 to child
          entry.childPort.postMessage(
            { type: 'port', port: channel.port2 },
            [channel.port2]
          );
          
          console.log(`MessageChannel created and ports transferred for key: ${key}`);
          
          // Clean up the rendezvous entry
          rendezvousMap.delete(key);
        } catch (error) {
          console.error(`Error transferring ports for key ${key}:`, error);
          entry.parentPort?.postMessage({ type: 'error', message: 'Failed to transfer ports' });
          entry.childPort?.postMessage({ type: 'error', message: 'Failed to transfer ports' });
        }
      } else {
        // Send acknowledgment that registration was successful
        port.postMessage({ type: 'registered', role, key });
      }
    }
  });
  
  port.start();
});
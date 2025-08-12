# Experiment 02: SharedWorker-brokered MessageChannel

In this experiment we iterate on Experiment 01 by introducing a SharedWorker as a neutral broker to rendezvous parent and child windows and transfer a MessagePort between them.

We use Comlink for all application messaging across the MessagePort. The SharedWorker is only used to orchestrate discovery/pairing and to transfer the ports.

## Flow

1. Parent has a button to open child window(s). When clicked, it creates a rendezvous key (e.g., UUID) and opens a child window, passing the key in the URL (e.g., ?key=abc123).
2. Parent connects to the SharedWorker and registers the key.
3. Child window loads, parses the key from URL, connects to the SharedWorker, and registers the same key.
4. The SharedWorker matches the two registrations and:
   - Creates a new MessageChannel
   - Transfers port1 to the parent client port, and port2 to the child client port
5. Parent and child wrap their respective ports with Comlink:
   - Parent: Comlink.wrap(port1)
   - Child: Comlink.expose(api, port2)
6. From that point on, all messaging is done via Comlink over the dedicated MessageChannel between the two windows.

## Components and responsibilities

- **Parent window**
  - Has a button to open child window(s)
  - Generates rendezvous key when button is clicked
  - Opens child window with key in URL query
  - Connects to SharedWorker and registers as "parent(key)"
  - Receives a transferred MessagePort
  - Wraps the port via Comlink and sends commands to the child
- **Child window**
  - Reads rendezvous key from URL query
  - Connects to SharedWorker and registers as "child(key)"
  - Receives a transferred MessagePort
  - Exposes its API via Comlink on the port
- **SharedWorker (broker)**
  - Maintains an in-memory map of "key -> { parentPort?, childPort? }"
  - On second arrival for the same key, creates MessageChannel
  - Transfers port1 to parent client port; port2 to child client port
  - Cleans up the map entry after successful transfer
  - Optionally emits diagnostics, timeouts, and error events to clients

## Implementation

- **SharedWorker script**:
  - On connect: assign clientPort; client announces role=parent|child and key
  - Store in a map; when both present, create MessageChannel and transfer ports
  - Send ok/error events and support timeouts and cleanup
- **Parent page**:
  - Show button to open child window(s)
  - On button click: generate key; open child with ?key=…
  - Connect to worker and announce parent+key
  - On receipt of port, Comlink.wrap(port), enable UI to send messages
- **Child page**:
  - Parse key from URL
  - Connect to worker and announce child+key
  - On receipt of port, Comlink.expose(api, port) to respond to parent calls

## Tasks

- Create experiment-02 directory structure and Vite entry points
- Add SharedWorker broker with key-based rendezvous map
- Parent: generate key, open child with ?key, register with worker
- Child: read key from URL, register with worker
- Worker: on pair, create MessageChannel and transfer ports
- Parent: wrap port via Comlink and enable UI interactions
- Child: expose API via Comlink on the received port

# Client Notes

## Re-connect client on worker crash

```typescript
// this is not going to work because is not enough with just creating a new
// instance of the shared worker, we need to replace the actual underlying
// proxy. for example, that would mean that every rpc call should resolve the
// proxy implementation dynamically and then call the functions in the proxy.
// this can be implemented in the client proxy, or "around" the client proxy.
const initializeClient = async (port: MessagePort, clientId: string) => {
  const workerId = await registerClient(port, clientId);
  await monitorWorkerCrash(workerId);
  initializeClient(port, clientId);
};
```

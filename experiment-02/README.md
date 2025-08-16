# Experiment 02: SharedWorker-brokered MessageChannel

In this experiment we iterate on Experiment 01 by introducing a SharedWorker as a neutral broker to rendezvous parent and child windows and transfer a MessagePort between them.

We use Comlink for all application messaging across the MessagePort. The SharedWorker is only used to orchestrate discovery/pairing and to transfer the ports.

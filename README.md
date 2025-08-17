# Post Message Sandbox

A sandbox to experiment with browser post-message APIs using Comlink as an abstraction layer.

## Overview

This project provides a testing environment for exploring browser communication patterns using the `postMessage` API through [Comlink](https://github.com/GoogleChromeLabs/comlink), which simplifies cross-context communication by providing a more intuitive RPC-like interface.

## Project Structure

The sandbox is organized into separate experiments, each with its own Vite entry point:

- **experiment-01/**: Basic iframe communication using Comlink

Each experiment includes:

- `index.html` - Main page entry point
- `main.tsx` - React application setup
- `child.html` - Child context (iframe/worker)
- Corresponding TypeScript/React components

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Navigate to the experiments:
   - Experiment 01: `http://localhost:5173/experiment-01/`

## Development Guidelines

- Use Comlink instead of direct `postMessage` API calls
- Each experiment should be self-contained in its own directory
- Follow the established pattern for new experiments
- Assume the Vite dev server runs on port 5173

## Technology Stack

- **Vite** - Build tool and dev server
- **React** - UI framework
- **TypeScript** - Type safety
- **Comlink** - PostMessage abstraction
- **ESLint** - Code linting

## Experiments

### Experiment 01: Basic Iframe Communication

Demonstrates basic parent-child iframe communication using Comlink.

# Ollama Setup

Msingi's local AI provider is [Ollama](https://ollama.com) running `qwen3:4b`.

> Note: another team member owns verifying the Ollama install on the shared dev
> machine. This doc exists so anyone can reproduce/verify the setup independently.

## 1. Install Ollama

Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```
macOS/Windows: download from https://ollama.com/download.

## 2. Start the Ollama server

```bash
ollama serve
```
Leave this running in a terminal (or run it as a background service). It listens on
`http://localhost:11434` by default.

## 3. Pull the model

```bash
ollama pull qwen3:4b
```
This downloads ~2.5GB and can take a while on a slow connection.

## 4. Verify

```bash
curl http://localhost:11434/api/tags
```
You should see `qwen3:4b` in the `models` list.

Or from the app itself, once the backend is running:
```bash
curl http://localhost:8000/api/health
```
`ollama_available` should be `true`.

## 5. Configuration

Set in `.env` (see `.env.example`):
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:4b
```
The application never hard-codes the model name or URL — everything goes through
`app/core/config.py`.

## Known limitations

- Ollama must be running and `qwen3:4b` pulled before `/api/chat` will succeed.
  `/api/health` will report `ollama_available: false` if not, and `/api/chat`
  returns HTTP 503 with a clear message rather than crashing.
- On CPU-only machines with limited RAM, generation can be slow (many seconds
  per response for a 4B model).

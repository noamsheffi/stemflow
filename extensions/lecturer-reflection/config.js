// Local decks sync locally; production decks sync to the public Syllo API.
globalThis.SYLLO_API_BASE_URL = location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://syllo.live";
globalThis.SYLLO_WORKSPACE_ID = null;

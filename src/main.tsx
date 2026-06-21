import { render } from "preact";
import { App } from "./App";
import { registerServiceWorker } from "./lib/pwa";
import { warmExporterChunks } from "./lib/exporters";
import "./styles/index.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root element.");
}

render(<App />, app);
registerServiceWorker();
warmExporterChunks();

import { useEffect, useState } from "preact/hooks";
import { ReceiptBuilderView } from "./views/ReceiptBuilderView";
import { ReceiptPreviewPage } from "./views/ReceiptPreviewPage";

export function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return route === "preview" ? <ReceiptPreviewPage /> : <ReceiptBuilderView />;
}

function getRoute() {
  return window.location.hash === "#/preview" ? "preview" : "builder";
}

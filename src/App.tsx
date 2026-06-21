import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";
import { appRoutes, routerScope } from "./routes";
import { ReceiptBuilderView } from "./views/ReceiptBuilderView";
import { ReceiptPreviewPage } from "./views/ReceiptPreviewPage";

export function App() {
  return (
    <LocationProvider scope={routerScope}>
      <ErrorBoundary>
        <Router>
          <Route path={appRoutes.home} component={ReceiptBuilderView} />
          <Route path={appRoutes.preview} component={ReceiptPreviewPage} />
          <Route default component={ReceiptBuilderView} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
}

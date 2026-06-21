type RouteLocation = {
  route: (url: string, replace?: boolean) => void;
};

type ViewTransition = {
  finished: Promise<void>;
  ready: Promise<void>;
  skipTransition: () => void;
  updateCallbackDone: Promise<void>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => ViewTransition;
};

const routeFadeClass = "route-fade-fallback";
const routeFadeDurationMs = 220;

export function routeWithFade(location: RouteLocation, url: string, replace = false) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    location.route(url, replace);
    return;
  }

  const transitionDocument = document as ViewTransitionDocument;

  if (transitionDocument.startViewTransition) {
    transitionDocument.startViewTransition(() => location.route(url, replace));
    return;
  }

  document.documentElement.classList.add(routeFadeClass);
  location.route(url, replace);
  window.setTimeout(() => document.documentElement.classList.remove(routeFadeClass), routeFadeDurationMs);
}

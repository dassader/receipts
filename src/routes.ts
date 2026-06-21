import type { PaperFormat } from "./types";

const normalizedBasePath = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

export const appRoutes = {
  home: normalizedBasePath,
  preview: `${normalizedBasePath === "/" ? "" : normalizedBasePath}/preview`,
};

export const routerScope = normalizedBasePath === "/" ? "/" : normalizedBasePath;

export function createPreviewRoute(paper: PaperFormat) {
  return `${appRoutes.preview}?paper=${paper}`;
}

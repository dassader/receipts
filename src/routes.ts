const normalizedBasePath = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

export const appRoutes = {
  home: normalizedBasePath,
  preview: `${normalizedBasePath === "/" ? "" : normalizedBasePath}/preview`,
};

export const routerScope = normalizedBasePath === "/" ? "/" : normalizedBasePath;

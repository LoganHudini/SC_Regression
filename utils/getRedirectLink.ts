export const getRedirectLink = (
  paths: {
    path: string;
    id: string;
  }[],
  pageId?: string,
) => {
  if (!pageId) {
    return undefined;
  }

  const path = paths.find(({ id }) => id === pageId);

  return path?.path || pageId;
};

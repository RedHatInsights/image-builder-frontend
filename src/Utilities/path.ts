function resolveRelPath(path = '') {
  if (process.env.IS_ON_PREMISE) {
    // We're using the hash router
    // so we can just return the path
    return path.length > 0 ? path : '/';
  }
  return `/insights/image-builder${path.length > 0 ? `/${path}` : ''}`;
}

export { resolveRelPath };

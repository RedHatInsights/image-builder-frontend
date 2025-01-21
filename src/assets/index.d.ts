// this is a bit hacky, but we need it
// to be able to import the images
declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  export default SvgComponent as React.FC<React.SVGProps>;
}

declare module '*.png?url' {
  const content: any;
  export default content;
}

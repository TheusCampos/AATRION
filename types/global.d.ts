// Declarações de tipo para imports sem tipo explícito

declare module '*.css';
declare module '*.scss';
declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.png' {
  const content: string;
  export default content;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}
declare module '*.webp' {
  const content: string;
  export default content;
}

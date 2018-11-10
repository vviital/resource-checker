declare module 'hapi-pino' {
  export function register(server: Object, options: Object): void;
  export const name: string;
}

declare module 'get-port' {
  export default function(options?: object): number;
}

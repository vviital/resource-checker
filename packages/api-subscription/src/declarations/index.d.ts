declare module 'hapi-pino' {
  export function register(server: object, options: object): void;
  export const name: string;
}

declare module 'get-port' {
  export default function(options?: object): number;
}

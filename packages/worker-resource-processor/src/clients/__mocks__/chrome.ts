import { IChromeConfig } from '../chrome';

export default class Chrome {
  private _initialized: boolean;
  private counter: number;

  constructor(private config: IChromeConfig) {
    this.counter = 0;
    this._initialized = false;
  }

  get initialized() {
    return this._initialized;
  }

  get core() {
    return {
      newPage() {
        return {
          close() {},
          goto() {},
          setViewport() {},
        };
      }
    }
  }

  async initialize(): Promise<void> {
    if (this._initialized) return;

    this._initialized = true;
  }

  public async savePage() {
    this.counter++;
    return this.counter.toString();
  }
}

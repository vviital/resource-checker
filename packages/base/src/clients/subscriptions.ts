import { IConfiguration } from '@resource-checker/configurations';
import { JsonHttpClient } from '@resource-checker/http-client';

export type Revision = {
  created: Date,
  id: string,
  revisionObject: object,
  type: string,
};

export type SubscriptionObject = {
  created: Date,
  handlerTypes: string[],
  id: string,
  modified: Date,
  revisions: Revision[],
  url: string,
}

export default class Subscriptions {
  private client: JsonHttpClient;
  private basePath: string;

  constructor(private config: IConfiguration) {
    this.client = new JsonHttpClient({ defaultOptions: { throwHttpErrors: false } });
    this.basePath = `${this.config.get('apiSubscriptionEndpoint')}/subscriptions`;
  }

  public async *[Symbol.asyncIterator]() {
    let statusCode: number;
    let previousDate = new Date(0);
    do {
      const response = await this.client.get(`${this.basePath}/next/${previousDate.getTime()}`);

      statusCode = response.statusCode;

      if (![200, 404].includes(statusCode)) {
        throw new Error(`Subscription resource is not available with status ${statusCode}`);
      }
      
      previousDate = new Date(response.body.created);

      if (statusCode === 200) {
        const subscription: SubscriptionObject = response.body;
        subscription.created = new Date(subscription.created);
        subscription.modified = new Date(subscription.modified);
        subscription.handlerTypes = Array.isArray(subscription.handlerTypes) ? subscription.handlerTypes : [];
        yield subscription;
      }
    } while (statusCode === 200);
  }
}

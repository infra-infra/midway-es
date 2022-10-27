import {Config, Init, Logger, Provide, Scope, ScopeEnum,} from '@midwayjs/decorator';
import {ServiceFactory,} from '@midwayjs/core';
import {Client} from '@elastic/elasticsearch';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ElasticsearchServiceFactory extends ServiceFactory<Client> {
  @Config('elasticsearch')
  elasticsearchConfig;

  @Logger('coreLogger')
  logger;

  @Init()
  async init() {
    await this.initClients(this.elasticsearchConfig);
  }

  protected async createClient(config): Promise<Client> {
    const { node, auth } = config;

    const client = new Client({
      node,
      auth,
    });

    try {
      await client.ping();
      this.logger.info('[midway:elasticsearch] connecting start');
    } catch (error) {
      this.logger.error('[midway:elasticsearch] client error: %s', error);
      this.logger.error(error);
    }

    return client;
  }

  getName() {
    return 'elasticsearch';
  }

  async destroyClient(elasticsearchInstance: Client) {
    try {
      await (elasticsearchInstance && elasticsearchInstance.close());
    } catch (error) {
      this.logger.error(
        '[midway:elasticsearch] elasticsearch quit failed.',
        error
      );
    }
  }
}

import Router from 'ette-router';
import { TAnyFunction, IProxyRule, IStoresEnv } from 'ide-lib-base-component';
import { IAnyType } from 'mobx-state-tree';

export interface IComponentConfig<Props, StoreModel> {
  basic: {
    className: string;
  };
  component: {
    // subject: React.FunctionComponent;
    solution: Record<string, TAnyFunction[]>;
    defaultProps: Props;
    subsConfig: {
      normal: Record<string, React.FunctionComponent<Props>>;
      addStore: Record<
        string,
        (storesEnv: IStoresEnv<StoreModel>) => React.FunctionComponent<Props>
      >;
    };
  };
  routers: {
    domain: string;
    proxies?: IProxyRule | IProxyRule[];
    list?: Router[];
  };

  store: {
    idPrefix: string;
  };
  model: {
    controlledKeys: string[];
    props: Record<string, IAnyType>;
  };
}

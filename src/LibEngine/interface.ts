import { middlewareFunction } from 'ette';
import {
  TAnyFunction,
  IProxyRule,
  IStoresEnv,
} from 'ide-lib-base-component';
import { IAnyType } from 'mobx-state-tree';

export interface IComponentConfig<Props, StoreModel> {
  basic: {
    className: string;
  };
  component: {
    subject: React.FunctionComponent;
    solution: Record<string, TAnyFunction[]>;
    defaultProps: Props;
    subComponents: {
        addStore: Record<
            string,
            (storesEnv: IStoresEnv<StoreModel>) => React.FunctionComponent<Props>
        >;
    };
  };
  router: {
    domain: string;
    proxies?: IProxyRule | IProxyRule[];
    routes?: middlewareFunction[];
  };

  store: {
    idPrefix: string;
  };
  model: {
    props: Record<string, IAnyType>;
  };
}

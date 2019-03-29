import Router from 'ette-router';
import {
  TAnyFunction,
  IProxyRule,
  IStoresEnv,
  TAnyMSTModel
} from 'ide-lib-base-component';
import { IAnyType } from 'mobx-state-tree';

// type TProps<T> = T extends (infer U) ? U : any;
export interface IComponentConfig<Props, SubProps> {
  className: string;
  solution?: Record<string, TAnyFunction[]>;
  defaultProps?: Props;
  children?: Record<string, IComponentConfig<SubProps, any>>;
  storesModel?: TAnyMSTModel;

  // TODO: 细化 factory 的类型
  factory?: (...args: any[]) => Partial<IStoresEnv<TAnyMSTModel>>;

  // 主要是用在 children 内的
  normal?: React.FunctionComponent<Props>;
  addStore?: (
    storesEnv: IStoresEnv<TAnyMSTModel>
  ) => React.FunctionComponent<Props>;
  namedAs?: string; // 属性名
}
export interface IModuleConfig<Props, SubProps> {
  component: IComponentConfig<Props, SubProps>;
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

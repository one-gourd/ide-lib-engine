import Router from 'ette-router';
import {
  TAnyFunction,
  IProxyRule,
  IStoresEnv,
  TAnyMSTModel
} from 'ide-lib-base-component';
import { IAnyType } from 'mobx-state-tree';

export type TFactoryFunction = (
  ...args: any[]
) => Partial<IStoresEnv<TAnyMSTModel>>;

export type TSubFactoryMap<ISubProps> = Record<
  keyof ISubProps,
  TFactoryFunction
>;

// TODO: 迁移到 lib-base-component 中
export type ValueOf<T> = T[keyof T];

// type TProps<T> = T extends (infer U) ? U : any;
export interface IComponentConfig<Props, ISubProps> {
  className: string;
  solution?: Record<string, TAnyFunction[]>;
  defaultProps?: Props;
  children?: Record<string, IComponentConfig<ValueOf<ISubProps>, any>>;
  storesModel?: TAnyMSTModel;
  factory?: TFactoryFunction;

  // 主要是用在 children 内的
  normal?: React.FunctionComponent<Props>;
  addStore?: (
    storesEnv: IStoresEnv<TAnyMSTModel>
  ) => React.FunctionComponent<Props>;
  namedAs?: string; // 属性名
  // TODO: 支持更加灵活的路由代理配置
  routerProxy?: string[];
}
export interface IModuleConfig<Props, ISubProps> {
  component: IComponentConfig<Props, ISubProps>;
  routers: {
    domain: string;
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

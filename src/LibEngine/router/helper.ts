import { IContext as IEtteContext } from 'ette';

import { IStoresModel } from '../schema/stores';
export interface IContext extends IEtteContext {
  stores: IStoresModel;
  [propName: string]: any;
}

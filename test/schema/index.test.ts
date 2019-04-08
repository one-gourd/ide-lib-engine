import { types, IAnyModelType } from 'mobx-state-tree';
import Chance from 'chance';
import { quickInitModel } from '../../src';

const chance = new Chance();

describe('[quickInitModel] 根据配置项创建 schema ', () => {
  let Schema: IAnyModelType, modelName: string;
  beforeEach(() => {
    modelName = chance.word();
    Schema = quickInitModel(modelName, {
      visible: types.optional(types.boolean, true),
      text: types.optional(types.string, 'hello')
    });
  });

  test('基本使用，支持默认值', () => {
    const schema = Schema.create();
    expect(Schema.name).toBe(modelName);
    expect(schema.visible).toBeTruthy();
    expect(schema.text).toBe('hello');
  });

  test('拥有 set 属性方法', () => {
    const schema = Schema.create();
    schema.setVisible(false);
    schema.setText('good');

    expect(schema.visible).toBeFalsy();
    expect(schema.text).toBe('good');
  });

  test('拥有 set 属性方法', () => {
    const schema = Schema.create();
    schema.setVisible(false);
    schema.setText('good');

    expect(schema.visible).toBeFalsy();
    expect(schema.text).toBe('good');
  });

  test('allAttibuteWithFilter - 获取指定属性', () => {
    const schema = Schema.create();

    expect(schema.allAttibuteWithFilter()).toEqual({
      visible: true,
      text: 'hello'
    });
    expect(schema.allAttibuteWithFilter('visible')).toEqual({
      visible: true
    });

    expect(schema.allAttibuteWithFilter('text')).toEqual({
      text: 'hello'
    });

    expect(schema.allAttibuteWithFilter(['visible', 'text'])).toEqual({
      visible: true,
      text: 'hello'
    });

    expect(schema.allAttibuteWithFilter('')).toEqual({});
  });

  test('updateAttribute - 更新指定属性', () => {
    const schema = Schema.create();
    schema.updateAttribute('visible', false);
    schema.updateAttribute('text', 'good');

    expect(schema.visible).toBeFalsy();
    expect(schema.text).toBe('good');
  });
});

import { types, IAnyModelType, getSnapshot } from 'mobx-state-tree';
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

  test('对 bool 兼容字符 "true"', () => {
    const schema = Schema.create();
    schema.setVisible('true');
    schema.setText('good');

    expect(schema.visible).toBeTruthy();
    expect(schema.text).toBe('good');

    schema.setVisible('false');
    expect(schema.visible).toBeFalsy();
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

  describe('支持子 model 的情况', () => {
    let ParentSchema: IAnyModelType;
    beforeEach(() => {
      ParentSchema = quickInitModel('ParentSchema', {
        item: types.map(Schema),
        list: types.array(Schema)
      });
    });

    test('map - 默认是空对象', () => {
      const parentSchema = ParentSchema.create();
      expect(getSnapshot(parentSchema.item)).toEqual({});
    });
    test('map - 直接赋值', () => {
      const schema = Schema.create();
      const item = {
        sub: schema
      };
      const parentSchema = ParentSchema.create();
      parentSchema.setItem(item);

      expect(getSnapshot(parentSchema.item)).toEqual(item);
    });

    test('list - 默认是空数组', () => {
      const parentSchema = ParentSchema.create();
      expect(getSnapshot(parentSchema.list)).toEqual([]);
    });

    test('list - 直接赋值', () => {
      const schema = Schema.create();
      const list = [schema];
      const parentSchema = ParentSchema.create();
      parentSchema.setList(list);

      expect(getSnapshot(parentSchema.list)).toEqual(list);
    });
  });
});

describe('[quickInitModel] 模型类型完备性检验 ', () => {
  let Schema: IAnyModelType, modelName: string;
  beforeEach(() => {
    modelName = chance.word();
    Schema = quickInitModel(modelName, {
      intValue: types.optional(types.integer, 10),
      numValue: types.optional(types.number, 1.23),
      dateValue: types.optional(types.Date, () => new Date())
    });
  });

  test('默认初始值', () => {
    const schema = Schema.create();
    expect(schema.intValue).toBe(10);
    expect(schema.numValue).toBe(1.23);
    expect(schema.dateValue).toBeInstanceOf(Date);
  });
  test('set integer', () => {
    const schema = Schema.create();
    schema.setIntValue(20);
    expect(schema.intValue).toBe(20);

    schema.setIntValue('30');
    expect(schema.intValue).toBe(30);
  });

  test('set float', () => {
    const schema = Schema.create();
    schema.setNumValue(2.34);
    expect(schema.numValue).toBe(2.34);

    schema.setNumValue('2.34');
    expect(schema.numValue).toBe(2.34);
  });

  test('set date', () => {
    const schema = Schema.create();
    const date = chance.date();
    const timestamp = date.getTime();

    schema.setDateValue(date);
    expect(schema.dateValue.getTime()).toBe(timestamp);

    schema.setDateValue(timestamp);
    expect(schema.dateValue.getTime()).toBe(timestamp);
  });
});

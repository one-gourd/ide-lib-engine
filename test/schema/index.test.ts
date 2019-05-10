import { types, IAnyModelType, getSnapshot, getMembers } from 'mobx-state-tree';
import Chance from 'chance';
import { JSONModel, EMPTY_JSON_SNAPSHOT } from 'ide-lib-base-component';
import { quickInitModel, convertProps, createGetterMethods } from '../../src';

const chance = new Chance();

describe('[util] 工具函数', () => {
  let props: any;
  beforeEach(() => {
    props = {
      visible: types.optional(types.boolean, true),
      formData: types.optional(JSONModel, EMPTY_JSON_SNAPSHOT)
    };
  });

  describe('[convertProps] 根据 prop 类型转换成名字 ', () => {
    test('如果是 JSONModel 模型添加 `_` 前缀', () => {
      const converted = convertProps(props);
      expect(converted.hasOwnProperty('visible')).toBeTruthy();
      expect(converted.hasOwnProperty('formData')).toBeFalsy();
      expect(converted.hasOwnProperty('_formData')).toBeTruthy();
    });
  });
  describe('[createGetterMethods] 根据 prop 类型获取 get 描述符 ', () => {
    test('如果是 JSONModel 模型返回 getter 方法', () => {
      const getters = createGetterMethods(
        {
          _formData: {
            value: 333
          }
        },
        props
      );
      expect(getters.hasOwnProperty('visible')).toBeFalsy();
      expect(getters.hasOwnProperty('formData')).toBeTruthy();
      expect(getters.formData).toBe(333);
    });
  });
});

describe('[quickInitModel] 根据配置项创建 schema ', () => {
  let Schema: IAnyModelType, modelName: string;
  beforeEach(() => {
    modelName = chance.word();
    Schema = quickInitModel(modelName, {
      visible: types.optional(types.boolean, true),
      text: types.optional(types.string, 'hello'),
      formData: types.optional(JSONModel, EMPTY_JSON_SNAPSHOT)
    });
  });

  test('对 JSONModel 的属性有特殊处理', () => {
    const names = (Schema as any).propertyNames;
    expect(!!~names.indexOf('_formData')).toBeTruthy();
    expect(!!~names.indexOf('formData')).toBeFalsy();
    expect(!!~names.indexOf('visible')).toBeTruthy();
    expect(!!~names.indexOf('text')).toBeTruthy();
  });

  test('基本使用，支持默认值', () => {
    const schema = Schema.create();
    expect(Schema.name).toBe(modelName);
    expect(schema.visible).toBeTruthy();
    expect(schema.text).toBe('hello');

    // 对 JSON Model 有特殊的属性
    expect(schema._formData).toEqual(EMPTY_JSON_SNAPSHOT);
    expect(schema.formData).toEqual({});

    const members = getMembers(schema);
    expect(!!~members.views.indexOf('formData')).toBeTruthy();
    expect(!!~members.actions.indexOf('setFormData')).toBeTruthy();
  });

  test('拥有 set 属性方法', () => {
    const schema = Schema.create();
    schema.setVisible(false);
    schema.setText('good');
    // console.log(222, getMembers(schema._formData));
    const objData = { a: 1 };
    schema.setFormData(objData);

    expect(schema.visible).toBeFalsy();
    expect(schema.text).toBe('good');
    expect(schema.formData).toEqual(objData);
  });

  test('JSON Modal 的初始化比较特殊，推荐初始化后再调用 setXX 方法', () => {
    const objData = { c: 2 };

    // 以下两种方式都不行哦！！
    const schema1 = Schema.create({
      formData: objData
    });
    expect(schema1.formData).toEqual({});

    const schema2 = Schema.create({
      _formData: objData
    });
    expect(schema2.formData).toEqual({});

    // 这样才行
    const schema3 = Schema.create({
      _formData: {
        _value: JSON.stringify(objData)
      }
    });
    expect(schema3.formData).toEqual(objData);

    // 或者这样，推荐这种做法
    const schema4 = Schema.create();
    schema4.setFormData(objData);
    expect(schema4.formData).toEqual(objData);
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
    const schema = Schema.create({
      _formData: { c: 2 }
    });

    expect(schema.allAttibuteWithFilter('formData')).toEqual({
      formData: {}
    });

    const objData = { a: 1 };
    schema.setFormData(objData);

    expect(schema.allAttibuteWithFilter()).toEqual({
      visible: true,
      text: 'hello',
      formData: objData
    });

    expect(schema.allAttibuteWithFilter('visible')).toEqual({
      visible: true
    });

    expect(schema.allAttibuteWithFilter('text')).toEqual({
      text: 'hello'
    });

    expect(schema.allAttibuteWithFilter('formData')).toEqual({
      formData: objData
    });

    expect(schema.allAttibuteWithFilter(['visible', 'text'])).toEqual({
      visible: true,
      text: 'hello'
    });

    expect(schema.allAttibuteWithFilter('')).toEqual({});
  });

  test('updateAttribute - 更新指定属性', () => {
    const objData = { c: 2 };
    const schema = Schema.create();
    schema.updateAttribute('visible', false);
    schema.updateAttribute('text', 'good');
    schema.updateAttribute('formData', objData);

    expect(schema.visible).toBeFalsy();
    expect(schema.text).toBe('good');
    expect(schema.formData).toEqual(objData);
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

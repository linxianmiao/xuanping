import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UseSceneItem from './item'
import '../style/useScene.less'
const FormItem = Form.Item
export default class UseScene extends Component {
  handleCheck = (rule, value, callback) => {
    const { getFieldValue, setFieldsValue } = this.props
    if (_.isEmpty(value)) {
      callback('关联和新增至少要选一个')
    }
    if (!_.isEmpty(value) && !(value.increased.type || value.relation.type)) {
      callback('关联和新增至少要选一个')
    }
    // 取消关联得时候，属性筛选不可用，且清空属性筛选得数据
    if (!_.isEmpty(value) && !value.relation.type) {
      setFieldsValue({ attributeValues: undefined })
      this.props.store.expandField = []
    }
    if (!_.isEmpty(value) && value.relation.type) {
      this.props.store.queryCiAttributeColumn({
        classCodes: getFieldValue('resType')
          ? _.map(getFieldValue('resType'), (item) => item.key).join()
          : undefined,
        formType: getFieldValue('formType')
      })
    }
    callback()
  }

  // 使用场景新增[计划删除]，但是旧数据没有这个选项，所以初始化一下defaultValue
  initDefaultValue = () => {
    const { defaultValue, item } = this.props

    if (!defaultValue) {
      return defaultValue
    }

    const nextDefaultValue = _.cloneDeep(defaultValue)

    item.params.forEach((param) => {
      const key = param.value
      if (!nextDefaultValue[key]) {
        nextDefaultValue[key] = item.defaultValue[key]
      }
    })

    return nextDefaultValue
  }

  render() {
    const { formItemLayout, item, getFieldDecorator, setFieldsValue, getFieldValue } = this.props
    if (getFieldValue('isSingle') === '1') {
      return (
        <FormItem {...formItemLayout} label={item.name}>
          {getFieldDecorator(item.code, {
            initialValue: this.initDefaultValue(),
            rules: [
              {
                required: item.required === 1,
                validator: (rule, value, callback) => {
                  this.handleCheck(rule, value, callback)
                }
              }
            ]
          })(
            <UseSceneItem
              setFieldsValue={setFieldsValue}
              item={item}
              getFieldValue={getFieldValue}
            />
          )}
        </FormItem>
      )
    }
    return null
  }
}

import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Form } from '@uyun/components'
import { observer } from 'mobx-react'
import Inner from './inner'
import '../style/attributeColumns.less'
const FormItem = Form.Item
@observer
class AttributeColumns extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, setFieldsValue, getFieldValue } =
      this.props
    const expandField = !_.isEmpty(toJS(this.props.store.expandField))
      ? toJS(this.props.store.expandField).filter((item) =>
          _.includes(['multiSel', 'singleSel', 'listSel'], item.type)
        )
      : []
    const useScene = getFieldValue('useScene')
    const dilver = {
      item,
      setFieldsValue,
      getFieldValue,
      expandField,
      disabled: _.isEmpty(expandField) || !(useScene && useScene.relation.type) // 返回得数据为空或者没有勾选关联得时候，禁用属性筛选
    }
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue,
          rules: [
            {
              required: item.required === 1
            }
          ]
        })(<Inner {...dilver} />)}
      </FormItem>
    )
  }
}
export default AttributeColumns

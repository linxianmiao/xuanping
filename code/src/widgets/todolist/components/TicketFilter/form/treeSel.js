import React, { Component } from 'react'
import { Form, TreeSelect } from '@uyun/components'
const FormItem = Form.Item
const SHOW_PARENT = TreeSelect.SHOW_PARENT

export default class ItsmTreeSelect extends Component {
  render () {
    const { item, formItemLayout, getFieldDecorator, defaultValue, getPopupContainer } = this.props
    return (
      <FormItem label={item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <TreeSelect
            allowClear
            multiple
            treeNodeFilterProp="label"
            treeCheckable
            treeDefaultExpandAll
            treeData={item.treeVos}
            showCheckedStrategy={SHOW_PARENT}
            placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
            getPopupContainer={getPopupContainer}
          />)}
      </FormItem>
    )
  }
}

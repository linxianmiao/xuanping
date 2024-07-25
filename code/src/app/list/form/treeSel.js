import React, { Component } from 'react'
import { Form, TreeSelect } from '@uyun/components'
import _ from 'lodash'
const FormItem = Form.Item
const SHOW_PARENT = TreeSelect.SHOW_PARENT

const TreeNode = TreeSelect.TreeNode
export default class ItsmTreeSelect extends Component {
  renderTreeNodes = (data, titles = []) => {
    return _.map(data, item => {
      const { value, label, children } = item
      const nodeProps = {
        key: value,
        dataRef: item,
        title: label,
        value,
        label: [...titles, label].join(' / ')
      }

      if (children && children.length > 0) {
        return (
          <TreeNode {...nodeProps}>{this.renderTreeNodes(children, [...titles, label])}</TreeNode>
        )
      }
      return <TreeNode {...nodeProps} />
    })
  }

  render() {
    const {
      item,
      formItemLayout,
      getFieldDecorator,
      defaultValue,
      getPopupContainer,
      disabled,
      label
    } = this.props
    return (
      <FormItem label={label || item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <TreeSelect
            disabled={disabled}
            allowClear
            multiple
            // treeNodeFilterProp="label"
            treeNodeLabelProp="label"
            treeCheckable
            treeDefaultExpandAll
            // showCheckedStrategy={SHOW_PARENT}
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
            getPopupContainer={getPopupContainer}
          >
            {this.renderTreeNodes(item.treeVos || item.cascade)}
          </TreeSelect>
        )}
      </FormItem>
    )
  }
}

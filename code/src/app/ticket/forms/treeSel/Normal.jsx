import React, { Component } from 'react'
import { toJS } from 'mobx'
import { TreeSelect, Input, Tooltip } from '@uyun/components'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import { DownOutlined } from '@uyun/icons'

const TreeNode = TreeSelect.TreeNode

function getTreeData(defaultValue, treeVos) {
  //  未验证
  // res = []
  // const labels = (treeVos, value) => {
  //   if(!treeVos) return
  //   return treeVos.some(item => {
  //     if (item.value === value || labels(item.children , value)) {
  //       res.unshift(item.label)
  //       return true
  //     }
  //     return false
  //   })
  // }

  const labels = (treeVos, value, parent = []) => {
    return _.map(treeVos, (item) => {
      if (item.value === value) {
        return [...parent, item.label]
      }
      if (!_.isEmpty(item.children)) {
        return labels(item.children, value, [...parent, item.label])
      }
    })
  }

  return _.map(defaultValue, (value) => {
    const res = labels(treeVos, value)
    return _.chain(res).flattenDeep().compact().join('/').value()
  })
}

class TreeSel extends Component {
  _render = () => {
    const { field, getFieldValue } = this.props
    const defaultValue = getFieldValue(field.code) || []
    if (defaultValue.length === 0) {
      return '--'
    }
    return getTreeData(defaultValue, field.treeVos).join(',')
  }

  renderTreeNodes = (data, titles = []) => {
    const { field } = this.props
    if (!data) return null
    return data.map((item) => {
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
          <TreeNode {...nodeProps} disableCheckbox={!!field.onlyLeafNode}>
            {this.renderTreeNodes(children, [...titles, label])}
          </TreeNode>
        )
      }
      return <TreeNode {...nodeProps} />
    })
  }

  renderReadOnly() {
    const { secrecy, disabled } = this.props

    if (secrecy) {
      return <Secrecy />
    }

    if (disabled) {
      return <div className="pre-wrap disabled-ticket-form">{this._render()}</div>
    }
    return null
  }

  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      initialValue,
      popupContainerId,
      fieldMinCol,
      formLayoutType
    } = this.props
    const ref = document.getElementById(`${popupContainerId}`)
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || undefined,
          getValueFromEvent: (value) => {
            return value
          },
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ]
        })(
          <TreeSelect
            className={classnames('ticket-forms-trees', {
              'disabled-item': disabled
            })}
            id={field.code}
            allowClear
            multiple
            treeCheckable
            showSearch
            treeDefaultExpandAll
            filterTreeNode={(inputValue, treeNode) => {
              const { title } = treeNode.props
              return title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
            }}
            disabled={field.isRequired === 2}
            treeNodeLabelProp="label"
            dropdownStyle={{ maxHeight: 300 }}
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            placeholder={field.isRequired ? '' : i18n('globe.select', '请选择') + field.name}
            notFoundContent={`${i18n('globe.notFound', '无法找到')}`}
            // getPopupContainer={() => ref || document.body}
            getPopupContainer={(triggerNode) => triggerNode || document.body}
          >
            {this.renderTreeNodes(toJS(field.treeVos))}
          </TreeSelect>
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}
export default TreeSel

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TreeSelect } from '@uyun/components'
const SHOW_PARENT = TreeSelect.SHOW_PARENT
const LIST = {
  parent: TreeSelect.SHOW_PARENT,
  child: TreeSelect.SHOW_CHILD,
  all: TreeSelect.SHOW_ALL
}
class ItsmTreeSel extends Component {
  static propTypes = {
    value: PropTypes.array,
    params: PropTypes.array,
    handleChange: PropTypes.func
  }

  render () {
    const { value, params, disabled, handleChange } = this.props
    return (
      <TreeSelect
        disabled={disabled}
        multiple
        showSearch
        treeCheckable
        treeDefaultExpandAll
        value={value}
        treeData={params}
        showCheckedStrategy={SHOW_PARENT}
        placeholder={i18n('globe.select', '请选择')}
        notFoundContent={i18n('globe.notFound', '无法找到')}
        onChange={value => { handleChange(value) }}
        filterTreeNode={(inputValue, treeNode) => {
          const { title } = treeNode.props
          return title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
        }} />
    )
  }
}
export default ItsmTreeSel

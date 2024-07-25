import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Cascader } from '@uyun/components'
const { SHOW_CHILD } = Cascader
class ItsmCascader extends Component {
  static propTypes = {
    value: PropTypes.array,
    params: PropTypes.array,
    handleChange: PropTypes.func
  }

  // 子节点的children为空数组，这里将其设为null，防止子节点出现空的子选项
  setEmptyChildrenForCascade = (cascade = []) => {
    if (!cascade || cascade.length === 0) {
      return []
    }

    return cascade.map((item) => {
      if (item.children && item.children.length > 0) {
        return { ...item, children: this.setEmptyChildrenForCascade(item.children) }
      }
      return { ...item, children: null }
    })
  }

  render() {
    const { value, params, disabled, handleChange, comparison } = this.props
    return (
      <Cascader
        disabled={disabled}
        showSearch
        // changeOnSelect
        value={value}
        showCheckedStrategy={SHOW_CHILD}
        options={this.setEmptyChildrenForCascade(params)}
        onChange={handleChange}
        multiple={['CONTAINS', 'NOTCONTAINS'].includes(comparison)}
        optionFilterProp="children"
        placeholder={i18n('globe.select', '请选择')}
        notFoundContent={i18n('globe.notFound', '无法找到')}
      />
    )
  }
}
export default ItsmCascader

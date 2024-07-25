import React, { Component } from 'react'
import { TreeSelect } from '@uyun/components'

export default class TacheSelect extends Component {
  state = {
    data: []
  }

  query = async () => {
    const res = await axios.get(API.getModelAndTache)

    this.setState({ data: res || [] })
  }

  handleVisibleChange = (visible) => {
    if (visible && this.state.data.length === 0) {
      this.query()
    }
  }

  render() {
    const { value, onChange } = this.props
    const { data } = this.state

    return (
      <TreeSelect
        placeholder={i18n('globe.select', '请选择') + i18n('ticket.list.tacheName', '当前节点')}
        allowClear
        multiple
        treeCheckable
        treeNodeFilterProp="label"
        treeDefaultExpandAll
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        treeData={data}
        value={value}
        onChange={onChange}
        onDropdownVisibleChange={this.handleVisibleChange}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
      />
    )
  }
}

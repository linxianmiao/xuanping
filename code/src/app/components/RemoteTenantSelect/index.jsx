import React, { useState } from 'react'
import { TreeSelect } from '@uyun/components'

const { TreeNode } = TreeSelect

const TenantSelect = ({ value, onChange = () => {}, ...restProps }) => {
  const [list, setList] = useState({})

  const renderTreeNode = (node) => {
    const { id, name, children, isLeaf } = node || {}
    const nodeProps = {
      key: id,
      value: id,
      title: name,
      isLeaf
    }

    if (children && children.length > 0) {
      return <TreeNode {...nodeProps}>{children.map(renderTreeNode)}</TreeNode>
    }
    return <TreeNode {...nodeProps} />
  }

  return (
    <TreeSelect
      allowClear
      style={{ width: 200 }}
      placeholder="请选择租户"
      labelInValue
      onDropdownVisibleChange={(visible) => {
        if (visible && !list.id) {
          axios.get(API.queryTenantList).then(setList)
        }
      }}
      {...restProps}
      value={value}
      onChange={onChange}
    >
      {renderTreeNode(list)}
    </TreeSelect>
  )
}

export default TenantSelect

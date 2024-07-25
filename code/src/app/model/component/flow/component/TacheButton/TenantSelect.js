import React, { useState } from 'react'
import { TreeSelect } from '@uyun/components'

const { TreeNode } = TreeSelect

const TenantSelect = ({ value, onChange = () => {}, ...restProps }) => {
  const [list, setList] = useState({})

  const renderTreeNode = node => {
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

  const parseValue = value => {
    if (!value || value.length === 0) {
      return undefined
    }
    if (restProps.multiple) {
      return value.map(item => ({
        label: item.nodeName,
        value: item.nodeId
      }))
    }
    return {
      label: value[0].nodeName,
      value: value[0].nodeId
    }
  }

  const handleChange = value => {
    let nextValue = []

    if (Array.isArray(value)) {
      nextValue = value.map(item => ({
        mode: 0,
        nodeId: item.value,
        nodeName: item.label
      }))
    } else {
      nextValue = [
        {
          mode: 0,
          nodeId: value.value,
          nodeName: value.label
        }
      ]
    }

    onChange(nextValue)
  }

  return (
    <TreeSelect
      style={{ width: 200 }}
      placeholder="请选择租户"
      labelInValue
      onDropdownVisibleChange={visible => {
        if (visible && !list.id) {
          axios.get(API.queryTenantList).then(setList)
        }
      }}
      value={parseValue(value)}
      onChange={handleChange}
      {...restProps}
    >
      {renderTreeNode(list)}
    </TreeSelect>
  )
}

export default TenantSelect

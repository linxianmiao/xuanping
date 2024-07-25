import React, { FC, ReactElement } from 'react'
import { TreeSelect } from '@uyun/components'
const TreeNode = TreeSelect.TreeNode

interface TreeVos {
  color?: string
  label: string
  select: number
  value: string
  children: TreeVos[]
}

interface Props {
  name?: string
  treeVos: TreeVos[]
}

const renderTreeNodes = (data: TreeVos[], title: string[]) => {
  return data.map(item => {
    const { value, label, children } = item
    const titles = [...title, label]
    const nodeProps = {
      key: value,
      dataRef: item,
      title: label,
      value,
      label: titles.join(' / ')
    }
    if (children && children.length > 0) {
      return <TreeNode {...nodeProps}>{renderTreeNodes(children, titles)}</TreeNode>
    }
    return <TreeNode {...nodeProps} />
  })
}

const TreeSel: FC<Props> = props => {
  const { treeVos } = props
  return <TreeSelect>{renderTreeNodes(treeVos, [])}</TreeSelect>
}

export default TreeSel

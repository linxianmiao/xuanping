import React from 'react'
import { Tree, Menu } from '@uyun/components'

const DirectoryTree = Tree.DirectoryTree
const { TreeNode } = Tree

const Categories = (props) => {
  const { categoryKey, data, showFollow, onSelect } = props

  const renderTreeNodes = (data) => {
    return _.map(data, (item) => {
      if (!_.isEmpty(item.children)) {
        return (
          <TreeNode key={item.id} title={item.name}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} title={item.name} isLeaf />
    })
  }

  return (
    <DirectoryTree
      showIcon={false}
      // expandAction={false}
      selectedKeys={[categoryKey]}
      onSelect={(keys) => onSelect(keys[0])}
    >
      {showFollow && <TreeNode key="collect" title="我的收藏" isLeaf />}
      {renderTreeNodes(data)}
    </DirectoryTree>
  )
}

Categories.defaultProps = {
  showFollow: true,
  categoryKey: undefined,
  data: [],
  onSelect: () => {}
}

export default Categories

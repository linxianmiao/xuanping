import React, { Component } from 'react'
import { Tree } from '@uyun/components'
import classnames from 'classnames'
import Search from './search'
const TreeNode = Tree.TreeNode
class DepartmentSelect extends Component {
    state = {
      expandedKeys: []
    }

    renderTreeNodes = data => {
      return data.map(item => {
        if (item.childrens) {
          return (
            <TreeNode title={item.name} key={item.id} dataRef={item}>
              {this.renderTreeNodes(item.childrens)}
            </TreeNode>
          )
        }
        return <TreeNode title={item.name} key={item.id} dataRef={item} />
      })
    }

    // 展开收起节点
    handleExpand = expandedKeys => {
      this.setState({ expandedKeys })
    }

    onCheck = (checkedKeys, e) => {
      const { selectsType, tab } = this.props
      const selectType = selectsType[tab]
      if (selectType === 'radio') {
        if (e.checked) {
          this.props.setSelects(this.props.tab, [e.node.props.dataRef])
        } else {
          this.props.setSelects(this.props.tab, _.filter(this.props.selects, select => select.id !== e.node.props.dataRef.id))
        }
      } else {
        if (e.checked) {
          this.props.setSelects(this.props.tab, [...this.props.selects, e.node.props.dataRef])
        } else {
          this.props.setSelects(this.props.tab, _.filter(this.props.selects, select => select.id !== e.node.props.dataRef.id))
        }
      }
    }

    // 关键字 查找
    handleSearch= value => {
      const { query, tab } = this.props
      this.props.onSearch(tab, { ...query[tab], kw: value }, 'replace')
    }

    render () {
      const { lists, query, tab, selectsType } = this.props
      const { kw } = query[tab]
      const { expandedKeys } = this.state
      const checkedKeys = _.map(this.props.selects, select => select.id) || []
      const selectType = selectsType[tab]
      return (
        <div className={classnames('new-users-modal-section-wrap clearfix', {
          'tree-radio': selectType === 'radio'
        })}>
          <Search
            kw={kw}
            tab={tab}
            handleSearch={this.handleSearch} />
          <Tree
            showLine
            checkable
            checkStrictly
            expandedKeys={expandedKeys}
            onExpand={this.handleExpand}
            onCheck={this.onCheck}
            checkedKeys={checkedKeys}>
            {this.renderTreeNodes(lists)}
          </Tree>
        </div>
      )
    }
}

export default DepartmentSelect

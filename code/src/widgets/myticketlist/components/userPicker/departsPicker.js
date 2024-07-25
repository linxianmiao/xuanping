import React, { Component } from 'react'
import { Tree, Empty, Form, Input } from '@uyun/components'
import { observer } from 'mobx-react'
import { UserPickStore } from '../../userpicker.store'
import { flatDeparts } from './config'
import { inject } from '@uyun/core'
const { TreeNode } = Tree

@observer
class DepartsPicker extends Component {
  @inject(UserPickStore) store
  state = {
    expandedKeys: [],
    treeList: [],
    query: {
      type: 2,
      departId: undefined,
      kw: undefined
    }
  }

  componentDidMount() {
    this.getList()
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.childrens) {
        return (
          <TreeNode title={item.name} key={item.id} dataRef={item} isLeaf={item.isLeaf === 0}>
            {this.renderTreeNodes(item.childrens)}
          </TreeNode>
        )
      }
      return <TreeNode title={item.name} key={item.id} dataRef={item} isLeaf={item.isLeaf === 0} />
    })
  }

  // 展开收起节点
  handleExpand = (expandedKeys) => {
    this.setState({ expandedKeys })
  }

  onCheck = (checkedKeys, e) => {
    const { selectionType, value } = this.props
    const departs = (value.departs || []).concat(_.filter(value.all, (d) => d.type === 'departs'))
    const isSingle = selectionType === 'radio'
    let currentDepart = e.node.props.dataRef
    currentDepart.type = currentDepart.type || 'departs'
    let nextDeparts = []
    if (e.checked) {
      currentDepart = flatDeparts([e.node.props.dataRef])
      nextDeparts = isSingle ? [...currentDepart] : [...departs, ...currentDepart]
      nextDeparts = _.uniqBy(nextDeparts, 'id')
    } else {
      nextDeparts = _.filter(departs, (depart) => depart.id !== currentDepart.id)
    }

    nextDeparts = _.map(nextDeparts, (depart) => _.pick(depart, ['id', 'name', 'type']))
    const clearValue = _.map(_.entries(value), (item) => [item[0], isSingle ? [] : item[1]])
    this.props.onChange(_.assign({}, _.fromPairs(clearValue), { all: nextDeparts }))
  }

  // 关键字 查找
  handleSearch = (query) => {
    this.setState(
      {
        query,
        expandedKeys: []
      },
      () => {
        this.getList()
      }
    )
  }

  onLoadData = (treeNode) => this.getList(treeNode)

  getList = async (treeNode) => {
    const { treeList, query } = this.state
    const departId = treeNode ? treeNode.props.dataRef.id : undefined
    const nextQuery = _.assign({}, query, { departId })
    const res = await this.props.userPickStore.getList(nextQuery)
    if (treeNode) {
      treeNode.props.dataRef.childrens = res.list
    }
    this.setState({
      query: nextQuery,
      treeList: treeNode ? [...treeList] : res.list
    })
    return res
  }

  render() {
    const { expandedKeys, treeList, query } = this.state
    const { value } = this.props
    // const { departs } = this.props.value;
    const departs = (value.departs || []).concat(_.filter(value.all, (d) => d.type === 'departs'))
    const checkedKeys = _.map(departs, (select) => select.id) || []
    return (
      <div>
        <Form layout="inline">
          <Form.Item>
            <Input.Search
              allowClear
              enterButton
              placeholder="请输入关键字"
              onSearch={(value) => {
                this.handleSearch(_.assign({}, query, { kw: value }))
              }}
              onClear={(e) => {
                this.handleSearch(_.assign({}, query, { kw: e.target.value }))
              }}
            />
          </Form.Item>
        </Form>
        {_.isEmpty(treeList) ? (
          <Empty type="data" />
        ) : (
          <Tree
            checkable
            checkStrictly
            loadedKeys={[]}
            onLoad={this.onLoad}
            loadData={this.onLoadData}
            expandedKeys={expandedKeys}
            onExpand={this.handleExpand}
            onCheck={this.onCheck}
            checkedKeys={checkedKeys}
          >
            {this.renderTreeNodes(treeList)}
          </Tree>
        )}
      </div>
    )
  }
}

export default DepartsPicker

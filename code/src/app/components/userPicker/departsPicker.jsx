import React, { Component } from 'react'
import { Tree, Empty, Form, Input } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { flatDeparts } from './config'
const TreeNode = Tree.TreeNode

@inject('userPickStore')
@observer
export default class DepartsPicker extends Component {
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
      return (
        <TreeNode
          title={
            this.state.query.kw && item.isLeaf === 0 && item.name != item.departPath
              ? item.name + ' ' + '（' + item.departPath + '）'
              : item.name
          }
          key={item.id}
          dataRef={item}
          isLeaf={item.isLeaf === 0}
        />
      )
    })
  }

  // 展开收起节点
  handleExpand = (expandedKeys) => {
    this.setState({ expandedKeys })
  }

  onCheck = (checkedKeys, e) => {
    const { selectionType, value } = this.props
    const { all } = value
    const isSingle = selectionType === 'radio'
    let currentDepart = e.node.props.dataRef

    let nextValue = []
    if (e.checked) {
      currentDepart = flatDeparts([e.node.props.dataRef]).map((item) => ({
        ...item,
        type: 'departs'
      }))
      nextValue = isSingle ? [...currentDepart] : [...all, ...currentDepart]
      // nextValue = _.uniqBy(nextValue, 'id')
    } else {
      nextValue = _.filter(all, (item) => item.id !== currentDepart.id)
    }

    nextValue = _.map(nextValue, (item) => {
      if (item.type === 2) {
        return _.pick(item, ['id', 'name', 'type'])
      }
      return item
    })
    const clearValue = _.map(_.entries(value), (item) => [item[0], isSingle ? [] : item[1]])
    nextValue = _.uniqBy(nextValue, (item) => item.id || item.groupId)
    this.props.onChange(_.assign({}, _.fromPairs(clearValue), { all: nextValue }))
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
    const { extendQuery = {} } = this.props
    const { treeList, query } = this.state
    const departId = treeNode ? treeNode.props.dataRef.id : undefined
    const nextQuery = _.assign({}, query, { departId }, extendQuery)
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
    const checkedKeys = _.filter(this.props.value.all, (item) => item.type === 'departs').map(
      (item) => item.id
    )

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
            expandedKeys={expandedKeys}
            checkedKeys={checkedKeys}
            onLoad={this.onLoad}
            loadData={this.onLoadData}
            onExpand={this.handleExpand}
            onCheck={this.onCheck}
          >
            {this.renderTreeNodes(treeList)}
          </Tree>
        )}
      </div>
    )
  }
}

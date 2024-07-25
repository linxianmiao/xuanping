import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Tree, Menu, Card, Input, Table, Button } from '@uyun/components'
import { getUsersNew } from './config'
import './approve.less'

import _ from 'lodash'

const { Search } = Input
const TreeNode = Tree.TreeNode

@inject('userPickStore')
@observer
class ApproveModelTable extends Component {
  state = {
    menuList: [
      {
        label: '部门负责人',
        value: '1'
      },
      {
        label: '高级经理',
        value: '2'
      },
      {
        label: '部门内流转',
        value: '3'
      }
    ],
    userList: [],
    userType: '1',
    departId: '',
    expandedKeys: [],
    treeList: [],
    query: {
      type: 2,
      departId: undefined,
      kw: undefined
    },
    userQuery: {
      pageIndex: 1,
      pageSize: 9999,
      userInfo: '',
      groupId: ''
    },
    initValue: [] // 保存选中的人员全部信息，用于列表展示
  }

  componentDidMount() {
    console.log(this.props)
    this.getList() // 获取机构列表
  }

  // 用户列表
  getUsers = async () => {
    const { userQuery, query, userType } = this.state
    const params = {
      ...userQuery,
      departId: query.departId,
      userType: Number(userType)
    }
    const { extendQuery, method } = this.props
    // const res = await getUsers(params, this.props.userPickStore, extendQuery, method)
    const res = await getUsersNew(params, this.props.userPickStore, extendQuery, method)
    // console.log(params, res, '----res-------')
    this.setState({ userList: res?.records || [] })
  }

  renderTreeNodes = (data) => {
    return _.map(data, (item) => {
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
            this.state.query.kw && item.isLeaf === 0 && item.name !== item.departPath
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

  // 机构列表
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

  renderTreeNodes = (data) => {
    return _.map(data, (item) => {
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

  handleSelect = (selectedKeys) => {
    this.setState(
      {
        query: _.assign({}, this.state.query, { departId: selectedKeys[0] }),
        departId: selectedKeys[0]
      },
      () => {
        this.getUsers()
      }
    )
  }

  handleUserSearch = (value) => {
    this.setState({ userQuery: value }, () => {
      this.getUsers()
    })
  }

  // 数据去重
  handleChangeValue = (value) => {
    const { initValue } = this.state
    let nextModalValue = [...initValue, ...value]
    const map = new Map()
    for (const item of nextModalValue) {
      if (!map.has(item.userId || item.id)) {
        map.set(item.userId || item.id, item)
      }
    }
    nextModalValue = [...map.values()]
    this.setState({ initValue: nextModalValue })
  }

  getColumns = (type = null) => {
    const { handleClear } = this.props
    const columns = [
      {
        title: '姓名',
        dataIndex: 'realname',
        key: 'realname',
        width: 150
      },
      {
        title: '用户名',
        dataIndex: 'account',
        key: 'account',
        width: 150
      },
      {
        title: '归属机构',
        dataIndex: 'departs',
        key: 'departs'
      }
    ]
    if (type === 'selected') {
      columns.push({
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        width: 60,
        render: (text, record) => {
          return (
            <a
              onClick={() => {
                const id = record.userId || record.id
                this.setState({
                  initValue: _.filter(
                    this.state.initValue,
                    (item) => (item.userId || item.id) !== id
                  )
                })
                handleClear(id)
              }}
            >
              移除
            </a>
          )
        }
      })
    }
    return columns
  }

  selectedValue = (value, initValue) => {
    const initValueIds = _.map(initValue, (item) => item.userId || item.id)
    const data = _.reduce(
      value,
      (curr, pre) => {
        const id = pre.userId || pre.id
        if (initValueIds.includes(id)) {
          const data = _.filter(initValue, (item) => item.userId === id)[0]
          curr.push(data)
        }
        return curr
      },
      []
    )
    return data
  }

  render() {
    // const { value, onChange, onChangeUseVariable, useVariable, selectionType } = this.props
    const { menuList, userList, userType, expandedKeys, treeList, query, userQuery, initValue } =
      this.state
    const { value, onChange, handleClear } = this.props
    const selectedValue = this.selectedValue(value?.all, initValue) || []
    return (
      <div className="approveWrapper">
        <Card className="approveWrapperLeft">
          <Menu
            mode="vertical"
            defaultSelectedKeys={[userType]}
            onClick={({ item, key, keyPath, domEvent }) => {
              this.setState({ userType: key }, () => {
                if (query.departId) {
                  this.getUsers()
                }
              })
            }}
          >
            {_.map(menuList, (list) => {
              return <Menu.Item key={list.value}>{list.label}</Menu.Item>
            })}
          </Menu>
        </Card>
        <Card className="approveWrapperMiddle">
          <p className="approvetilte">机构列表</p>
          <Search
            allowClear
            enterButton
            placeholder="关键词查询"
            onSearch={(value) => {
              this.handleSearch(_.assign({}, query, { kw: value }))
            }}
            onClear={(e) => {
              this.handleSearch(_.assign({}, query, { kw: e.target.value }))
            }}
          />
          <Tree
            loadedKeys={[]}
            expandedKeys={expandedKeys}
            loadData={this.onLoadData}
            onExpand={this.handleExpand}
            onSelect={this.handleSelect}
            className="approveWrapperMiddleTree"
          >
            {this.renderTreeNodes(treeList)}
          </Tree>
        </Card>
        <div className="approveWrapperRight">
          <Card>
            <p className="approvetilte">用户列表</p>
            <Search
              allowClear
              placeholder="关键词查询"
              onSearch={(value) => {
                this.handleUserSearch(_.assign({}, userQuery, { userInfo: value }))
              }}
              onClear={(e) => {
                this.handleUserSearch(_.assign({}, userQuery, { userInfo: e.target.value }))
              }}
              enterButton="查询"
            />
            <Table
              style={{ marginTop: '10px' }}
              columns={this.getColumns()}
              dataSource={userList}
              pagination={false}
              bordered
              scroll={{
                y: 150
              }}
              onRow={(record) => {
                return {
                  onClick: (event) => {
                    const nextRecord = _.clone(record)
                    nextRecord.type = 'users'
                    this.handleChangeValue([nextRecord])
                    onChange(nextRecord)
                  } // 点击行
                }
              }}
            />
          </Card>
          <div className="approveWrapperRightBtn">
            <Button
              size={'small'}
              onClick={() => {
                const list = _.cloneDeep(userList)
                _.forEach(list, (item) => {
                  item.type = 'users'
                })
                this.handleChangeValue(userList)
                onChange(list)
              }}
            >
              全选
            </Button>
            <Button
              size={'small'}
              onClick={() => {
                this.setState({ initValue: [] })
                handleClear('', 'all')
              }}
            >
              清除
            </Button>
          </div>

          <Card>
            <p className="approvetilte">已选用户列表</p>
            <Table
              columns={this.getColumns('selected')}
              dataSource={selectedValue}
              pagination={false}
              bordered
              scroll={{
                y: 180
              }}
            />
          </Card>
        </div>
      </div>
    )
  }
}
export default ApproveModelTable

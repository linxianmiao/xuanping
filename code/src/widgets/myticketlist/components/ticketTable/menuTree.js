import React, { Component } from 'react'
import { Tree, Input, message } from '@uyun/components'
import {
  EditOutlined,
  PlusOutlined,
  CloseOutlined,
  CheckOutlined,
  DeleteOutlined
} from '@uyun/icons'
import { observer } from 'mobx-react'
import '../styles/tree.less'
import _ from 'lodash'

const uuid = () => Math.random().toString(16).slice(2)

const { TreeNode } = Tree

@observer
class MenuTree extends Component {
  // constructor(props) {
  //   super(props)

  // }

  state = {
    data: [],
    expandedKeys: [],
    isTopShow: false,
    topNode: '',
    isShow: null
  }

  componentDidMount() {
    this.queryList()
  }
  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.data, this.props.data)) {
      this.queryList()
    }
  }

  queryList = () => {
    const { data } = this.props
    let list = _.cloneDeep(data)
    list = _.map(list, (item) => {
      if (item.children) {
        item.children = _.map(item.children, (v) => {
          return {
            defaultValue: v.classifyName,
            ...v
          }
        })
      }
      return {
        defaultValue: item.classifyName,
        ...item
      }
    })
    this.setState({ data: list })
  }

  editNode = (key, data) =>
    data.forEach((item) => {
      if (item.classifyCode === key) {
        item.isEditable = true
        item.type = 'edit'
      } else {
        item.isEditable = false
      }
      // item.classifyName = item.defaultValue // 当某节点处于编辑状态，并改变数据，点击编辑其他节点时，此节点变成不可编辑状态，value 需要回退到 defaultvalue
      if (item.children) {
        this.editNode(key, item.children)
      }
    })

  addNode = (record, data) => {
    data.forEach((item) => {
      if (item.classifyCode === record?.classifyCode) {
        if (item.children) {
          item.children.unshift({
            classifyName: '',
            isEditable: true,
            classifyCode: uuid(), // 这个 key 应该是唯一的
            superCode: record.id + '',
            type: 'add'
          })
        } else {
          item.children = []
          item.children.push({
            classifyName: '',
            isEditable: true,
            classifyCode: uuid(), // 这个 key 应该是唯一的
            superCode: record.id + '',
            type: 'add'
          })
        }
        return
      }
      if (item.children) {
        this.addNode(item, item.children)
      }
    })
  }

  onEdit = (item) => {
    const list = _.cloneDeep(this.state.data)
    this.editNode(item.classifyCode, list)
    this.setState({ data: list.slice() })
  }

  changeNode = (key, value, data) =>
    data.forEach((item) => {
      if (item.classifyCode === key) {
        item.classifyName = value
      }
      if (item.children) {
        this.changeNode(key, value, item.children)
      }
    })

  onChange = async (e, key) => {
    this.changeNode(key, e.target.value, this.state.data)
    this.setState({ data: this.state.data.slice() })
  }

  onAdd = async (item = '') => {
    let expandedKeyArr = _.cloneDeep(this.props.expandedKeys)
    if (
      this.props.expandedKeys.indexOf(item?.classifyCode) === -1 &&
      !_.isEmpty(item?.classifyCode)
    ) {
      expandedKeyArr.push(item.classifyCode)
    }
    await this.props.onExpand(expandedKeyArr.slice())
    const { isTopShow, changeIsTopShow } = this.props
    if (isTopShow) {
      //只能由一个设置框
      this.setState({ topNodeName: '' }, () => {
        changeIsTopShow()
      })
    }
    this.onChangeNode(this.state.data, item)
    this.addNode(item, this.state.data)
    this.setState({ data: this.state.data.slice() })
  }

  saveNode = (key, data) =>
    data.forEach((item) => {
      if (item.classifyCode === key) {
        item.defaultValue = item.classifyName
      }
      if (item.children) {
        this.saveNode(key, item.children)
      }
      item.isEditable = false
    })

  onSave = (key) => {
    this.saveNode(key, this.state.data)
    this.setState({ data: this.state.data.slice() })
  }

  deleteNode = (key, data) =>
    data.forEach((item, index) => {
      if (item.classifyCode === key) {
        data.splice(index, 1)
        return
      } else {
        if (item.children) {
          this.deleteNode(key, item.children)
        }
      }
    })

  onDelete = (key) => {
    this.deleteNode(key, this.state.data)
    this.setState({ data: this.state.data.slice() })
  }

  closeNode = (key, defaultValue, data) =>
    data.forEach((item) => {
      item.isEditable = false
      if (item.classifyCode === key) {
        if (_.isEmpty(_.trim(defaultValue))) {
          this.deleteNode(key, data)
        }
        item.classifyName = defaultValue
      }
      if (item.children) {
        this.closeNode(key, defaultValue, item.children)
      }
    })

  onClose = (key, defaultValue) => {
    this.closeNode(key, defaultValue, this.state.data)
    this.setState({ data: this.state.data })
  }

  renderTreeNodes = (data) => {
    const nodeArr = data.map((item) => {
      if (item.isEditable) {
        item.title = (
          <div className="tree-node">
            <Input
              value={item.classifyName || ''}
              onChange={(e) => {
                e.stopPropagation()
                this.onChange(e, item.classifyCode)
              }}
            />

            <CheckOutlined
              style={{ marginLeft: 10 }}
              onClick={(e) => {
                e.stopPropagation()
                if (item?.type === 'add') {
                  if (_.isEmpty(_.trim(item.classifyName))) {
                    message.info('不可为空')
                    return
                  }
                  this.props.handleAdd(item.classifyName, item)
                  this.onClose(item.classifyCode, item.classifyName)
                } else {
                  this.props.handleEdit(item)
                }
              }}
            />

            <CloseOutlined
              style={{ marginLeft: 10 }}
              onClick={() => {
                this.onClose(item.classifyCode, item.defaultValue)
              }}
            />
          </div>
        )
      } else {
        item.title = (
          <div
            className="tree-title-wrapper"
            onMouseEnter={() => {
              this.setState({ isShow: item.classifyCode })
            }}
            onMouseLeave={() => {
              this.setState({ isShow: null })
            }}
          >
            <span className="tree-title">{item.classifyName}</span>
            {item.classifyName !== '默认分组' && this.state.isShow === item.classifyCode && (
              <span>
                {_.isEmpty(item.superCode) && (
                  <PlusOutlined
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (_.isEmpty(item?.children)) {
                        let node = {}
                        node.dataRef = item
                        await this.onLoadData(node)
                      }

                      this.onAdd(item)
                    }}
                  />
                )}
                <EditOutlined
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    this.onChangeNode(data)
                    this.onEdit(item)
                  }}
                />

                <DeleteOutlined
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    this.props.handleDelete(item)
                  }}
                />
              </span>
            )}
          </div>
        )
      }

      if (
        _.isEmpty(item.superCode) &&
        item.classifyName !== '默认分组' &&
        (item?.haveChild || !_.isEmpty(item?.children))
      ) {
        return (
          <TreeNode title={item.title} key={item.classifyCode} dataRef={item} isLeaf={false}>
            {this.renderTreeNodes(item?.children || [])}
          </TreeNode>
        )
      }

      return <TreeNode title={item.title} key={item.classifyCode} dataRef={item} isLeaf={true} />
    })

    return nodeArr
  }

  onLoadData = (node) =>
    new Promise(async (resolve) => {
      if (node?.dataRef?.id) {
        await this.props.getNodeList(node?.dataRef?.id)
        resolve(undefined)
      }
    })

  onChangeNode = (data, list = '') => {
    _.forEach(data, (item) => {
      if (item?.isEditable) {
        if (list.id === item.superCode) {
          return
        }
        this.onClose(item.classifyCode, item.defaultValue)
      }
      if (item?.children) {
        this.onChangeNode(item?.children)
      }
    })
  }

  render() {
    const { data, topNodeName } = this.state
    const {
      isTopShow,
      changeIsTopShow,
      handleAdd,
      selectedKeys,
      onSelect,
      expandedKeys,
      loadedKeys,
      onLoad
    } = this.props

    if (isTopShow) {
      this.onChangeNode(data)
    }
    return (
      <div className="tree-wrapper">
        {isTopShow && (
          <div className="tree-node-top">
            <Input
              value={topNodeName || ''}
              onChange={(e) => this.setState({ topNodeName: e.target.value })}
            />

            <CheckOutlined
              className="iconfont-icon"
              style={{ marginLeft: 10 }}
              onClick={(e) => {
                e.stopPropagation()
                if (_.isEmpty(_.trim(topNodeName))) {
                  message.info('不可为空')
                  return
                }
                handleAdd(topNodeName)
                this.setState({ topNodeName: '' }, () => {
                  changeIsTopShow()
                })
              }}
            />

            <CloseOutlined
              className="iconfont-icon"
              style={{ marginLeft: 10 }}
              onClick={(e) => {
                e.stopPropagation()
                this.setState({ topNodeName: '' }, () => {
                  changeIsTopShow()
                })
              }}
            />
          </div>
        )}
        <Tree
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          onExpand={this.props.onExpand}
          loadData={this.onLoadData}
          onLoad={onLoad}
          loadedKeys={loadedKeys}
          onSelect={onSelect}
        >
          {this.renderTreeNodes(_.cloneDeep(data))}
        </Tree>
      </div>
    )
  }
}

export default MenuTree

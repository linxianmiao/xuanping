
import React from 'react'
import { Tree, Switch, Divider, Row, Col, message, Modal } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import moment from 'moment'
const { TreeNode } = Tree
const confirm = Modal.confirm
const x = 3
const y = 2
const z = 1
const gData = []

const generateData = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0'
  const tns = _tns || gData

  const children = []
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`
    tns.push({ title: key, key })
    if (i < y) {
      children.push(key)
    }
  }
  if (_level < 0) {
    return tns
  }
  const level = _level - 1
  children.forEach((key, index) => {
    tns[index].children = []
    return generateData(level, key, tns[index].children)
  })
}
generateData(z)
@inject('directoryStore')
@observer
export default class TreeList extends React.Component {
  state = {
    gData,
    // expandedKeys: ['0-0', '0-0-0', '0-0-0-0'],
    parentWidth: 0,
    expandedKeys: []
  }

  onDragEnter = (info) => {
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  }

  onDrop = (info) => {
    const dropKey = info.node.props.eventKey
    const dragKey = info.dragNode.props.eventKey
    const dropPos = info.node.props.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          return callback(item, index, arr)
        }
        if (item.children) {
          return loop(item.children, key, callback)
        }
      })
    }
    const data = [...this.state.gData]

    // Find dragObject
    let dragObj
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1)
      dragObj = item
    })

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj)
      })
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item) => {
        item.children = item.children || []
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.unshift(dragObj)
      })
    } else {
      let ar
      let i
      loop(data, dropKey, (item, index, arr) => {
        ar = arr
        i = index
      })
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj)
      } else {
        ar.splice(i + 1, 0, dragObj)
      }
    }

    this.setState({
      gData: data
    })
  }

  componentDidMount() {
    // 拖动区域列与头对齐
    this.setState({
      parentWidth: `${(window.document.getElementById('dir_wrap').offsetWidth - 8) * 0.125}px`
    })
    this.screenChange()
  }

  screenChange() {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  resize = () => {
    this.setState({
      parentWidth: `${(window.document.getElementById('dir_wrap').offsetWidth - 8) * 0.125}px`
    })
  }

  onExpand = (expandedKeys, e) => new Promise((resolve) => {
    const treeNode = e.node
    this.setState({
      expandedKeys
    })
    if ((treeNode.props.dataRef.children && treeNode.props.dataRef.children.length > 0) || !e.expanded) {
      resolve()
      return
    }
    const data = {
      superiorCode: treeNode.props.eventKey
    }
    this.props.directoryStore.getDirList(data)
    resolve()
  })

  deleteItem = (item) => {
    const type = item.type === 'GROUP' ? i18n('classify', '分类') : i18n('directory', '目录')
    confirm({
      title: `${i18n('queryer.delete.tips', '你确定要删除')}${type}${i18n('queryer.delete.tips1', '吗？')}`,
      content: i18n('queryer.delete.content', '删除后，数据将无法恢复'),
      onOk: () => {
        this.props.directoryStore.deleteDirectory(item.id).then(res => {
          if (res === '200') {
            message.success(i18n('delete_success', '删除成功'))
          }
        })
      },
      onCancel() {
      }
    })
  }

  changeChecked = (item, checked) => {
    const status = checked ? 1 : 0
    const id = item.id
    this.props.directoryStore.directoryChangeStatus({ id: id, status })
  }

  render() {
    const { parentWidth, expandedKeys } = this.state
    const { dirList } = toJS(this.props.directoryStore)
    const loop = (data) => data.map((item, index) => {
      const title = <div key={index}>
        <div className={`rol12`}>{item.name}</div>
        <div className={`right`} style={{ width: parentWidth }}>
          <span onClick={() => this.props.editItem(item)}>{i18n('edit', '编辑')}</span>
          <Divider type="vertical" />
          <span onClick={() => { this.deleteItem(item) }}>{i18n('delete', '删除')}</span>
        </div>
        <div className={`right`} style={{ width: parentWidth, textAlign: 'center' }}><Switch checked={item.status === 1} size="small" onChange={(checked) => { this.changeChecked(item, checked) }} /></div>
        <div className={`right`} style={{ width: parentWidth }}>{moment(new Date(item.updateTime).getTime()).format('YYYY-MM-DD HH:mm')}</div>
        <div className={`right`} style={{ width: parentWidth }}>{item.modifier}</div>
      </div>
      if (item.children && item.children.length) {
        return <TreeNode key={item.code} title={title} dataRef={item}>{loop(item.children)}</TreeNode>
      }
      return <TreeNode key={item.code} title={title} isLeaf={item.type !== 'GROUP'} dataRef={item} />
    })
    return (
      <div className="dir_wrap" id="dir_wrap">
        <Row className="list_title">
          <Col span={12}>{i18n('name', '名称')}</Col>
          <Col span={3}>{i18n('modifier', '修改人')}</Col>
          <Col span={3}>{i18n('change_time', '修改时间')}</Col>
          <Col span={3} style={{ textAlign: 'center' }}>{i18n('ticket.create.resState', '状态')}</Col>
          <Col span={3}>{i18n('operation', '操作')}</Col>
        </Row>
        <Tree
          className="draggable-tree"
          // draggable
          // onDragEnter={this.onDragEnter}
          // onDrop={this.onDrop}
          expandedKeys={expandedKeys}
          onExpand={this.onExpand}
        >
          {loop(dirList)}
        </Tree>
      </div>

    )
  }
}
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { TicketlistStore } from '../../ticketlist.store'
import { Menu, message, Modal, TreeSelect, AutoComplete } from '@uyun/components'
import { PlusSquareOutlined } from '@uyun/icons'
import TicketHeader from '../ticketHeader'
import TicketTable from './index'
import '../styles/myAttention.less'
import MenuTree from './menuTree'
import _ from 'lodash'

const uuid = () => Math.random().toString(16).slice(2)

@observer
class MyAttention extends Component {
  @inject(TicketlistStore) store
  state = {
    data: [],
    SubMenuList: '',
    selectedKeys: [],
    openKeys: [],
    moveTreeList: [], //移动弹框的数据
    open: false,
    visible: false,
    selectedValue: '',
    ticketIds: [],
    selectedRecord: {},
    options: [],
    height: 400,
    confirmLoading: false,
    isTopShow: false,
    expandedKeys: [], //记录已展开的节点
    loadedKeys: [], //记录加载的节点
    inputValue: ''
  }

  tabRef = React.createRef()

  treeRef = React.createRef()

  resizeUpdate = () => {
    let height = document.querySelector('#itsm-ticket-list')?.getBoundingClientRect().height || 600
    height = height - 112
    this.setState({ height })
  }

  handleAdd = async (value = '', item = {}) => {
    const superCode = item?.superCode || ''
    let param = {
      classifyName: value,
      classifyCode: uuid(),
      superCode: item?.superCode || '',
      createUser: this.props.USER_INFO?.userNo
    }
    let res = await this.store.saveTreeList(param)
    if (res) {
      message.success('保存成功')
      this.getTreeList('', superCode)
    } else {
      message.error('保存失败')
    }
  }

  handleEdit = async (item) => {
    let param = _.omit(item, ['title', 'isEditable', 'defaultValue', 'children'])
    let res = await this.store.saveTreeList(param)
    if (res) {
      message.success('保存成功')
      this.getTreeList('', '')
    } else {
      message.success('保存失败')
    }
  }
  handleDelete = async (item) => {
    Modal.confirm({
      title: '子分组将同时会被删除，被删除分组的所有流程单会被移至默认分组，是否确认?',
      onOk: async () => {
        const res = await this.store.deleteTreeList(item.id)
        if (res) {
          if (item.classifyCode === this.state.selectedKeys[0]) {
            this.getTreeList('', '', true)
          } else {
            this.getTreeList('', item.superCode)
          }
          message.success('删除成功')
        } else {
          message.error('删除失败')
        }
      }
    })
  }

  getNodeList = async (key) => {
    let list = _.cloneDeep(this.state.data)
    let res = await this.store.queryTreeList(key, this.props.USER_INFO.userNo)
    _.forEach(list, (item) => {
      if (item.id === key) {
        item.children = res
      }
    })
    this.setState({ data: list })
  }

  componentDidMount() {
    this.getTreeList('', '', true)
    this.resizeUpdate()
  }

  onOpenChange = (openKeys) => {
    this.setState({ openKeys })
  }

  getTreeList = async (code, superCode = '', init = false) => {
    const res = await this.store.queryTreeList(code, this.props.USER_INFO.userNo, init)
    this.setState({ data: res }, async () => {
      if (init && !_.isEmpty(res) && Array.isArray(res)) {
        const data = res[0]
        if (_.isEmpty(data.superCode)) this.setState({ selectedKeys: [data.classifyCode] })
      }

      const { expandedKeys } = this.state
      if (!_.isEmpty(expandedKeys)) {
        let lists = _.cloneDeep(res)
        for (const item of lists) {
          if (expandedKeys.includes(item.classifyCode)) {
            const list = await this.store.queryTreeList(item.id, this.props.USER_INFO.userNo)
            item.children = list
          }
        }
        this.setState({ data: lists })
      }
    })
  }

  onSelect = (key, node) => {
    if (
      node?.node?.dataRef?.type === 'add' ||
      node?.node?.dataRef?.type === 'edit' ||
      _.isEmpty(key)
    ) {
      return
    }

    this.setState({ selectedKeys: key }, () => {
      this.store.setValue({ ...this.store.query, classifyCode: key[0] }, 'query')
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeKey !== this.props.activeKey) {
      if (this.props.activeKey === 'myfollow') {
        this.getTreeList('', '', true)
      }
      this.setState({ expandedKeys: [], loadedKeys: [], inputValue: '' })
    }
  }

  handleOk = async () => {
    const { selectedValue, ticketIds } = this.state
    if (!_.isEmpty(selectedValue)) {
      const params = {
        ticketIds: ticketIds,
        classifyCode: selectedValue,
        createUser: this.props.USER_INFO.userNo
      }
      this.setState({ confirmLoading: true })
      const res = await this.store.saveFollowTicket(params)
      if (res) {
        message.success('移动成功')
        this.setState({ confirmLoading: false })
        this.onCancel()
        this.props.onSelectedRow([])
        this.store.setValue({ ...this.store.query, pageNum: 1 }, 'query')
      } else {
        message.error('移动失败')
        this.setState({ confirmLoading: false })
      }
    } else {
      message.error('数据不可为空')
    }
  }

  onDropdownVisibleChange = (open) => {
    this.setState({ visible: open })
    if (open) {
      this.getMoveTreeList('')
    }
  }
  getMoveTreeList = async (code) => {
    const res = await this.store.queryTreeList(code, this.props.USER_INFO.userNo)
    let list = []
    if (res && Array.isArray(res)) {
      list = _.map(res, (item) => {
        return {
          id: item.id,
          value: item.classifyCode,
          title: item.classifyName,
          pId: item.superCode,
          isLeaf: item.classifyName === '默认分组' ? true : false
        }
      })
    }
    this.setState({ moveTreeList: list })
  }

  onLoadData = ({ id }) =>
    new Promise(async (resolve) => {
      const { moveTreeList } = this.state
      const data = _.cloneDeep(moveTreeList)
      if (id) {
        const res = await this.store.queryTreeList(Number(id), this.props.USER_INFO.userNo)
        const list = _.map(res, (item) => {
          return {
            id: item.classifyCode,
            value: item.classifyCode,
            title: item.classifyName,
            pId: item.superCode,
            isLeaf: true
          }
        })
        data.push(...list)
        this.setState({ moveTreeList: data }, () => {
          resolve(undefined)
        })
      }
    })

  handleSelect = (value) => {
    this.setState({ selectedValue: value })
  }

  handleMove = (record) => {
    this.setState({ ticketIds: record }, () => {
      if (!_.isEmpty(record)) {
        this.setState({ open: true })
      }
    })
  }

  onCancel = () => {
    this.setState({ currentItem: [], open: false, selectedValue: [] })
  }
  iuputSearch = async (value) => {
    let options = []
    if (!_.isEmpty(value)) {
      const res = await this.store.queryTreeList('', this.props.USER_INFO.userNo, false, value)
      options = _.map(res, (item) => {
        return {
          ...item,
          label: item.classifyName,
          value: item.classifyName
        }
      })
    }
    this.setState({ options })
  }
  inputSelect = (value, list) => {
    this.setState({ selectedKeys: [] }, () => {
      this.store.setValue({ ...this.store.query, classifyCode: list.classifyCode }, 'query')
    })
  }
  changeIsTopShow = () => {
    this.setState({ isTopShow: false })
  }
  onExpand = (expandedKeys) => {
    //记录折叠的key值
    const { loadedKeys } = this.state
    this.setState({
      expandedKeys,
      loadedKeys: _.filter(loadedKeys, (d) => _.includes(expandedKeys, d))
    })
  }

  onLoad = (loadedKeys) => {
    this.setState({ loadedKeys })
  }
  inputChange = (value) => {
    this.setState({ inputValue: value })
  }

  render() {
    const {
      data,
      selectedKeys,
      moveTreeList,
      open,
      visible,
      options,
      height,
      confirmLoading,
      isTopShow,
      expandedKeys,
      loadedKeys,
      inputValue
    } = this.state
    return (
      <div className="attentionWrapper">
        <div className="attentionWrapper-menu">
          <Menu.MenuList
            showSearch
            bordered
            title="关注项"
            extra={
              <PlusSquareOutlined
                onClick={() => {
                  this.setState({ isTopShow: true, data: data.slice() })
                }}
              />
            }
            style={{ height: height }}
          >
            <div className="menu-auto">
              <AutoComplete
                allowClear
                options={options}
                onSelect={this.inputSelect}
                onSearch={this.iuputSearch}
                onChange={this.inputChange}
                onClear={() => {
                  this.setState({ openKeys: [] })
                  this.getTreeList('', '', true)
                }}
                value={inputValue}
                placeholder="请搜索"
              />
            </div>
            <MenuTree
              ref={this.treeRef}
              data={data}
              store={this.store}
              userNo={this.props.USER_INFO.userNo}
              isTopShow={isTopShow}
              changeIsTopShow={this.changeIsTopShow}
              handleAdd={this.handleAdd}
              handleDelete={this.handleDelete}
              handleEdit={this.handleEdit}
              selectedKeys={selectedKeys}
              onSelect={this.onSelect}
              expandedKeys={expandedKeys}
              onExpand={this.onExpand}
              getNodeList={this.getNodeList}
              onLoad={this.onLoad}
              loadedKeys={loadedKeys}
            />
          </Menu.MenuList>
        </div>
        <div className="attentionWrapper-list">
          <TicketHeader
            selectedRowKeys={this.props.selectedRowKeys}
            onSelectedRow={this.props.onSelectedRow}
            timer={this.props.timer}
            handleChangeTimer={this.props.handleChangeTimer}
            handleDetailTicket={this.props.handleDetailTicket}
            ref={this.tabRef}
            handleMove={this.handleMove}
            getTabCounts={this.props.getTabCounts}
          />
          <TicketTable
            selectedRowKeys={this.props.selectedRowKeys}
            onSelectedRow={this.props.onSelectedRow}
            handleDetailTicket={this.props.handleDetailTicket}
            createUser={this.props.USER_INFO.userNo}
            handleTreeList={this.getTreeList}
            handleMove={this.handleMove}
            activeKey={this.props.activeKey}
          />
        </div>
        <Modal
          open={open}
          onOk={this.handleOk}
          onCancel={this.onCancel}
          destroyOnClose
          confirmLoading={confirmLoading}
        >
          <div>
            移动至：
            <TreeSelect
              treeDataSimpleMode
              style={{
                width: 200
              }}
              open={visible}
              // value={value}
              dropdownStyle={{
                maxHeight: 400,
                overflow: 'auto'
              }}
              placeholder="请选择"
              // onChange={onChange}
              loadData={this.onLoadData}
              onDropdownVisibleChange={this.onDropdownVisibleChange}
              treeData={moveTreeList}
              onSelect={this.handleSelect}
            />
          </div>
        </Modal>
      </div>
    )
  }
}
export default MyAttention

import React, { Component } from 'react'
import { observer, inject, Provider } from 'mobx-react'
import { Button } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import QueryCard from './queryCard'
import './styles/index.less'
import QueryerStore from './store/queryerStore'
import ListStore from './store/listStore'
import TypeModal from './typeModal'
import MenuModal from './menuModal'
import HTML5Backend from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import list from './config/defaultList'
import attribute from '~/list/config/attribute'
const queryerStore = new QueryerStore()
const listStore = new ListStore()
@inject('globalStore')
@observer
class Queryer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      typeVisible: false,
      menuVisible: false,
      editData: {}
    }
  }

  get list() {
    const { modelList, modelAndTacheIdList } = listStore
    const { priorityList } = this.props.globalStore
    return [
      {
        name: i18n('ticket.list.ticketName', '标题'),
        code: 'ticketName',
        type: 'singleRowText'
      },
      {
        name: i18n('ticket.list.ticketNum', '单号'),
        code: 'ticketNum',
        type: 'singleRowText'
      },
      {
        name: i18n('ticket.list.filter.model', '模型'),
        code: 'modelId',
        type: 'modelSelect',
        params: _.map(modelList.slice(1), (item) => ({
          label: item.processName,
          value: item.processId
        }))
      },
      {
        name: i18n('ticket.list.tacheName', '当前节点'),
        code: 'modelAndTacheId',
        type: 'modelTache',
        treeVos: modelAndTacheIdList
      },
      {
        name: i18n('ticket-list-table-th-priority', '优先级'),
        code: 'priority',
        type: 'select',
        params: _.map(priorityList, (item) => ({ value: item.value, label: item.name }))
      },
      ...list
    ]
  }

  componentDidMount() {
    window.LOWCODE_APP_KEY = this.props.appkey
    queryerStore.getMenuList()
    const { allField } = listStore
    if (_.isEmpty(allField.builtinFields)) {
      // listStore.getAllColumns()
    }
    listStore.getModelList()
    listStore.getModelAndTacheIdList()
    listStore.setAttrList(this.list, 'QUERY')
    listStore.setAttrList(attribute, 'COLUMN')
  }
  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  createType = () => {
    this.setState({
      typeVisible: true,
      editData: {}
    })
  }

  createMenuItem = () => {
    this.setState({
      menuVisible: true,
      editData: {}
    })
    listStore.resetFilter()
  }

  onCancel = () => {
    this.setState({
      typeVisible: false,
      menuVisible: false
    })
  }

  editItem = async (item) => {
    const res = await listStore.getMenuDetail(item.id)
    if (res.menuType === 'GROUP') {
      this.setState({
        editData: res,
        typeVisible: true
      })
    } else {
      this.setState({
        editData: res,
        menuVisible: true
      })
    }
  }

  changeEditData = (editData) => {
    this.setState({ editData })
  }

  render() {
    const { typeVisible, menuVisible, editData } = this.state
    const { appIsolation } = this.props
    return (
      <Provider queryerStore={queryerStore} listStore={listStore}>
        <div className="queryer_wrap" id="queryer_wrap">
          <div className="queryer_button_wrap">
            {appIsolation ? null : (
              <Button type="primary" onClick={this.createType} icon={<PlusOutlined />}>
                {i18n('system.queryer.addType', '添加分类')}
              </Button>
            )}
            <Button type="primary" onClick={this.createMenuItem} icon={<PlusOutlined />}>
              {i18n('system.queryer.addMenu', '添加查询器')}
            </Button>
          </div>
          <DndProvider backend={HTML5Backend}>
            <QueryCard
              editItem={this.editItem}
              getList={this.getList}
              appIsolation={appIsolation}
            />
            {typeVisible ? (
              <TypeModal
                visible={typeVisible}
                onCancel={this.onCancel}
                editData={editData}
                getList={this.getList}
                appIsolation={appIsolation}
              />
            ) : null}
            {menuVisible ? (
              <MenuModal
                visible={menuVisible}
                onCancel={this.onCancel}
                editData={editData}
                getList={this.getList}
                changeEditData={this.changeEditData}
                appIsolation={appIsolation}
              />
            ) : null}
          </DndProvider>
        </div>
      </Provider>
    )
  }
}
export default Queryer

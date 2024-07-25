import React from 'react'
import { Button, Menu, message, Spin, Empty } from '@uyun/components'
import { toJS } from 'mobx'
import { withRouter } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { inject, observer } from 'mobx-react'
import HTML5Backend from 'react-dnd-html5-backend'
import update from 'immutability-helper'
import uuid from '~/utils/uuid'
import { PlusOutlined, ExclamationCircleOutlined } from '@uyun/icons'
import DragRow from './dragRow'
import CreateSubTask from './createSubTask'
import DetailDrawer from '~/details/DetailDrawer'
import { getAllFields } from '~/utils/common'
import './index.less'

const MenuItem = Menu.Item
const columnsMap = {
  taskName: i18n('name'),
  taskTicketNum: i18n('ticket.list.ticketNum'),
  taskType: i18n('process-model'),
  taskTache: i18n('ticket-list-table-th-tacheName')
}

const customPrefixColumns = ['taskName', 'taskTicketNum']

const loop = (data, obj) => {
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((d) => {
      if (d.groupId === obj.parentGroupId) {
        if (Array.isArray(d.children)) {
          d.children.push(obj)
        } else {
          d.children = [obj]
        }
      } else {
        loop(d.children, obj)
      }
    })
  }
}

@inject('ticketStore')
@withRouter
@observer
class RelateSubTask extends React.Component {
  state = {
    subProcessList: [],
    visible: false,
    submodelItem: {},
    data: [],
    parentData: {},
    loading: false,
    subDetailRoute: '',
    title: '',
    draftTicketId: ''
  }

  saveDraft = false
  async componentDidMount() {
    const { formList = {} } = this.props
    const { modelId = '' } = formList
    const params = {
      pageNum: 1,
      pageSize: 100,
      using: 1,
      type: 3,
      modelId: modelId
    }
    if (!modelId) return false
    const res = await axios.get(API.getProcessChartList, { params })
    const list = await this.queryRelateTaskList()
    this.props.ticketStore.setRelateSubProcessTickets(list)
    this.setState({ subProcessList: res.list, data: list })
    this.fields = _.isEmpty(formList.fields)
      ? getAllFields(formList.formLayoutVos)
      : formList.fields
  }

  componentWillUnmount() {
    this.saveDraft = false
  }

  queryRelateTaskList = async () => {
    this.setState({ loading: true })
    const { ticketId, tacheId } = this.props.formList
    const params = { parentTicketId: ticketId, tacheId }
    const res = (await axios.get(API.queryRelationTaskTicket, { params })) || []
    res.forEach((d, i) => {
      d.taskOrder = i + 1
      if (d.children && d.children.length > 0) {
        d.children.forEach((d2) => {
          d2.taskOrder = d.taskOrder
        })
      }
    })
    this.setState({ loading: false })
    return res
  }

  moveTask = async (dragIndex, hoverIndex) => {
    const { disabled, field } = this.props
    const { isRequired } = field
    if (disabled || isRequired === 2) {
      return false
    }
    const newData = _.cloneDeep(this.state.data)
    const dragItem = newData[dragIndex]
    const newData2 = update(newData, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragItem]
      ]
    })
    newData2.forEach((d, i) => {
      d.taskOrder = i + 1
      if (d.children && d.children.length > 0) {
        d.children.forEach((d2) => {
          d2.taskOrder = d.taskOrder
        })
      }
    })
    await this.dragSave(newData2)
    this.props.ticketStore.setRelateSubProcessTickets(newData2)
    this.setState({ data: newData2 })
  }

  dragSave = async (params) => {
    await axios.post(API.sortRelationTask, params)
  }

  moveTaskChild = async (dragIndex, dragParentIndex, hoverIndex, hoverParentIndex) => {
    const { disabled, field } = this.props
    const { isRequired } = field
    if (disabled || isRequired === 2) {
      return false
    }
    const data = _.cloneDeep(this.state.data)
    const dragItem = data[dragParentIndex].children[dragIndex]
    const dragData = update(data, {
      [dragParentIndex]: {
        children: { $splice: [[dragIndex, 1]] }
      }
    })
    const dropData = update(dragData, {
      [hoverParentIndex]: {
        children: { $splice: [[hoverIndex, 0, dragItem]] }
      }
    })
    await this.dragSave(dropData)
    this.props.ticketStore.setRelateSubProcessTickets(dropData)
    this.setState({ data: dropData })
  }

  addGroup = async (type, parentGroupId, taskNum, groupLevel) => {
    const { ticketId } = this.props.formList
    const { data } = this.state
    const newData = _.cloneDeep(data)
    let groupId = uuid()
    const param = {
      parentTicketId: ticketId,
      groupPriority: taskNum,
      groupLevel: groupLevel,
      groupType: type,
      parentGroupId,
      groupId
    }
    let res = await axios.post(API.addTaskGroup, { ...param })
    if (res) {
      const obj = {
        taskOrder: newData.length,
        groupId,
        parentGroupId,
        children: [],
        groupType: type,
        allowOperateDelete: true,
        elementType: 'group'
      }
      if (parentGroupId === '') {
        newData.push(obj)
      } else {
        loop(newData, obj)
      }
      this.props.ticketStore.setRelateSubProcessTickets(newData)
      this.setState({ data: newData })
    }
  }

  showCreateSubTicketDrawer = async (data, draftTicketId) => {
    const { getFieldsValue, field, handleOk = () => {} } = this.props
    const { taskModelIds } = field
    const submodelItem = _.find(
      this.state.subProcessList,
      (d) => d.taskModelId === taskModelIds[0].modelId
    )
    if (!submodelItem) {
      message.error('关联任务流程模型不存在或已禁用')
      return false
    }

    const isItsmCreate = this.props.location.pathname.indexOf('ticket/createTicket') !== -1
    if (isItsmCreate && !this.saveDraft) {
      const res = await handleOk(null, 'save')
      if (res === 'save') {
        this.saveDraft = true
      }
    }
    if (!this.saveDraft && isItsmCreate) {
      message.error('主单保存草稿未成功')
      return false
    }

    const title = getFieldsValue().title
    if (!title) {
      message.error(i18n('please-input') + i18n('ticket.list.ticketName'))
      return false
    }
    this.setState({
      visible: true,
      submodelItem,
      parentData: data,
      draftTicketId
    })
  }

  onClose = (type) => {
    if (type !== 'receive') {
      this.setState({ subDetailRoute: '' })
      this.refreshBtns()
    }
  }

  refreshBtns = () => {
    const { ticketId, tacheId } = this.props.formList
    this.props.ticketStore.getRestrictBtns(ticketId, tacheId)
  }

  render() {
    const {
      data,
      subProcessList,
      visible,
      submodelItem,
      parentData,
      loading,
      subDetailRoute,
      title,
      draftTicketId
    } = this.state
    const { formList = {}, field, getFieldsValue = () => {}, isInLayout, disabled } = this.props
    const { ticketId } = formList
    const { prefixProcessTask, id, isRequired, commonColumnList = [] } = field
    const columnList2 = _.filter(commonColumnList, (d) => d.fieldCode !== 'taskTicketNum')
    columnList2[0] = { fieldCode: 'taskTicketNum', fieldName: '单号', fieldType: 'common' }

    const prefixProcessTask2 = prefixProcessTask || '任务'
    let headerClassName = 'sub-task-header',
      wrapClass = ''
    let scroll = false
    if (columnList2.length > 7) {
      headerClassName += ' scroll'
      wrapClass = 'all-scroll'
      scroll = true
    }
    return (
      <DndProvider backend={HTML5Backend}>
        {isInLayout && isRequired === 1 ? <span className="required-item-icon">*</span> : null}
        <Button
          icon={<PlusOutlined />}
          style={{ marginRight: 8 }}
          onClick={() => this.showCreateSubTicketDrawer(undefined)}
          disabled={disabled || isRequired === 2}
        >
          {i18n('conf.model.proces.task')}
        </Button>
        {/* <Button
          icon={<PlusOutlined />}
          onClick={() => this.addGroup('serial', '', 1, 1)}
          disabled={disabled || isRequired === 2}
        >
          {i18n('task-combination', '任务组')}
        </Button> */}
        <span className="subprocess-tip">
          <ExclamationCircleOutlined />
          初始执行顺序为并行
        </span>
        <div className={wrapClass}>
          <div className={headerClassName} id={id}>
            <div className="space" />
            <div className="order">{i18n('config.trigger.log.list.title1')}</div>
            <div className="custom-columns">
              {_.map(columnList2, (d) => {
                // 变量前缀 先去掉
                if (customPrefixColumns.includes(d.fieldCode)) {
                  return <div className="link-div">{prefixProcessTask2 + d.fieldName}</div>
                }
                if (d === 'taskOrder') {
                  return ''
                }
                return <div>{d.fieldName}</div>
              })}
            </div>
            <div className="operation-subtask">{i18n('globe.operation')}</div>
          </div>
          {_.isEmpty(data) ? (
            <Empty type="table" />
          ) : (
            <Spin spinning={loading}>
              {_.map(data, (d, index) => {
                return (
                  <DragRow
                    key={d.id}
                    data={d}
                    id={d.id}
                    index={index}
                    moveTask={this.moveTask}
                    allData={data}
                    disabled={disabled || isRequired === 2}
                    setData={(data) => {
                      this.setState({ data })
                    }}
                    addGroup={(type, parentGroupId, taskNum, groupLevel) =>
                      this.addGroup(type, parentGroupId, taskNum, groupLevel)
                    }
                    moveTaskChild={this.moveTaskChild}
                    subProcessList={subProcessList}
                    columnList={columnList2}
                    history={this.props.history}
                    showCreateSubTicketDrawer={(data, type) =>
                      this.showCreateSubTicketDrawer(data, type)
                    }
                    getList={async () => {
                      const res = await this.queryRelateTaskList()
                      this.props.ticketStore.setRelateSubProcessTickets(res)
                      this.setState({ data: res })
                    }}
                    dragSave={this.dragSave}
                    scroll={scroll}
                    setDetailDrawer={(title, route) =>
                      this.setState({ title, subDetailRoute: route })
                    }
                  />
                )
              })}
            </Spin>
          )}
        </div>

        <CreateSubTask
          visible={visible}
          handleSubmodel={(visible) => this.setState({ visible })}
          submodelItem={submodelItem}
          ticketId={ticketId}
          allData={data}
          draftTicketId={draftTicketId}
          getList={async () => {
            const res = await this.queryRelateTaskList()
            this.props.ticketStore.setRelateSubProcessTickets(res)
            this.setState({ data: res })
          }}
          formsData={getFieldsValue()}
          parentData={parentData}
          fields={this.fields}
          refreshBtns={this.refreshBtns}
        />
        <DetailDrawer
          visible={!!subDetailRoute}
          title={title}
          detailRoute={subDetailRoute}
          onClose={this.onClose}
        />
      </DndProvider>
    )
  }
}

export default RelateSubTask

import React from 'react'
import { Select, Menu, Dropdown, Button, Modal } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import defaultList from '~/list/config/defaultList'
import ModalSelect from '../components/modelLazySelect'
import SeniorJump from '~/ticket/btn/operate/seniorJump'
import TicketRollBack from '~/ticket/btn/operate/rollBack'
import * as R from 'ramda'

// 只显示待处理和处理中的工单
const statusList = defaultList
  .find((item) => item.code === 'status')
  .params.filter((item) => ['1', '2'].includes(item.value))
const defaultStyle = { width: 256, marginRight: 15 }

@inject('modelListStore', 'listStore')
@observer
export default class BatchHeader extends React.Component {
  state = {
    periodList: [],
    submitVisible: false,
    activityFlowId: '',
    tache: {},
    nextActivity: [],
    visible: '',
    confirmLoading: false
  }

  setQuery = (obj) => {
    const { query } = this.props.listStore
    this.props.listStore.setQuery({ ...query, ...obj })
    this.props.listStore.getBatchHandleTicketList()
  }

  handleModalChange = async (modelId) => {
    const res = await this.props.modelListStore.queryActivityInfos({ modelId })
    this.setState({ periodList: res })
    this.props.listStore.setProps({ current: 1 })
    this.props.listStore.resetSelected()
    this.setQuery({ modelId, tacheId: undefined })
  }

  handleChange = (code) => (value) => {
    this.props.listStore.setProps({ current: 1 })
    this.props.listStore.resetSelected()
    this.setQuery({ [code]: value })
  }

  showSubmitModal = async (activityFlowId) => {
    const tacheId = this.props.selectedRows[0]?.tacheId
    this.setState({ visible: 'submit', activityFlowId })
    const ticketIdList = this.props.selectedRows.map((item) => item.ticketId)
    const res = await this.props.listStore.getBatchActivityById(tacheId, ticketIdList)
    const tache = this.getCurrentTache(res, activityFlowId)
    const nextActivity = this.getNextActivity(res)
    this.setState({ tache, nextActivity })
  }

  hideModal = () => {
    this.setState({ visible: '' })
  }

  getCurrentTache = (res, activityFlowId) => {
    const item = _.find(res.ruleVos, (rule) => {
      return rule.activityFlowId === activityFlowId
    })
    if (!item) return {}
    const {
      tacheId,
      exclusiveGateway,
      jumpActivityName,
      tacheName,
      users,
      groups,
      policy,
      tacheType,
      parallelismTaches,
      jumpActivity,
      jumpActivityId
    } = item.jumpTache
    return {
      activityFlowId,
      title: item.name,
      // 跳转环节id，当跳转环节为并行组时无效
      id: tacheId,
      // 跳转环节名称,判断节点需要增加判断
      name: exclusiveGateway ? jumpActivityName : tacheName,
      users,
      groups,
      policy,
      tacheType,
      parallelismTaches,
      isCountersign: jumpActivity || 0,
      jumpActivityId,
      exclusiveGateway,
      approvalResult: item.approvalResult
    }
  }

  getNextActivity = (res) => {
    const list = []
    const pickNames = R.pick([
      'tacheId',
      'tacheName',
      'users',
      'groups',
      'isCountersign',
      'policy',
      'tacheType'
    ])
    if (res.tacheType === 1) {
      _.forEach(res.parallelismTaches, (item) => {
        if (item.policy === 1) {
          list.push(pickNames(item))
        }
      })
    } else {
      list.push(pickNames(res))
    }
  }

  refresh = () => {
    this.props.listStore.resetSelected()
    this.props.listStore.getBatchHandleTicketList()
  }

  ticketJump = async () => {
    const { selectedRows } = this.props
    const { activityFlowId, tache } = this.state
    if (selectedRows.length === 0) return
    const ticket_Ids = R.pluck('ticketId', selectedRows)

    const values = await this.jump.validate()
    const execs = values[tache.id] || []
    const user = execs.filter((item) => item.type === 1).map((item) => item.id)
    const group = execs.filter((item) => item.type === 0).map((item) => item.id)
    const payload = {
      ticket_Ids,
      handleRule: {
        route_id: activityFlowId,
        message: values.message,
        executors_groups: {
          [tache.id]: { user, group }
        }
      },
      handleType: 0,
      activityId: selectedRows[0].tacheId
    }
    this.setState({ confirmLoading: true })
    const batchHandleId = await this.props.listStore.batchHandleTicket(payload)
    this.setState({ confirmLoading: false })
    this.hideModal()
    this.props.listStore.setProps({ isBatchHandling: true })
    await this.props.listStore.getBatchHandleProgress(batchHandleId)
    this.refresh()
  }

  ticketClose = async () => {
    const values = await this.close.validate()
    const { selectedRows } = this.props
    if (selectedRows.length === 0) return
    const ticket_Ids = R.pluck('ticketId', selectedRows)
    const payload = {
      ticket_Ids,
      handleType: 3,
      handleRule: {
        message: values.message
      },
      activityId: selectedRows[0].tacheId
    }
    this.setState({ confirmLoading: true })
    const batchHandleId = await this.props.listStore.batchHandleTicket(payload)
    this.setState({ confirmLoading: false })
    this.hideModal()
    this.props.listStore.setProps({ isBatchHandling: true })
    await this.props.listStore.getBatchHandleProgress(batchHandleId)
    this.refresh()
  }

  showCloseModal = () => {
    this.setState({ visible: 'close' })
  }

  render() {
    const { periodList, visible, tache, nextActivity, confirmLoading } = this.state
    const { showBatchBtn } = this.props
    const {
      query: { modelId, tacheId, status },
      formList,
      modelRule,
      filterType
    } = this.props.listStore
    const { activityFlows = [] } = formList
    const menu = (
      <Menu>
        {activityFlows.map(({ activityFlowId, name }) => (
          <Menu.Item key={activityFlowId} onClick={() => this.showSubmitModal(activityFlowId)}>
            {name}
          </Menu.Item>
        ))}
        {Boolean(formList.isCanClose) && (
          <Menu.Item key="close" onClick={this.showCloseModal}>
            {i18n('close', '关闭')}
          </Menu.Item>
        )}
      </Menu>
    )

    return (
      <div className="batch-ticket-header">
        <ModalSelect
          filterType={filterType}
          value={modelId}
          style={defaultStyle}
          onChange={this.handleModalChange}
        />
        <Select
          placeholder={i18n('ticket.status.placeholder', '请选择工单状态')}
          onChange={this.handleChange('status')}
          style={defaultStyle}
          allowClear
          value={status}
        >
          {statusList.map(({ value, label }) => {
            return (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            )
          })}
        </Select>

        <Select
          placeholder={i18n('ticket.period.placeholder', '请选择所处阶段')}
          style={defaultStyle}
          allowClear
          value={tacheId}
          onChange={this.handleChange('tacheId')}
        >
          {periodList.map(({ id, name, code }) => {
            return <Select.Option key={id}>{name}</Select.Option>
          })}
        </Select>

        <Dropdown overlay={menu} placement="bottomRight" disabled={!showBatchBtn}>
          <Button type="primary" style={{ float: 'right' }}>
            {i18n('batch-process', '批量处理')}
          </Button>
        </Dropdown>
        <Modal
          title={tache.title || ''}
          visible={visible === 'submit'}
          onCancel={this.hideModal}
          onOk={this.ticketJump}
          confirmLoading={confirmLoading}
        >
          <SeniorJump
            visible={visible === 'submit'}
            id={formList.ticketId}
            isRequiredHandingSuggestion={modelRule.isRequiredHandingSuggestion}
            modelType={modelRule.modelType}
            modelId={formList.subModelId || formList.modelId}
            tacheId={formList.tacheId}
            tache={tache}
            caseId={formList.caseId}
            orgId={formList.currDepart || null} // 开启组织机构时  传 所属部门的id
            nextActivity={nextActivity}
            activityType={formList.activityType}
            wrappedComponentRef={(node) => {
              this.jump = node
            }}
          />
        </Modal>

        <Modal
          title={i18n('globe.close', '关闭')}
          visible={this.state.visible === 'close'}
          onCancel={this.hideModal}
          onOk={this.ticketClose}
          confirmLoading={confirmLoading}
        >
          <TicketRollBack
            isRequiredHandingSuggestion={modelRule.isRequiredHandingSuggestion}
            visible={visible === 'close'}
            wrappedComponentRef={(node) => {
              this.close = node
            }}
          />
        </Modal>
      </div>
    )
  }
}

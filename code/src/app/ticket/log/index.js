import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as mobx from 'mobx'
import { inject, observer } from 'mobx-react'
import './styles/index.less'
import { Select, Row, Col, Checkbox, Spin } from '@uyun/components'
import RecordList from './recordList'
const Option = Select.Option

@inject('ticketStore')
@observer
class Log extends Component {
  contextTypes = {
    ticketId: PropTypes.string.isRequired
  }

  state = {
    showEditContent: false
  }

  timer = null

  // 列表是否加载完毕，防止不断下滑造成的多次请求
  loaded = true

  componentDidMount() {
    const { processRecordParams } = this.props.ticketStore
    if (this.props.source !== 'formset') {
      if (
        window.location.href.indexOf('createTicket') === -1 &&
        window.location.href.indexOf('createService') === -1
      ) {
        this.query(processRecordParams)
        this.getSwitch()
        let wrap = document.getElementById('itsm-wrap')
        if (this.props.formMode === 'new') {
          wrap = document.getElementById('processRecordWrap')
        } else if (document.querySelector('.ticket-detail-wrap-inContainer')) {
          wrap = document.querySelector('.ticket-detail-wrap-inContainer')
        }

        wrap.addEventListener('scroll', this.handleScroll)
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { activeKey, id } = this.props

    // 跳转关联时，根据id重新查询处理记录
    if (prevProps.id !== id) {
      const { processRecordParams } = this.props.ticketStore
      this.query({ ...processRecordParams, pageNum: 1 })
    }

    if (prevProps.activeKey !== activeKey) {
      let wrap = document.getElementById('itsm-wrap')

      if (this.props.formMode === 'new') {
        wrap = document.getElementById('processRecordWrap')
      } else if (document.querySelector('.ticket-detail-wrap-inContainer')) {
        wrap = document.querySelector('.ticket-detail-wrap-inContainer')
      }
      if (activeKey === '2') {
        wrap.addEventListener('scroll', this.handleScroll)
      } else {
        wrap.removeEventListener('scroll', this.handleScroll)
      }
    }
  }

  componentWillUnmount() {
    let wrap = document.getElementById('itsm-wrap')

    if (this.props.formMode === 'new') {
      wrap = document.getElementById('processRecordWrap')
    } else if (document.querySelector('.ticket-detail-wrap-inContainer')) {
      wrap = document.querySelector('.ticket-detail-wrap-inContainer')
    }
    wrap.removeEventListener('scroll', this.handleScroll)
  }

  query = (params) => {
    const { id, ticketStore, caseId } = this.props

    this.loaded = false
    ticketStore.getProcessRecord(id, params, caseId).then(() => {
      this.loaded = true
    })
  }

  // 获取开关控制是否能够勾选仅显示有处理意见的记录
  getSwitch = () => {
    axios
      .get(API.getSwitchValue, {
        params: { codes: 'showRecordsWithComments,processRecordModifyContentIfShow' }
      })
      .then((res) => {
        this.setState({
          showEditContent: res.processRecordModifyContentIfShow === '1'
        })
        this.props.ticketStore.setProps({ onlyShowAdvice: res.showRecordsWithComments === '1' })
      })
  }

  handleScroll = (e) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    // 是否到达底部
    let isBottom = scrollTop + offsetHeight >= scrollHeight
    if (document.querySelector('.ticket-detail-wrap-inContainer')) {
      isBottom = scrollTop + offsetHeight + 1 >= scrollHeight
    }
    const {
      hasMoreProcessRecord,
      processRecordParams: { pageNum, pageSize }
    } = this.props.ticketStore

    if (isBottom && this.loaded && hasMoreProcessRecord) {
      if (this.timer) {
        return
      }
      this.timer = setTimeout(() => {
        clearTimeout(this.timer)
        this.timer = null
        this.query({ pageNum: pageNum + 1, pageSize })
      }, 300)
    }
  }

  // 当前选中的处理记录列表
  handleChange = (val) => {
    this.props.ticketStore.selectProcessRecord(val)
  }

  handleAdviceCheckboxChange = (e) => {
    this.props.ticketStore.setProps({ onlyShowAdvice: e.target.checked })
  }

  render() {
    const { showEditContent } = this.state
    const { processSelected, onlyShowAdvice, processRecordLoading } = this.props.ticketStore
    const logList = mobx.toJS(this.props.ticketStore.logList)
    const recordList = mobx.toJS(this.props.ticketStore.recordList)
    const userInfos = mobx.toJS(this.props.ticketStore.userInfos)
    // 过滤重复记录名称
    const newLog = []
    const logName = []
    _.map(logList, (log) => {
      if (logName.indexOf(log.activityName) === -1) {
        newLog.push(log)
        logName.push(log.activityName)
      }
    })
    return (
      <div className="ticket-froms-log-wrap">
        <div className="ticket-froms-log-header">
          <div className="ticket-froms-log-sel">
            <Select
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              getPopupContainer={(el) => el}
              onChange={this.handleChange}
              value={processSelected || undefined}
              notFoundContent={i18n('globe.not_find', '无法找到')}
              placeholder={i18n('ticket.record.selectAllStage', '请选择流程节点进行过滤')}
            >
              {_.map(newLog, (item, idx) => {
                return (
                  <Option key={idx} value={item.activityName}>
                    {item.activityName}
                  </Option>
                )
              })}
            </Select>
          </div>
          <div className="ticket-froms-log-checkbox">
            <Checkbox checked={onlyShowAdvice} onChange={this.handleAdviceCheckboxChange}>
              {i18n('only-show-has-advice', '仅显示有处理意见的记录')}
            </Checkbox>
          </div>
        </div>

        {/** *********服务记录步骤条***************/}
        <div className="list_title">
          <div className="list_time">{i18n('time', '时间')}</div>
          <div className="list_content">
            <Row>
              <Col span={4}>{i18n('processing_link', '处理环节')}</Col>
              <Col span={2}>{i18n('operator', '操作人')}</Col>
              <Col span={2}>{i18n('config.trigger.resolve_action', '处理动作')}</Col>
              <Col span={5}>{i18n('config.trigger.resolve_content', '处理内容')}</Col>
              <Col span={4}>{i18n('processing_approval_opinion', '审批/处理意见')}</Col>
              <Col span={4}>{i18n('consume.time')}</Col>
              {/* <Col span={1}><i className="iconfont icon-biaodanguanli" /></Col> */}
              <Col span={3}>{i18n('modify-content', '修改内容')}</Col>
            </Row>
          </div>
        </div>
        <RecordList
          showEditContent={showEditContent}
          activityTaskVoList={recordList}
          userInfos={userInfos}
          onlyShowAdvice={onlyShowAdvice}
          ticketId={this.props.id}
        />
        {processRecordLoading ? (
          <div style={{ minHeight: 50, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : null}
      </div>
    )
  }
}

export default Log

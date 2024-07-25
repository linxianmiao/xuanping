import React, { Component } from 'react'
import { toJS } from 'mobx'
import moment from 'moment'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import { Input, Table, Progress, Row, Col, Form } from '@uyun/components'
import { renderPriority, renderUnit } from './common'
const FormItem = Form.Item
@inject('recordStore')
@observer
class RecordListIndex extends Component {
  componentDidMount() {
    this.props.recordStore.getStrategyRecords(this.props.match.params.id)
    this.props.recordStore.getStrategyRecordHeader(this.props.match.params.id)
  }

  componentWillUnmount() {
    this.props.recordStore.resetQuery()
  }

  handleSearch = (e) => {
    const { queryData } = toJS(this.props.recordStore)
    this.props.recordStore.queryData = _.assign({}, queryData, { kw: e.target.value })
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.props.recordStore.getStrategyRecords(this.props.match.params.id)
    }, 300)
  }

  renderExpanded = (record) => {
    const { strategyEventList } = record
    return (
      <React.Fragment>
        {_.map(strategyEventList, (item, index) => {
          const { actualActionTime, color, status, actionTypes } = item
          return (
            <Row key={index}>
              <Col span={4}>{moment(actualActionTime).format('YYYY-MM-DD HH:mm')}</Col>
              <Col span={20}>
                {_.map(actionTypes, (type, idx) => {
                  if (type === 1) {
                    return (
                      <div key={idx} className="">
                        <span style={{ paddingRight: 10 }}>
                          {i18n('sla_record_tip10', '标记工单颜色')}
                        </span>
                        <Progress
                          style={{ width: 100 }}
                          percent={100}
                          showInfo={false}
                          strokeColor={color}
                        />
                        <span style={{ paddingLeft: 10 }}>
                          {status
                            ? i18n('sla_record_tip11', '执行成功')
                            : i18n('sla_policy_record_status0', '进行中')}
                        </span>
                      </div>
                    )
                  } else {
                    return (
                      <div key={idx}>
                        <span style={{ paddingRight: 10 }}>
                          {i18n('sla_record_tip12', '发送通知')}
                        </span>
                        <span style={{ paddingLeft: 10 }}>
                          {status
                            ? i18n('sla_record_tip11', '执行成功')
                            : i18n('sla_policy_record_status0', '进行中')}
                        </span>
                      </div>
                    )
                  }
                })}
              </Col>
            </Row>
          )
        })}
      </React.Fragment>
    )
  }

  render() {
    const { list, count, queryData, SLADefinition } = toJS(this.props.recordStore)
    const { current, pageSize, kw } = queryData
    const { name, priority, unit, time } = SLADefinition
    const columns = [
      {
        title: i18n('ticket.list.ticketName', '工单标题'),
        dataIndex: 'ticketTitle',
        render: (text, record) => (
          <Link
            to={{
              pathname: `/ticket/detail/${record.ticketId}`,
              query: {
                tacheNo: record.tacheNo || 0,
                tacheType: record.tacheType,
                tacheId: record.tacheId,
                caseId: record.caseId
              },
              state: {
                from: location.hash
              }
            }}
          >
            {text}
          </Link>
        )
      },
      {
        title: i18n('sla_policy_record_status', '任务状态'),
        dataIndex: 'status',
        render: (text) =>
          text
            ? i18n('sla_policy_record_status1', '已结束')
            : i18n('sla_policy_record_status0', '进行中')
      },
      {
        title: i18n('sla_policy_record_start_time', '任务开始时间'),
        dataIndex: 'startTime',
        render: (text) => moment(text).format('MM-DD HH:mm')
      },
      {
        title: i18n('sla_policy_record_end_time', '任务结束时间'),
        dataIndex: 'endTime',
        render: (text) => (text ? moment(text).format('MM-DD HH:mm') : '')
      }
    ]
    const pagination = {
      total: count,
      showTotal: true,
      current,
      pageSize,
      onChange: (current, pageSize) => {
        this.props.recordStore.queryData = _.assign({}, queryData, { current, pageSize })
        this.props.recordStore.getStrategyRecords(this.props.match.params.id)
      },
      onShowSizeChange: (current, pageSize) => {
        this.props.recordStore.queryData = _.assign({}, queryData, { current, pageSize })
        this.props.recordStore.getStrategyRecords(this.props.match.params.id)
      }
    }
    return (
      <React.Fragment>
        <PageHeader />
        <ContentLayout>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <Input.Search
              value={kw}
              allowClear
              style={{ width: 256 }}
              onChange={(e) => {
                this.handleSearch(e)
              }}
              placeholder={i18n('globe.keywords', '请输入关键字')}
            />

            <Form layout="inline">
              <FormItem label={i18n('sla_protocol', 'SLA协议')}>{name}</FormItem>
              <FormItem label={i18n('ticket.sla.label1', '约定时间')}>
                {time}
                {renderUnit(unit)}
              </FormItem>
              <FormItem label={i18n('globe.grade', '等级')}>{renderPriority(priority)}</FormItem>
            </Form>

            <Table
              pagination={pagination}
              rowKey={(record) => record.id}
              expandedRowRender={(record) => this.renderExpanded(record)}
              dataSource={list}
              columns={columns}
            />
          </ErrorBoundary>
        </ContentLayout>
      </React.Fragment>
    )
  }
}

export default RecordListIndex

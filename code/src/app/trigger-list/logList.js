import React, { Component } from 'react'
import classnames from 'classnames'
import moment from 'moment'
import { Link, withRouter } from 'react-router-dom'
import { qs } from '@uyun/utils'
import { toJS, autorun } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Table, Button, Input, DatePicker, Modal, Form, Radio, Drawer } from '@uyun/components'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import LowcodeLink from '~/components/LowcodeLink'
import getURLParam from '~/utils/getUrl'

import './styles/logList.less'
const RangePicker = DatePicker.RangePicker
const FormItem = Form.Item
const RadioGroup = Radio.Group
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
}

const { stringify, parse } = qs

@inject('triggerLogListStore')
@withRouter
@observer
class TriggerLogList extends Component {
  state = {
    selectedRowKeys: [],
    visible: '',
    radioValue: 1,
    errMes: '',

    ticketTitle: '',
    ticketDetailUrl: ''
  }

  disposer = null

  get locationQuery() {
    const search = this.props.history.location.search.slice(1)
    return parse(search)
  }

  componentDidMount() {
    window.LOWCODE_APP_KEY = getURLParam('appkey')
    this.props.triggerLogListStore.data.triggerId =
      this.props.id || this.props.match.params.triggerId
    this.disposer = autorun(() => {
      const { data } = this.props.triggerLogListStore
      this.timer && clearTimeout(this.timer)
      this.props.triggerLogListStore.getAllTriggerRecord(data)
      this.timer = setTimeout(() => {
        this.props.triggerLogListStore.getAllTriggerRecord(data)
      }, 300)
    })
  }

  componentWillUnmount() {
    this.disposer()
    this.disposer = null
    this.props.triggerLogListStore.resetQuery()
    window.LOWCODE_APP_KEY = ''
  }

  handleChangeRangePicker = (date) => {
    const { data } = this.props.triggerLogListStore
    if (_.isEmpty(date)) {
      this.props.triggerLogListStore.setData(
        _.assign({}, data, { startTime: undefined, endTime: undefined })
      )
    } else {
      this.props.triggerLogListStore.setData(
        _.assign({}, data, { startTime: date[0].toDate(), endTime: date[1].toDate() })
      )
    }
  }

  handleSearch = (val) => {
    const { data } = this.props.triggerLogListStore
    this.props.triggerLogListStore.setData(_.assign({}, data, { kw: val }))
  }

  handleSearchFlowNo = (val) => {
    const { data } = this.props.triggerLogListStore
    this.props.triggerLogListStore.setData(_.assign({}, data, { flowNo: val }))
  }

  // 批量删除
  handleBatchDelete = () => {
    const { selectedRowKeys: recordIdList } = this.state
    this.props.triggerLogListStore.deleteTriggerRecord({ recordIdList })
  }

  // 导出
  handleExport = () => {
    const { selectedRowKeys, radioValue } = this.state
    let data = []
    if (radioValue === 1) {
      data = this.props.triggerLogListStore.list.map((item) => item.recordId)
    } else if (radioValue === 2) {
      data = selectedRowKeys
    }
    const url = stringify({ recordIds: data }, { indices: false })
    let exportUrl = `${API.EXPORTRECORD}?${url}&triggerId=${
      this.props.id || this.props.match.params.triggerId
    }`
    if (window.LOWCODE_APP_KEY) {
      exportUrl += `&appkey=${window.LOWCODE_APP_KEY}`
    }
    window.location.href = exportUrl
    this.setState({ visible: '' })
  }

  handleTicketDetailMessage = (res) => {
    if (res.data.createTicket === 'success') {
      this.handleTicketDetailClose()
    }
  }

  handleTicketDetailShow = (record) => {
    const { ticketId, ticketName } = record
    const url = `${window.location.origin}/itsm/#/ticketDetail/${ticketId}/?ticketSource=lowcode&hideHead=1&hideMenu=1&appkey=${window.LOWCODE_APP_KEY}`

    this.setState({
      ticketDetailUrl: url,
      ticketTitle: ticketName
    })

    window.addEventListener('message', this.handleTicketDetailMessage)
  }

  handleTicketDetailClose = () => {
    window.removeEventListener('message', this.handleChangeMessage)
    this.setState({ ticketDetailUrl: '', ticketTitle: '' })
  }

  _renderColumes = () => {
    const { type: triggerType } = this.locationQuery
    return [
      {
        title:
          triggerType === '2'
            ? i18n('config.trigger.log.list.title1', '序号')
            : i18n('config.trigger.log.list.title2', '工单'),
        dataIndex: triggerType === '2' ? 'serialNo' : 'title',
        key: 'title',
        render: (text, record) => {
          if (triggerType === '2') return text
          const { ticketId, tacheNo, tacheType, tacheId, subModelId, processId, caseId } = record
          const search = {
            tacheNo: tacheNo || 0,
            tacheType: tacheType,
            tacheId: tacheId,
            modelId: subModelId || processId,
            caseId: caseId
          }

          if (window.LOWCODE_APP_KEY) {
            return <a onClick={() => this.handleTicketDetailShow(record)}>{text}</a>
          }
          return (
            <Link
              to={{
                pathname: `/ticket/detail/${ticketId}`,
                search: `?${stringify(search)}`,
                state: {
                  from: this.props.history.location.hash
                }
              }}
            >
              {text}
            </Link>
          )
        }
      },
      {
        title: i18n('tip18', '流水号'),
        dataIndex: 'flowNo',
        key: 'flowNo',
        render: (text) => text || '--'
      },
      {
        title: i18n('config.trigger.tip41', '动作类型'),
        dataIndex: 'actionType',
        key: 'actionType',
        render: (text) => this._renderActionTypeName(text)
      },
      {
        title: i18n('config.trigger.tip42', '执行状态'),
        dataIndex: 'executeStatus',
        key: 'executeStatus',
        render: (text) => (
          <span
            className={classnames('triggle-log-execute-status', {
              success: text === '1',
              falure: text !== '1'
            })}
          >
            {text === '1'
              ? i18n('config.trigger.tip56', '执行成功')
              : i18n('config.trigger.tip57', '执行失败')}
          </span>
        )
      },
      {
        title: i18n('config.trigger.tip43', '执行时间'),
        dataIndex: 'executeTime',
        key: 'executeTime'
      }
    ]
  }

  _renderActionTypeName = (type) => {
    switch (type) {
      case 'SMS':
        return i18n('config.trigger.tip44', '短信')
      case 'SYS':
        return i18n('config.trigger.tip45', '站内信')
      case 'MAIL':
        return i18n('config.trigger.tip46', '邮件')
      case 'WECHAT':
        return i18n('config.trigger.tip47', '微信')
      case 'RESTFUL':
        return i18n('config.trigger.tip48', '调用RESTFUL接口')
      case 'TICKET':
        return i18n('config.trigger.tip49', '设置工单')
      case 'CHATOPS':
        return i18n('config.trigger.tip50', '发送ChatOps消息')
      case 'CREATETICKET':
        return i18n('config.trigger.tip51', '创建工单')
      case 'OTHERS':
        return i18n('config.trigger.tip52', '其他')
      default:
        return null
    }
  }

  _renderExpandedRowRender = (record) => {
    const { actionType, executeStatus, userList, content, logDetail } = record
    return (
      <div className="trigger-expanded-row">
        <FormItem {...formItemLayout} label={this._renderActionTypeName(actionType)}>
          <span
            className={classnames('trigger-expanded-row-name', {
              success: executeStatus === '1',
              falure: executeStatus !== '1'
            })}
          >
            {executeStatus === '1'
              ? i18n('config.trigger.tip56', '执行成功')
              : i18n('config.trigger.tip57', '执行失败')}
          </span>
          {actionType === 'RESTFUL' ? (
            <a
              href="javascript:;"
              onClick={() => {
                this.setState({ visible: 'sideModal', errMes: logDetail })
              }}
            >
              {i18n('config.trigger.tip58', '查看详情')}
            </a>
          ) : null}
        </FormItem>
        {userList && (
          <FormItem {...formItemLayout} label={i18n('config.trigger.tip59', '处理人')}>
            {userList}
          </FormItem>
        )}
        {content && (
          <FormItem {...formItemLayout} label={i18n('config.trigger.tip60', '描述')}>
            {content}
          </FormItem>
        )}
      </div>
    )
  }

  _renderRangePickerValue = (startTime, endTime) => {
    if (startTime && endTime) {
      return [moment(startTime), moment(endTime)]
    }
    return undefined
  }

  render() {
    const { type: triggerType } = this.locationQuery
    const { list, count: total, data, loading } = this.props.triggerLogListStore
    const { selectedRowKeys, visible, radioValue, errMes, ticketTitle, ticketDetailUrl } =
      this.state
    const { pageNo: current, pageSize, startTime, endTime, kw, flowNo } = data
    const pagination = {
      total,
      current,
      pageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange: (pageNo, pageSize) => {
        this.props.triggerLogListStore.setData(_.assign({}, data, { pageNo, pageSize }))
      },
      onShowSizeChange: (pageNo, pageSize) => {
        this.props.triggerLogListStore.setData(_.assign({}, data, { pageNo, pageSize }))
      }
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys })
      }
    }
    return (
      <div
        className={
          window.LOWCODE_APP_KEY
            ? 'conf-trigger-log-list-wrap add-padding'
            : 'conf-trigger-log-list-wrap'
        }
      >
        <PageHeader />
        <ContentLayout>
          <header className="conf-trigger-log-list-header clearfix">
            {triggerType === '1' && (
              <Input.Search
                value={kw}
                enterButton
                style={{ width: 256, marginRight: 15 }}
                onChange={(e) => this.handleSearch(e.target.value)}
                onSearch={this.handleSearch}
                placeholder={i18n('globe.keywords', '请输入关键字')}
              />
            )}
            <RangePicker
              value={this._renderRangePickerValue(startTime, endTime)}
              onChange={this.handleChangeRangePicker}
            />
            <Input.Search
              value={flowNo}
              style={{ width: 256, marginLeft: 15 }}
              enterButton
              onChange={(e) => this.handleSearchFlowNo(e.target.value)}
              onSearch={this.handleSearchFlowNo}
              placeholder={i18n('config.trigger.inputFlow', '请输入完整的流水号')}
            />
            <div className="btn-groups">
              <Button
                type="primary"
                onClick={() => {
                  this.setState({ visible: 'modal' })
                }}
              >
                {i18n('config.trigger.export', '导出')}
              </Button>
              <Button
                type="primary"
                disabled={_.isEmpty(selectedRowKeys)}
                onClick={this.handleBatchDelete}
              >
                {i18n('config.trigger.batch.del', '批量删除')}
              </Button>
            </div>
          </header>
          <Table
            loading={loading}
            rowKey={(record) => record.recordId}
            rowSelection={rowSelection}
            expandedRowRender={(record) => this._renderExpandedRowRender(record)}
            columns={this._renderColumes()}
            dataSource={toJS(list)}
            pagination={pagination}
          />
          {!!window.LOWCODE_APP_KEY && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Button>
                <LowcodeLink
                  pageKey="home"
                  homeKey="trigger_list"
                  onClick={() =>
                    this.props.history.push(
                      `/modellist/${window.LOWCODE_APP_KEY}/?activeTab=trigger`
                    )
                  }
                >
                  返回触发器列表
                </LowcodeLink>
              </Button>
            </div>
          )}
        </ContentLayout>
        <Modal
          onOk={this.handleExport}
          onCancel={() => {
            this.setState({ visible: '' })
          }}
          title={i18n('config.trigger.tip35', '导出触发记录')}
          visible={visible === 'modal'}
        >
          <FormItem {...formItemLayout} label={i18n('config.trigger.tip36', '导出记录')} required>
            <RadioGroup
              value={radioValue}
              onChange={(e) => {
                this.setState({ radioValue: e.target.value })
              }}
            >
              <Radio value={1}>{i18n('config.trigger.tip38', '当前页面记录')}</Radio>
              <Radio value={2} disabled={_.isEmpty(selectedRowKeys)}>
                {i18n('config.trigger.tip37', '已勾选记录')}
              </Radio>
              <Radio value={3}>{i18n('config.trigger.tip39', '所有记录')}</Radio>
            </RadioGroup>
          </FormItem>
        </Modal>
        <Drawer
          visible={visible === 'sideModal'}
          onClose={() => {
            this.setState({ visible: '', errMes: '' })
          }}
          title={i18n('config.trigger.tip61', '日志')}
        >
          {errMes}
        </Drawer>

        <Drawer
          title={ticketTitle}
          bodyStyle={{ overflow: 'hidden' }}
          visible={Boolean(ticketDetailUrl)}
          onClose={this.handleTicketDetailClose}
        >
          {Boolean(ticketDetailUrl) && (
            <iframe
              src={ticketDetailUrl}
              id="iframeId"
              width="100%"
              height="100%"
              allowFullScreen="allowfullscreen"
              scrolling="yes"
              frameBorder={0}
            />
          )}
        </Drawer>
      </div>
    )
  }
}
export default TriggerLogList

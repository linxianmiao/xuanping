import React, { Component } from 'react'
import moment from 'moment'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { InfoCircleFilled, PlusOutlined } from '@uyun/icons'
import { Table, Button, Switch, Modal, Select, Input } from '@uyun/components'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import LowcodeLink, { linkTo } from '~/components/LowcodeLink'
import './styles/index.less'
const Option = Select.Option
const ButtonGroup = Button.Group

@inject('globalStore', 'triggerListStore')
@withRouter
@observer
class TriggerList extends Component {
  componentDidMount() {
    window.LOWCODE_APP_KEY = this.props.appkey
    const { data } = this.props.triggerListStore
    this.props.triggerListStore.getTriggerList(data)
  }

  componentWillUnmount() {
    window.LOWCODE_APP_KEY = ''
  }

  // 查看触发记录
  handleScan = (record) => {
    const { id } = record
    this.props.history.push({
      pathname: `/conf/trigger/triggerRecord/${id}`
    })
  }

  // 删除触发器
  handleDelete(id) {
    Modal.confirm({
      title: i18n('config.trigger.isDelete', '您是否确认要删除该触发器？'),
      onOk: () => {
        this.props.triggerListStore.delTrigger(id)
      }
    })
  }

  changeStatus = (record) => {
    const { id: triggerId, useable } = record
    this.props.triggerListStore.changeStatusTrigger({ triggerId, useable: useable ? 0 : 1 })
  }

  handleFilterChange = (value, field) => {
    const { data, setData } = this.props.triggerListStore

    setData({ ...data, [field]: value })
  }

  handleSearch = (refresh) => {
    if (refresh) {
      this.handleFilterChange(1, 'pageNo')
    }
    this.props.triggerListStore.getTriggerList()
  }

  _renderColumes = () => {
    const { triggerDelete, maintenanceRecord, triggerModify } = this.props.globalStore.configAuthor

    const columns = [
      {
        title: i18n('config.trigger.name', '触发器名称'),
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <a
            onClick={() => {
              linkTo({
                url: `/conf/trigger/detail/${record.id}`,
                pageKey: 'trigger_edit',
                history: this.props.history
              })
            }}
          >
            {text}
          </a>
        )
      },
      {
        title: i18n('config.trigger.desc', '描述'),
        dataIndex: 'description',
        key: 'description'
      },
      {
        title: i18n('config.trigger.type', '触发类型'),
        dataIndex: 'triggerType',
        key: 'triggerType',
        render: (text) => (
          <span>
            {text === '1'
              ? i18n('config.trigger.tip', '事件触发')
              : i18n('config.trigger.tip28', '时间触发')}
          </span>
        )
      },
      {
        title: i18n('config.trigger.time', '时间'),
        dataIndex: 'createTime',
        key: 'createTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm')
      },
      {
        title: i18n('config.trigger.status', '使用状态'),
        dataIndex: 'useable',
        key: 'useable',
        render: (text, record) => {
          if (triggerModify) {
            return (
              <Switch
                checked={text === 1}
                onChange={() => {
                  this.changeStatus(record)
                }}
              />
            )
          }
          return text === 1 ? i18n('enable', '开启') : i18n('disable', '停用')
        }
      }
    ]
    // 触发器删除和查看触发记录的权限
    if (triggerDelete || maintenanceRecord) {
      columns.push({
        title: i18n('globe.operation', '操作'),
        render: (text, record) => {
          let url = `/conf/trigger/triggerRecord/${record.id}?type=${record.triggerType}`
          if (window.LOWCODE_APP_KEY) {
            url = `/conf/trigger/triggerRecord/${record.id}?type=${record.triggerType}&appkey=${window.LOWCODE_APP_KEY}`
          }
          return (
            <ButtonGroup type="link">
              {maintenanceRecord && (
                <LowcodeLink
                  url={url}
                  pageKey="trigger_log_list"
                  triggerId={record.id}
                  onClick={() => this.props.history.push(url)}
                >
                  {i18n('config.trigger.tip31', '触发记录')}
                </LowcodeLink>
              )}
              {triggerDelete && (
                <a
                  disabled={record.useable === 1 || record.builtin === 1}
                  onClick={() => {
                    if (record.useable === 1 || record.builtin === 1) return false
                    this.handleDelete(record.id)
                  }}
                >
                  {i18n('delete', '删除')}
                </a>
              )}
            </ButtonGroup>
          )
        }
      })
    }
    return columns
  }

  render() {
    const { list, count: total, data, loading } = this.props.triggerListStore
    const { pageNo: current, pageSize, kw, type } = data
    const { triggerInsert } = this.props.globalStore.configAuthor
    const pagination = {
      total,
      current,
      pageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50'],
      onChange: (pageNo, pageSize) => {
        this.props.triggerListStore.setData(_.assign(data, { pageNo, pageSize }))
        this.handleSearch()
      },
      onShowSizeChange: (pageNo, pageSize) => {
        this.props.triggerListStore.setData(_.assign(data, { pageNo, pageSize }))
        this.handleSearch()
      }
    }
    return (
      <div className="conf-trigger-list-wrap">
        {!window.LOWCODE_APP_KEY && <PageHeader />}
        <ContentLayout>
          <header className="conf-trigger-list-header clearfix">
            <Input.Search
              style={{ width: 256, marginRight: 15 }}
              placeholder={i18n('globe.keywords', '请输入关键字')}
              allowClear
              enterButton
              value={kw}
              onChange={(e) => this.handleFilterChange(e.target.value, 'kw')}
              onSearch={() => this.handleSearch(true)}
              onClear={() => this.handleSearch(true)}
            />
            <Select
              style={{ width: 200 }}
              placeholder={i18n('config.trigger.tip30', '请选择触发类型')}
              notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
              allowClear
              showSearch
              value={type}
              optionFilterProp="children"
              onChange={(value) => {
                this.handleFilterChange(value, 'type')
                this.handleSearch(true)
              }}
            >
              <Option value="1">{i18n('config.trigger.tip', '事件触发')}</Option>
              <Option value="2">{i18n('config.trigger.tip1', '时间触发')}</Option>
            </Select>
            {(triggerInsert || window.LOWCODE_APP_KEY) && (
              <Button
                icon={<PlusOutlined />}
                type="primary"
                className="trigger-create-btn"
                onClick={() => {
                  linkTo({
                    url: '/conf/trigger/create?',
                    pageKey: 'trigger_create',
                    history: this.props.history
                  })
                }}
              >
                {i18n('config.trigger.create', '新建触发器')}
              </Button>
            )}
          </header>
          <p className="trigger-list-p-tip">
            <InfoCircleFilled />
            {i18n(
              'config.tigger.event',
              '触发器指通过事件触发机制来执行特定的动作，用于丰富流程功能，如通过触发器可实现在工单创建时发送邮件通知给处理人。'
            )}
          </p>
          <Table
            loading={loading}
            rowKey={(record) => record.id}
            columns={this._renderColumes()}
            dataSource={toJS(list)}
            pagination={pagination}
          />
        </ContentLayout>
      </div>
    )
  }
}
export default TriggerList

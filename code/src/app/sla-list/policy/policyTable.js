import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import { Table, Switch, Modal, Button } from '@uyun/components'

const ButtonGroup = Button.Group

@inject('policyStore')
@withRouter
@observer
class PolicyTable extends Component {
    handleChangeUsing = async record => {
      const res = await this.props.policyStore.changePolicyStatus({
        id: record.id,
        status: record.using ? 0 : 1
      })
      if (res === '200') {
        return this.props.policyStore.getPolicyList()
      }
    }

    handleDelete = async id => {
      Modal.confirm({
        title: i18n('sla-delete-policy-tip', '您是否确认要删除该SLA策略？'),
        onOk: async () => {
          const res = await this.props.policyStore.deletePolicyItem({ id })
          if (res === '200') {
            return this.props.policyStore.getPolicyList()
          }
        },
        onCancel () {

        }
      })
    }

    handleLinkToRecordList = record => {
      this.props.history.push({
        pathname: `/conf/sla/policyRecord/${record.id}`
      })
    }

    render () {
      const { list, count, queryData, loading } = this.props.policyStore
      const { slaStrategyModify, slaStrategyDelete, slaStrategyRecord } = this.props
      const { current, pageSize } = queryData
      const columns = [{
        title: i18n('conf.model.field.card.name', '名称'),
        dataIndex: 'name',
        render: (text, record) => (
          <Link to={`/conf/sla/policy/detail/${record.id}`}>{text}</Link>
        )
      }, {
        title: i18n('sla_ticket_type', '工单类型'),
        dataIndex: 'model'
      }, {
        title: i18n('sla_protocol', 'SLA协议'),
        dataIndex: 'sla.name'
      }, {
        title: i18n('enabled_status', '启用状态'),
        dataIndex: 'using',
        render: (text, record) => {
          // SLA策略修改权限项，主要针对策略的启停权限，即修改权限包含策略的修改和启停的权限
          if (slaStrategyModify) {
            return <Switch checked={!!record.using} onChange={e => { this.handleChangeUsing(record) }} />
          }
          return record.using ? i18n('enable', '开启') : i18n('disable', '停用')
        }
      }]
      if (slaStrategyRecord || slaStrategyDelete) {
        columns.push({
          title: i18n('globe.operation', '操作'),
          render: (text, record) => (
            <ButtonGroup type="link">
              {
                slaStrategyRecord && (
                  <a onClick={() => this.props.onRecordsView(record.id)}>查看记录</a>
                )
              }
              {
                slaStrategyDelete &&
                <a disabled={record.using === 1} onClick={() => {
                  if (record.using) return false
                  this.handleDelete(record.id)
                }}>{i18n('delete', '删除')}</a>
              }
            </ButtonGroup>
          )
        })
      }
      const pagination = {
        total: count,
        showTotal: true,
        current,
        pageSize,
        onChange: (current, pageSize) => {
          this.props.policyStore.queryData = _.assign({}, queryData, { current, pageSize })
          this.props.policyStore.getPolicyList()
        },
        onShowSizeChange: (current, pageSize) => {
          this.props.policyStore.queryData = _.assign({}, queryData, { current, pageSize })
          this.props.policyStore.getPolicyList()
        }
      }
      return (
        <Table
          loading={loading}
          pagination={pagination}
          rowKey={record => record.id}
          dataSource={list}
          columns={columns}
        />
      )
    }
}

export default PolicyTable

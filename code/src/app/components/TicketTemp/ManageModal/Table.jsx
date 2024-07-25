import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Table, Input, Button } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import moment from 'moment'
import { deleteTemp } from '../logic'

@inject('templateListStore', 'ticketTemplateStore')
@observer
export default class ManageModal extends Component {
  static defaultProps = {
    onEdit: () => {}
  }

  componentDidMount() {
    this.props.templateListStore.query()
  }

  componentWillUnmount() {
    this.props.templateListStore.reset()
  }

  getModels = async (query, callback) => {
    const res = (await axios.get(API.queryAuthModelList, { params: query })) || {}
    let list = res.list || []

    list = list.map((item) => ({ id: item.processId, name: item.processName }))
    callback(list)
  }

  handleDelete = (record) => {
    deleteTemp(record, this.props.ticketTemplateStore, () => {
      this.props.templateListStore.onPageChange(1)
    })
  }

  render() {
    const {
      data,
      total,
      current,
      pageSize,
      loading,
      filters,
      onShowSizeChange,
      onPageChange,
      onFilterFieldChange
    } = this.props.templateListStore

    const columns = [
      {
        title: i18n('template.name', '模板名称'),
        dataIndex: 'name'
      },
      {
        title: i18n('ticket.list.model', '模型'),
        dataIndex: 'modelName'
      },
      {
        title: i18n('template.desc', '模板描述'),
        dataIndex: 'desc'
      },
      {
        title: i18n('is.shared', '是否共享'),
        dataIndex: 'shared',
        render: (shared) => (shared ? i18n('yes', '是') : i18n('no', '否'))
      },
      {
        title: i18n('create_time', '创建时间'),
        dataIndex: 'createTime',
        render: (time) => moment(time).format('YYYY-MM-DD HH:mm')
      },
      {
        title: i18n('operation', '操作'),
        render: (record) => (
          <Button.Group type="link">
            <a onClick={() => this.props.onEdit(record)}>{i18n('edit', '编辑')}</a>
            <a onClick={() => this.handleDelete(record)}>{i18n('delete', '删除')}</a>
          </Button.Group>
        )
      }
    ]

    const pagination = {
      current,
      pageSize,
      total,
      onShowSizeChange,
      onChange: onPageChange
    }

    return (
      <>
        <div style={{ marginBottom: 12 }}>
          <Input.Search
            style={{ width: 200 }}
            placeholder={i18n('input_keyword', '请输入关键字')}
            allowClear
            enterButton
            value={filters.kw}
            onChange={(e) => onFilterFieldChange(e.target.value, 'kw')}
            onSearch={(value) => onFilterFieldChange(value, 'kw', true)}
            onClear={() => onFilterFieldChange(undefined, 'kw', true)}
          />
          <LazySelect
            style={{ width: 200, marginLeft: 10 }}
            placeholder={i18n('pl_select_modal', '请选择模型')}
            labelInValue={false}
            getList={this.getModels}
            value={filters.modelId}
            onChange={(value) => onFilterFieldChange(value, 'modelId', true)}
          />
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={toJS(data)}
          pagination={pagination}
        />
      </>
    )
  }
}

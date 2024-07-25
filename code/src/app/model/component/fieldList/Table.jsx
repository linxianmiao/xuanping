import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Modal, message, Table, Divider } from '@uyun/components'
import { withRouter } from 'react-router-dom'
import LowcodeLink, { linkTo } from '~/components/LowcodeLink'
import dataType from '~/create-field/config/dataType'
import DeleteBtn from './DeleteBtn'

@inject('modelFieldListStore', 'globalStore', 'formSetGridStore', 'basicInfoStore')
@withRouter
@observer
class FieldList extends Component {
  static defaultProps = {
    modelId: '',
    onVisibleChange: () => {}
  }

  componentDidMount() {
    const { query } = this.props.modelFieldListStore
    this.props.modelFieldListStore.setProps({
      query: _.assign({}, query, { modelId: this.props.modelId })
    })
    this.props.modelFieldListStore.getFieldList()
  }

  handleDelete = async (id) => {
    Modal.confirm({
      title: i18n('conf.fields.list.del.field', '您是否确认要删除该字段？'),
      onOk: () => {
        return new Promise((resolve) => {
          this.props.modelFieldListStore.onDeleteField(id).then((res) => {
            if (+res === 200) {
              resolve()
              message.success(i18n('delete_success', '删除成功'))
              this.props.modelFieldListStore.getFieldList()
              // 重新获取模型启用字段
              this.props.formSetGridStore.getFieldList(this.props.modelId)
            }
          })
        })
      }
    })
  }

  getColumns = () => {
    const { modelId, globalStore, basicInfoStore, onVisibleChange } = this.props
    const {
      configAuthor: { fieldDelete, fieldModify },
      showStatusButton
    } = globalStore
    const { modelStatus } = basicInfoStore

    // 模型状态为开发中
    const canOperate = showStatusButton || modelStatus === -1 || window.LOWCODE_APP_KEY

    const column = [
      {
        title: i18n('field_name', '字段名称'),
        dataIndex: 'name',
        render: (text, row) => (
          <a
            className="table-title"
            // url={`/conf/model/advanced/field/update/${row.code}?modelId=${modelId}&canModelOperate=${canOperate}`}
            // pageKey="field_edit"
            // fieldCode={row.code}
            // modelId={modelId}
            // canModelOperate={canOperate}
            onClick={() => {
              linkTo({
                url: `/conf/model/advanced/field/update/${row.code}?modelId=${modelId}&canModelOperate=${canOperate}`,
                history: this.props.history,
                modelId: modelId,
                pageKey: 'field_edit'
              })
            }}
          >
            {text}
          </a>
        ),
        width: '15%'
      },
      {
        title: i18n('field_code', '编码'),
        dataIndex: 'code',
        width: '20%'
      },
      {
        title: i18n('field_desc', '字段说明'),
        dataIndex: 'fieldDesc',
        width: '25%'
      },
      {
        title: i18n('field_type', '类型'),
        dataIndex: 'typeDesc',
        render: (text, record) => {
          if (text) return text
          return _.get(dataType, [record.type, 'name'])
        },
        width: '20%'
      }
    ]
    column.push({
      title: i18n('operation', '操作'),
      dataIndex: 'operation',
      className: 'uy-table-td-href',
      render: (_, row) => {
        return (
          <span>
            {canOperate && fieldModify && (
              <>
                <a
                  className="href-btn normal"
                  style={{ marginRight: 5 }}
                  onClick={() => onVisibleChange('move', row)}
                >
                  {i18n('move_to', '移动到')}
                </a>
                <Divider type="vertical" />
              </>
            )}
            <DeleteBtn
              fieldDelete={canOperate && fieldDelete}
              row={row}
              handleDelete={this.handleDelete}
            />
          </span>
        )
      },
      width: '20%'
    })
    return column
  }

  handlePaginationChange = (current, pageSize) => {
    const { modelFieldListStore } = this.props

    modelFieldListStore.setProps({
      query: { ...modelFieldListStore.query, pageNo: current, pageSize }
    })
    modelFieldListStore.getFieldList()
  }

  render() {
    const { modelFieldListStore } = this.props
    const { loading, tableObj, query } = modelFieldListStore
    const { list, total } = tableObj
    const { pageNo, pageSize } = query || {}
    const pagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      current: pageNo,
      pageSize,
      total,
      onShowSizeChange: (current, pageSize) => {
        this.handlePaginationChange(1, pageSize)
      },
      onChange: this.handlePaginationChange
    }
    return (
      <Table
        rowKey="id"
        loading={loading}
        columns={this.getColumns()}
        dataSource={list}
        pagination={pagination}
      />
    )
  }
}

export default FieldList

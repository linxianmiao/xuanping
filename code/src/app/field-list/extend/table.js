import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import { Modal, message, Table, Button, Divider } from '@uyun/components'
import dataType from '~/create-field/config/dataType'
import DeleteBtn from './DeleteBtn'

@inject('fieldListExtendStore', 'globalStore')
@observer
class FieldList extends Component {
  static defaultProps = {
    onVisibleChange: () => {}
  }

  state = {
    selectedRowKeys: [] // Check here to configure the default column
  }

  componentDidMount() {
    this.props.fieldListExtendStore.getFieldList()
  }

  handleDelete = async (id) => {
    Modal.confirm({
      title: i18n('conf.fields.list.del.field', '您是否确认要删除该字段？'),
      onOk: () => {
        return new Promise((resolve) => {
          this.props.fieldListExtendStore.onDeleteField(id).then((res) => {
            if (+res === 200) {
              resolve()
              message.success(i18n('delete_success', '删除成功'))
              this.props.fieldListExtendStore.getFieldList()
            }
          })
        })
      }
    })
  }

  getColumns = () => {
    const { globalStore, onVisibleChange } = this.props
    const { fieldDelete, fieldModify } = globalStore.configAuthor
    const column = [
      {
        title: i18n('field_name', '字段名称'),
        dataIndex: 'name',
        render: (text, row) => {
          if (this.props.appkey) {
            return (
              <Link
                className="table-title"
                to={`/conf/field/update/${row.code}?appkey=${this.props.appkey}`}
              >
                {text}
              </Link>
            )
          } else {
            return (
              <Link className="table-title" to={`/conf/field/update/${row.code}`}>
                {text}
              </Link>
            )
          }
        }
      },
      {
        title: i18n('field_code', '编码'),
        dataIndex: 'code'
      },
      {
        title: i18n('field_type', '类型'),
        dataIndex: 'typeDesc',
        render: (text, record) => {
          if (text) return text
          return _.get(dataType, [record.type, 'name'])
        }
      },
      {
        title: i18n('conf.model.field.layoutId', '分组'),
        dataIndex: 'layoutInfoVo',
        render: (layoutInfoVo) => layoutInfoVo && layoutInfoVo.name
      }
    ]
    column.push({
      title: i18n('operation', '操作'),
      dataIndex: 'operation',
      className: 'uy-table-td-href',
      render: (_, row) => {
        return (
          <span>
            {fieldModify && (
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
            <DeleteBtn fieldDelete={fieldDelete} row={row} handleDelete={this.handleDelete} />
            {/* {
              fieldDelete &&
              <a
                className="href-btn warning"
                disabled={!row.canDelete}
                onClick={() => this.handleDelete(row.id)}
              >
                {i18n('delete', '删除')}
              </a>
            } */}
          </span>
        )
      }
    })
    return column
  }

  onSelectChange = (selectedRowKeys) => {}

  handlePaginationChange = (current, pageSize) => {
    const { fieldListExtendStore } = this.props

    fieldListExtendStore.setProps({
      query: { ...fieldListExtendStore.query, pageNo: current, pageSize }
    })
    fieldListExtendStore.getFieldList()
  }

  render() {
    const { fieldListExtendStore, selectedRowKeys } = this.props
    const { loading, tableObj, query } = fieldListExtendStore
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
    const rowSelection = {
      selectedRowKeys,
      onChange: this.props.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record.isShared === 1
      })
    }
    return (
      <Table
        rowKey="id"
        loading={loading}
        columns={this.getColumns()}
        dataSource={list}
        pagination={pagination}
        // rowSelection={rowSelection}
      />
    )
  }
}

export default FieldList

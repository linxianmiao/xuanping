import React, { Component } from 'react'
import { Table, Button, message, Popconfirm, Divider } from '@uyun/components'
import BodyCell from './bodyCell'
import uuid from '~/utils/uuid'
import _ from 'lodash'

const EXTRA_COL_WIDTH = 110
export default class CustomizeTable extends Component {
  state = {
    value: {},
    editingKey: '',
    cacheEditRecord: {},
    tableWidth: 2000
  }

  static getDerivedStateFromProps(props, state) {
    const value = eval(`(${props.value})`) || {}
    if (_.isEqual(value, state.value)) {
      return null
    } else {
      return { value }
    }
  }

  componentDidMount() {
    const { columns } = this.state.value
    this.setState({
      tableWidth: this.getColumn(columns)
        .map((item) => item.width)
        .filter((item) => !isNaN(item))
        .reduce((sum, item) => +sum + +item, 0)
    })
  }

  handleChange = (value, rowKey, columnKey) => {
    const { dataSource, columns } = this.state.value
    const list = _.map(dataSource, (data) => {
      if (data.key === rowKey) {
        return _.assign({}, data, { [columnKey]: value })
      }
      return data
    })
    // 必须要用this.state.value 调用，JH脚本里获取this进行了操作，需要兼容
    try {
      if (typeof this.state.value.onChange === 'string') {
        this.state.value.onChange = eval(`(${this.state.value.onChange})`)
      }
      const res = this.state.value.onChange({ value, rowKey, columnKey }, list, columns)
      this.onChange(_.assign({}, this.state.value, res))
    } catch (e) {
      this.onChange(_.assign({}, this.state.value, { dataSource: list }))
    }
  }

  onChange = (res) => {
    for (const key in res) {
      if (typeof res[key] === 'function') {
        res[key] = res[key].toString()
      }
    }
    this.props.onChange(JSON.stringify(res))
  }

  handleChangeSelectRowKeys = (record, selected, selectedRows) => {
    this.onChange(
      _.assign({}, this.state.value, { selectedRowKeys: _.map(selectedRows, (row) => row.key) })
    )
  }

  handleSelectAllRows = (selected, selectedRows) => {
    this.onChange(
      _.assign({}, this.state.value, { selectedRowKeys: _.map(selectedRows, (row) => row.key) })
    )
  }

  handleChangeColumns = (columns, key, size) => {
    return _.map(columns, (column) => {
      if (column.key === key) {
        return _.assign({}, column, { width: size.width })
      }
      if (column.children) {
        return _.assign({}, column, {
          children: this.handleChangeColumns(column.children, key, size)
        })
      }
      return column
    })
  }

  handleAdd = () => {
    const { dataSource } = this.state.value
    const item = { key: uuid() }
    const nextSource = _.cloneDeep(dataSource).concat(item)
    this.onChange(_.assign({}, this.state.value, { dataSource: nextSource }))
  }

  handleDelete = (record) => {
    const { dataSource } = this.state.value
    const nextSource = _.cloneDeep(dataSource).filter((item) => item.key !== record.key)
    this.onChange(_.assign({}, this.state.value, { dataSource: nextSource }))
  }

  handleCopy = (record) => {
    const { dataSource } = this.state.value
    const item = { ...record, key: uuid() }
    const nextSource = _.cloneDeep(dataSource).concat(item)
    this.onChange(_.assign({}, this.state.value, { dataSource: nextSource }))
  }

  changeEditingKey = (editingKey) => this.setState({ editingKey })

  isEditing = (record) => record.key === this.state.editingKey

  setCacheEditRecord = (data, key) => data.find((item) => item.key === key) || {}

  restoreCacheEditRecord = (data, record, key) => {
    return data.map((item) => {
      if (item.key === key) {
        item = record
      }
      return item
    })
  }

  // 对列信息进行处理
  getColumn = (columns, type) => {
    const { disabled } = this.props
    const { value, cacheEditRecord, editingKey } = this.state
    const { cellProps, dataSource, isCopyOrAdd, isDelete } = value
    const nextColumns = _.cloneDeep(columns || [])
    if (!disabled && type !== 'children') {
      nextColumns.push({
        title: i18n('operation', '操作'),
        className: 'extra-col operate-col',
        key: 'extra-col',
        width: EXTRA_COL_WIDTH,
        render: (text, record) => {
          const editable = this.isEditing(record)
          return editable ? (
            <Button.Group type="link">
              <a onClick={() => this.changeEditingKey('')}>{i18n('globe.ok', '确定')}</a>
              <a
                onClick={() => {
                  value.dataSource = this.restoreCacheEditRecord(
                    _.cloneDeep(value.dataSource),
                    cacheEditRecord,
                    editingKey
                  )
                  this.onChange(value)
                  this.changeEditingKey('')
                }}
              >
                {i18n('cancel', '取消')}
              </a>
            </Button.Group>
          ) : (
            <Button.Group type="link">
              {isCopyOrAdd ? (
                <>
                  <a
                    onClick={() => {
                      message.success(i18n('copy.ticket_success', '复制成功'))
                      this.handleCopy(record)
                    }}
                  >
                    {i18n('ticket.resource.copy', '复制')}
                  </a>
                  <Divider type="vertical" />
                  <a
                    disabled={!editable && editingKey ? 'disabled' : null}
                    onClick={(e) => {
                      e.stopPropagation()
                      this.setState({
                        editingKey: record.key,
                        cacheEditRecord: this.setCacheEditRecord(
                          _.cloneDeep(value.dataSource),
                          record.key
                        )
                      })
                    }}
                  >
                    {i18n('edit', '编辑')}
                  </a>
                </>
              ) : null}
              {isDelete ? (
                <Popconfirm
                  title={i18n('conf.model.del.card', '确定要删除吗？')}
                  onConfirm={() => {
                    message.success(i18n('del.sucess', '删除成功'))
                    this.handleDelete(record)
                  }}
                >
                  <a>{i18n('delete', '删除')}</a>
                </Popconfirm>
              ) : null}
            </Button.Group>
          )
        }
      })
    }

    return _.map(nextColumns, (item) => {
      const { type, options, dataIndex, children, editable = true } = item
      if (!_.isEmpty(children)) {
        return _.assign({}, item, { children: this.getColumn(children, 'children') })
      }
      // 扩展 单元格属性
      const expansion = {
        onHeaderCell: (column) => {
          return {
            width: column.width || 100
          }
        },
        onCell: (record, recordIndex) => {
          return {
            ...record,
            type,
            options,
            disabled,
            rowKey: record.key, // 行下标
            columnKey: dataIndex, // 列下标
            value: record[dataIndex], // 单元格value
            handleChange: this.handleChange,
            cellProps: _.isEmpty(cellProps) ? {} : cellProps[recordIndex],
            editing: this.isEditing(record),
            editable: editable
          }
        }
      }
      return _.assign({}, item, expansion)
    })
  }

  render() {
    if (this.props.error) {
      return i18n('ticket-field-curtomizeScript-err-tip2', '动态表格解析失败')
    }
    const { disabled, fieldCode } = this.props
    const { columns, dataSource, selectedRowKeys, isCopyOrAdd, pagination } = this.state.value || {}
    const components = {
      body: {
        cell: BodyCell
      }
    }
    const rowSelection = {
      selectedRowKeys: selectedRowKeys || [],
      onSelect: this.handleChangeSelectRowKeys,
      onSelectAll: this.handleSelectAllRows
    }
    return (
      <>
        <div style={{ textAlign: 'right', marginBottom: 10 }}>
          {!disabled && isCopyOrAdd ? (
            <Button type="primary" onClick={this.handleAdd}>
              {i18n('ticket.form.add.line', '添加行')}
            </Button>
          ) : null}
        </div>
        <Table
          scroll={{ x: this.state.tableWidth }}
          bordered
          id={fieldCode}
          rowKey={(record) => record.key}
          dataSource={dataSource}
          columns={this.getColumn(columns)}
          rowSelection={null}
          components={components}
          pagination={pagination || false}
        />
      </>
    )
  }
}

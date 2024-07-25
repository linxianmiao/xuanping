import React, { Component, Fragment } from 'react'
import {
  CloseCircleOutlined,
  CopyOutlined,
  PlusOutlined,
  QuestionCircleOutlined
} from '@uyun/icons'
import { Tooltip, Button, Table, Pagination } from '@uyun/components'
import { Resizable } from 'react-resizable'
import '../../index.less'

const COL_WIDTH = 150
const EXTRA_COL_WIDTH = 80

const ResizableTitle = (props) => {
  const { onResize, onResizeStop, needResize, width, ...restProps } = props

  if (!needResize) {
    return <th {...restProps} />
  }

  return (
    <Resizable width={width} height={0} onResize={onResize} onResizeStop={onResizeStop}>
      <th {...restProps} />
    </Resizable>
  )
}

export default class TableView extends Component {
  static defaultProps = {
    disabled: false,
    columns: [],
    data: [],
    pagination: {},
    renderCell: () => {},
    canCopy: false,
    onCopy: () => {},
    onDelete: () => {},
    onAdd: () => {},
    onPaginationChange: () => {},
    setFieldsValue: undefined // 用于设置宽度后改变表单值
  }

  state = {
    columns: [],
    selectedRows: []
  }

  components = {
    header: {
      cell: ResizableTitle
    }
  }

  componentDidMount() {
    const nextColumns = this.getColumns()
    this.handleRightFixed(nextColumns)
    this.setState({ columns: nextColumns })
  }

  componentDidUpdate(prevProps) {
    if (this.props.columns !== prevProps.columns || this.props.data !== prevProps.data) {
      const nextColumns = this.getColumns()
      this.handleRightFixed(nextColumns)
      this.setState({ columns: nextColumns })
    }
  }

  // 所有列宽度之和
  getAllColumnsWidth = (columns) => {
    let initialWidth = this.props.disabled ? 0 : 32
    return columns.reduce((w, col) => w + col.width, initialWidth)
  }

  getColumns = () => {
    const { columns, data, canCopy, disabled, onCopy, onDelete, onRowOk, fieldCode, showOkTables } =
      this.props
    const nextColumns = columns.map((col, index) => {
      const Title = (
        <span>
          {col.isRequired === 1 ? (
            <span className={col.isRequired === 1 ? 'required-item' : ''}>
              <img src="images/blue/bt.png" />
              {col.label}
            </span>
          ) : (
            col.label
          )}

          {col.descEnable === 1 && (
            <Tooltip
              title={<div style={{ whiteSpace: 'pre-wrap' }}>{col.description}</div>}
              batchSaveTableData
            >
              <QuestionCircleOutlined style={{ marginLeft: 2 }} />
            </Tooltip>
          )}
        </span>
      )
      let WIDTH
      if (this.state.columns?.[index]) {
        if (this.state.columns?.[index].width) {
          WIDTH = this.state.columns?.[index].width
        }
      }
      return {
        title: Title,
        dataIndex: col.value,
        width: WIDTH || col.colWidth || COL_WIDTH,
        render: (_, record) => this.props.renderCell(col, record),
        onHeaderCell: (column) => ({
          needResize: index < nextColumns.length - 1,
          width: column.width,
          onResize: this.handleResize(index),
          onResizeStop: this.handleResizeStop(index)
        })
      }
    })

    if (!disabled && this.props.isRequired !== 2 && (canCopy || data.length > 1)) {
      nextColumns.push({
        title: i18n('operation', '操作'),
        className: 'extra-col',
        key: 'extra-col',
        width: EXTRA_COL_WIDTH,
        render: (_, record) => (
          <Fragment>
            {!!canCopy && <a onClick={() => onCopy(record)}>{i18n('copy.row', '复制')}</a>}
            <a style={{ marginLeft: 4 }} onClick={() => onDelete(record)}>
              {i18n('delete.row', '删除')}
            </a>
            {showOkTables.includes(fieldCode) && (
              <a style={{ marginLeft: 4 }} onClick={() => onRowOk(fieldCode, record)}>
                确定
              </a>
            )}
          </Fragment>
        )
      })
    }

    return nextColumns
  }

  handleRightFixed = (columns) => {
    const { disabled } = this.props
    const tableWrap = document.getElementById('tc-content')
    const columnsWidth = this.getAllColumnsWidth(columns)
    // 操作栏固定
    if (!disabled && tableWrap && columnsWidth > tableWrap.offsetWidth) {
      columns[columns.length - 1].fixed = 'right'
    }
  }

  handleResize =
    (index) =>
    (e, { size }) => {
      if (size.width < 120) {
        return
      }
      this.setState(({ columns }) => {
        const nextColumns = [...columns]
        nextColumns[index] = {
          ...nextColumns[index],
          width: size.width
        }
        return { columns: nextColumns }
      })
    }

  handleResizeStop =
    (index) =>
    (e, { size }) => {
      const { setFieldsValue, columns } = this.props

      if (setFieldsValue) {
        const nextColumns = [...columns]
        nextColumns[index] = {
          ...nextColumns[index],
          colWidth: size.width || 0
        }
        setFieldsValue({
          params: nextColumns
        })
      }
    }

  delRows = () => {
    const { selectedRows } = this.state
    const { onDelete } = this.props
    selectedRows.forEach((d) => onDelete(d))
  }

  render() {
    const {
      disabled,
      data,
      pagination: storePagination,
      loading,
      pageFlag,
      isRequired
    } = this.props
    // 创建环节都不分页
    let pageShow = pageFlag
    if (
      window.location.href.indexOf('createTicket') !== -1 ||
      window.location.href.indexOf('createService') !== -1
    ) {
      pageShow = 0
    }
    const { columns } = this.state
    const scrollX = this.getAllColumnsWidth(columns)
    const paginationProps = {
      current: storePagination.pageNo,
      pageSize: storePagination.pageSize,
      total: storePagination.total,
      // size: 'small',
      onChange: (page, pageSize) => this.props.onPaginationChange(page, pageSize)
      //   onShowSizeChange: (current, size) => this.props.onPaginationChange(null, size)
    }
    const rowSelection = {
      width: 32,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows })
      }
    }
    return (
      <>
        <div style={{ float: 'left' }}>
          {!disabled && isRequired !== 2 ? (
            <Button style={{ marginRight: 10 }} icon={<PlusOutlined />} onClick={this.props.onAdd}>
              {i18n('ticket.form.add.line', '添加行')}
            </Button>
          ) : null}
          {!disabled && isRequired !== 2 && (
            <Button className="mgr-b-5" onClick={this.delRows} style={{ marginRight: 10 }}>
              {i18n('delete', '删除')}
            </Button>
          )}
        </div>
        <Table
          rowSelection={disabled || isRequired === 2 ? undefined : rowSelection}
          className="form-table"
          rowKey="rowId"
          loading={loading}
          components={this.components}
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: scrollX }}
        />
        {data.length > 0 && pageShow > 0 && <Pagination {...paginationProps} />}
      </>
    )
  }
}

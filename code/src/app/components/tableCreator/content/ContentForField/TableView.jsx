import React, { Component, Fragment } from 'react'
import { DeleteOutlined, CopyOutlined, PlusOutlined, QuestionCircleOutlined } from '@uyun/icons'
import { Tooltip, Button, Table } from '@uyun/components'
import { Resizable } from 'react-resizable'

const COL_WIDTH = 150
const EXTRA_COL_WIDTH = 42

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
    renderCell: () => {},
    canCopy: false,
    onCopy: () => {},
    onDelete: () => {},
    onAdd: () => {},
    setFieldsValue: undefined // 用于设置宽度后改变表单值
  }

  state = {
    columns: []
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
    if (
      this.props.columns !== prevProps.columns ||
      this.props.data !== prevProps.data ||
      this.props.fields !== prevProps.fields
    ) {
      const nextColumns = this.getColumns()
      this.handleRightFixed(nextColumns)
      this.setState({ columns: nextColumns })
    }
  }

  // 所有列宽度之和
  getAllColumnsWidth = (columns) => columns.reduce((w, col) => w + col.width, 0)

  getColumns = () => {
    const { columns, data, canCopy, disabled, onCopy, onDelete } = this.props
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
            <Tooltip title={col.description}>
              <QuestionCircleOutlined />
            </Tooltip>
          )}
        </span>
      )
      return {
        title: Title,
        dataIndex: col.value,
        width: col.colWidth || COL_WIDTH,
        render: (_, record) => this.props.renderCell(col, record),
        onHeaderCell: (column) => ({
          needResize: index < nextColumns.length - 1,
          width: column.width,
          onResize: this.handleResize(index),
          onResizeStop: this.handleResizeStop(index)
        })
      }
    })

    if (!disabled) {
      nextColumns.push({
        className: 'extra-col',
        key: 'extra-col',
        width: EXTRA_COL_WIDTH,
        render: (_, record) => (
          <Fragment>
            {!!canCopy && (
              <CopyOutlined title={i18n('copy.row', '复制')} onClick={() => onCopy(record)} />
            )}
            <DeleteOutlined
              style={{ marginLeft: 2 }}
              title={i18n('delete.row', '删除')}
              onClick={() => onDelete(record)}
            />
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

  render() {
    const { data, disabled } = this.props
    const { columns } = this.state
    const scrollX = this.getAllColumnsWidth(columns)

    return (
      <>
        <Table
          rowKey="rowId"
          bordered
          components={this.components}
          dataSource={data}
          columns={columns}
          pagination={false}
          scroll={{ x: scrollX }}
        />
        {!disabled ? (
          <Button
            style={{ marginTop: 10 }}
            type="primary"
            icon={<PlusOutlined />}
            onClick={this.props.onAdd}
          >
            {i18n('ticket.form.add.line', '添加行')}
          </Button>
        ) : null}
      </>
    )
  }
}

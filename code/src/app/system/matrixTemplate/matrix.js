import React from 'react'
import { observer, inject } from 'mobx-react'
import { PlusOutlined } from '@uyun/icons'
import { Table, Button, Modal, Input, Form } from '@uyun/components'
import uuid from '~/utils/uuid'
import matrixStore from '../stores/matrixStore'
import UserPicker from '~/components/userPicker'
import { getDataSource, updateWhen, validateRules, getInitialValidateInfo } from './logic'
import * as R from 'ramda'

const FormItem = Form.Item

const CELL_WIDTH = 210
const OPERATE_WIDTH = 100
const SPACE_WIDTH = 30

const TABLE_ID = 'matrix-talbe'

@inject('globalStore')
@observer
class Matrix extends React.Component {
  state = {
    validateInfo: getInitialValidateInfo()
  }

  update = (data) => {
    this.props.onChange({ ...this.props.value, ...data })
  }

  validate = () => {
    const { columnList, rowList } = this.props.value

    let validateInfo = getInitialValidateInfo()
    for (const rule of validateRules) {
      validateInfo = rule(columnList, rowList)
      if (validateInfo.validateStatus !== '') {
        break
      }
    }
    this.setState({ validateInfo })
    return validateInfo.validateStatus === ''
  }

  handleColumnNameChange = (e, columnId) => {
    const columnList = updateWhen(
      (column) => column.columnId === columnId,
      (column) => ({ ...column, columnName: e.target.value }),
      this.props.value.columnList
    )
    this.update({ columnList })
  }

  handleUserChange = (columnId, record) => (value) => {
    // 服务端数据type为字符串类型
    const nextValueList = value.map((item) => ({ ...item, type: String(item.type) }))
    const { rowList } = this.props.value
    const newRowList = rowList.map((row) => {
      if (row.rowId !== record.rowId) return row
      const columns = updateWhen(
        (column) => column.columnId === columnId,
        (column) => ({ ...column, valueList: nextValueList }),
        row.columns
      )
      return { ...row, columns }
    })
    this.update({ rowList: newRowList })
  }

  copyRow = (columns) => {
    const rowList = [...this.props.value.rowList, { rowId: uuid(), columns: _.cloneDeep(columns) }]
    this.update({ rowList })
  }

  addRow = () => {
    // 添加行时，行中的columnId要与columnList中的一致
    const columns = this.props.value.columnList.map(({ columnId }) => ({ columnId, valueList: [] }))
    this.copyRow(columns)
  }

  deleteRow = (rowId) => {
    Modal.confirm({
      title: i18n('system-matrix-delete-row', '您确定要删除该行数据'),
      onOk: () => {
        const rowList = this.props.value.rowList.filter((row) => rowId !== row.rowId)
        this.update({ rowList })
      }
    })
  }

  addColumn = () => {
    const { columnList, rowList } = this.props.value
    const columnId = uuid()
    const newColumnList = [...columnList, { columnId, columnName: undefined }]
    // 添加列时，每一行中的数据也要多加一列
    const newRowList = rowList.map((row) => ({
      ...row,
      columns: [...row.columns, { columnId, valueList: [] }]
    }))
    this.update({ columnList: newColumnList, rowList: newRowList })
  }

  deleteColumn = async (columnId) => {
    const confirm = () => {
      const { columnList, rowList } = this.props.value
      Modal.confirm({
        title: i18n('system-matrix-delete-column', '您确定要删除该列数据'),
        onOk: async () => {
          const filterColumns = (columns) =>
            columns.filter((column) => column.columnId !== columnId)
          const newColumnList = filterColumns(columnList)
          // 删除列的时候，同步删除行中该列的数据
          const newRowList = rowList.map((row) => ({ ...row, columns: filterColumns(row.columns) }))
          this.update({ columnList: newColumnList, rowList: newRowList })
        }
      })
    }
    // 如果要删除的列是用户刚刚添加的，就没必要请求接口了，只弹框确认删除即可
    if (matrixStore.matrixData.columnList.findIndex((c) => c.columnId === columnId) === -1) {
      confirm()
    } else {
      const res = await matrixStore.canDeleteMatrixColumn({ columnId })
      if (res.canDel) {
        confirm()
      } else {
        const text = R.pipe(R.pluck('name'), R.join('、'))(res.modelInfoVos || [])
        const title = `${i18n('matrix.column.remove.text1', '列被模型')} ${text} ${i18n(
          'matrix.column.remove.text2',
          '引用，不能删除！'
        )}`
        Modal.error({ title })
      }
    }
  }

  getColumnValidateInfo = (columnId) => {
    const { validateStatus, help, type, payload } = this.state.validateInfo
    const hit =
      type === 'column' &&
      validateStatus !== '' &&
      Array.isArray(payload) &&
      payload.includes(columnId)
    return hit ? { validateStatus, help } : {}
  }

  getCellValidateInfo = (rowId, columnId) => {
    const { validateStatus, help, type, payload } = this.state.validateInfo
    const hit =
      type === 'row' &&
      validateStatus !== '' &&
      Array.isArray(payload[rowId]) &&
      payload[rowId].includes(columnId)
    return hit ? { validateStatus, help } : {}
  }

  getColumns(columnList, { canDelRow }) {
    const { matrixModify } = this.props.globalStore.configAuthor
    const tableWrap = document.querySelector(`#${TABLE_ID}`)
    const width = tableWrap ? tableWrap.getBoundingClientRect().width : 0

    const columns = columnList.map((column, index) => {
      const { columnId, columnName } = column
      const columnValidateInfo = this.getColumnValidateInfo(columnId)
      const title = (
        <span className="matrix-table-header-cell-wrapper">
          <FormItem {...columnValidateInfo} style={{ marginBottom: 0 }}>
            <Input
              value={columnName}
              onChange={(e) => this.handleColumnNameChange(e, columnId)}
              allowClear
              placeholder={i18n('ticket.forms.pinput')}
            />
          </FormItem>
          {columnList.length > 1 && (
            <i
              className="iconfont icon-guanbi1 close-column"
              onClick={() => this.deleteColumn(columnId)}
            />
          )}
        </span>
      )
      return {
        key: columnId,
        title,
        dataIndex: columnId,
        width: CELL_WIDTH,
        render: (_, record) => {
          const cellValidateInfo = this.getCellValidateInfo(record.rowId, columnId)
          return (
            <FormItem {...cellValidateInfo} style={{ marginBottom: 0 }}>
              <UserPicker
                tabs={[0, 1, 2]}
                showTypes={['groups', 'users', 'departs_custom']}
                selectionType="checkbox"
                value={record[columnId]}
                onChange={this.handleUserChange(columnId, record)}
              />
            </FormItem>
          )
        }
      }
    })

    let scrollWidth = columnList.length * CELL_WIDTH

    if (matrixModify) {
      scrollWidth += OPERATE_WIDTH
    }
    const isScroll = Boolean(width) && scrollWidth > width

    if (matrixModify) {
      columns.push({
        key: 'operation',
        dataIndex: 'operation',
        title: (
          <div>
            <Button icon={<PlusOutlined />} onClick={this.addColumn}>
              {i18n('column', '列')}
            </Button>
          </div>
        ),
        fixed: isScroll ? 'right' : false,
        width: OPERATE_WIDTH,
        render: (_, record) => (
          <div>
            <a style={{ marginRight: 8 }} onClick={() => this.copyRow(record.columns)}>
              <i className="iconfont icon-fuzhi" />
            </a>
            {canDelRow && (
              <a
                onClick={() => {
                  this.deleteRow(record.rowId)
                }}
              >
                <i className="iconfont icon-shanchu1" />
              </a>
            )}
          </div>
        )
      })
    }
    if (isScroll) {
      scrollWidth += SPACE_WIDTH
      columns.unshift({
        key: 'space',
        dataIndex: 'space',
        title: '',
        fixed: 'left',
        width: SPACE_WIDTH
      })
    }

    return {
      columns,
      scroll: { x: scrollWidth }
    }
  }

  render() {
    const { matrixModify } = this.props.globalStore.configAuthor
    const { columnList, rowList } = this.props.value

    const { columns, scroll } = this.getColumns(columnList, {
      canDelRow: Array.isArray(rowList) && rowList.length > 1
    })

    const dataSource = getDataSource(rowList)

    return (
      <React.Fragment>
        <Table
          id={TABLE_ID}
          rowKey={(record) => record.rowId}
          columns={columns}
          pagination={false}
          dataSource={dataSource}
          scrollArrowsStep={CELL_WIDTH}
          showScrollArrows
          scroll={scroll}
        />

        {matrixModify && (
          <footer style={{ marginTop: 5 }}>
            <Button style={{ marginRight: 15 }} onClick={this.addRow} icon={<PlusOutlined />}>
              {i18n('row', '行')}
            </Button>
          </footer>
        )}
      </React.Fragment>
    )
  }
}

export default Matrix

import React, { Component } from 'react'
import { Form, InputNumber } from '@uyun/components'
import FormView from './FormView'
import TableView from './TableView'
import { Select as SelectWithColor } from '~/components/SelectWithColor'
import SingleRowText from '../../cell/SingleRowText'
import MultiRowText from '../../cell/MultiRowText'
import Links from '~/ticket/forms/links/Links'
import NormalSelect from '../../cell/normalSelect'
import OutsideSelect from '../../cell/outsieSelect'
import Dictionary from '../../cell/Dictionary'
import Attachfile from '~/ticket/forms/attachfile/ModeSelect'
import DatePicker from '~/components/TicketDate'
import Cascader from '../../cell/Cascader'
import ReadOnly from '../../cell/ReadOnly'
import uuid from '~/utils/uuid'
import { getDateTimeValue } from '~/public/logic/dateTime'
import { parseHideRules, isMatchHideRule, validator } from '../logic'

import '../../index.less'

// '0'表格模式, '1'表单模式
const TABLE_MODE = '0'
const FORM_MODE = '1'

class Content extends Component {
  static defaultProps = {
    scene: 'field', // 组件的使用场景 'field'字段 'ticket'工单
    disabled: false,
    value: [],
    columns: [],
    tableRules: [],
    mode: TABLE_MODE,
    ticketId: undefined, // 用于附件
    onChange: () => {}
  }

  state = {
    fields: [],
    initValue: {},
    error: false
  }

  tableRef = React.createRef()

  componentDidMount() {
    const { columns, value, scene } = this.props

    const codes = this.getCodes(columns)
    this.queryFields(codes).then((fields) => {
      // 字段新建时才需要设置默认值
      if (scene === 'field' && (!value || value.length === 0)) {
        this.setDefaultValue([], fields)
      }
    })

    // if (columns.length > 0 && value.length === 0) {
    //   this.handleAdd()
    // }
    setTimeout(() => {
      window.FORM_LEAVE_NOTIRY = false
      this.props.setFieldsValue && this.props.setFieldsValue({ validate: this.validate })
    })
  }

  componentDidUpdate(prevProps) {
    const { columns, value, mode } = this.props
    const prevCodes = this.getCodes(prevProps.columns)
    const codes = this.getCodes(columns)

    // if (columns.length > 0 && value.length === 0) {
    //   this.handleAdd()
    // }
    if (_.difference(codes, prevCodes).length !== 0) {
      this.queryFields(codes).then((fields) => {
        this.setDefaultValue(prevProps.columns, fields)
      })
    } else {
      this.setDefaultValue(prevProps.columns, this.state.fields)
    }
    if (mode === TABLE_MODE && value.length > prevProps.value.length) {
      this.rerenderTable()
    }
    if (mode === TABLE_MODE && mode !== prevProps.mode) {
      this.rerenderTable()
    }
  }

  rerenderTable = () => {
    // 行数据异步，导致行高和固定列行高不一致，所以重新渲染table，会有点慢
    this.tableRef.current && this.tableRef.current.forceUpdate()
  }

  // 原有列的数据源有无改变，返回改变了数据源的列
  getSourceChangedColumns = (prevColumns, currColumns) => {
    const changedCols = []

    prevColumns.forEach((prevCol) => {
      const currCol = currColumns.find((col) => prevCol.value === col.value)

      if (
        currCol &&
        !(currCol.type === 'normal' && prevCol.type === 'normal') &&
        currCol.source !== prevCol.source
      ) {
        changedCols.push(currCol)
      }
    })

    return changedCols
  }

  getItemDefaultValue = (col, fields) => {
    if (col.type === 'normal') {
      return col.source
    }

    const field = fields.find((f) => f.code === col.source)

    if (field) {
      if (col.type === 'singleSel' || col.type === 'listSel') {
        let defaultOption = field.params.find((p) => p.select === 1) || {}
        // 字典下拉不取params的value
        if (field.tabStatus === '2') {
          defaultOption = {}
        }
        return defaultOption.value
      }
      if (col.type === 'multiSel') {
        return field.params.filter((p) => p.select === 1).map((d) => d.value)
      }
      if (col.type === 'links') {
        const { linkName, linkUrl, linkProtocol } = field
        return { linkName, linkUrl, linkProtocol }
      }
      return field.defaultValue
    }
  }

  // 有新增列时，预设默认值
  // 有列被删除时，同时删除表格内容中的该列数据
  // 列的数据源改变时，修改该列的值为新数据源的默认值
  setDefaultValue = (prevColumns, fields) => {
    const { columns, value, onChange } = this.props
    // 新增的列
    const newColumns = columns.filter(
      (col) => !prevColumns.find((preCol) => preCol.value === col.value)
    )
    // 被删除的列
    const deletedColumns = prevColumns.filter(
      (prevCol) => !columns.find((col) => prevCol.value === col.value)
    )
    // 数据源有改变的列
    const changedColumns = this.getSourceChangedColumns(prevColumns, columns)

    const shouldChange =
      newColumns.length > 0 || deletedColumns.length > 0 || changedColumns.length > 0

    if (shouldChange) {
      const nextValue = _.cloneDeep(value)

      if (newColumns.length > 0) {
        nextValue.forEach((item) => {
          newColumns.forEach((col) => {
            item[col.value] = this.getItemDefaultValue(col, fields)
          })
        })
      }

      if (deletedColumns.length > 0) {
        nextValue.forEach((item) => {
          deletedColumns.forEach((col) => {
            item[col.value] = undefined
          })
        })
      }

      if (changedColumns.length > 0) {
        nextValue.forEach((item) => {
          changedColumns.forEach((col) => {
            item[col.value] = this.getItemDefaultValue(col, fields)
          })
        })
      }

      onChange(nextValue)
    }
  }

  getCodes = (columns) =>
    _.chain(columns)
      .filter((item) => item.type !== 'normal')
      .map((item) => item.source)
      .compact()
      .value()

  queryFields = async (codes, query) => {
    if (_.isEmpty(codes)) {
      return
    }
    if (query) {
      return
    }
    const res = await axios.post(
      API.findFieldByCodeList,
      { fieldCodes: codes },
      { params: { modelId: this.props.modelId } }
    )
    // compact 过滤空的
    this.setState({ fields: _.compact(res) }, () => {
      if (this.props.mode === TABLE_MODE) {
        this.rerenderTable()
      }
    })
    return Promise.resolve(_.compact(res))
  }

  handleAdd = () => {
    const { columns, value, onChange } = this.props
    const { fields } = this.state
    const nextValue = _.cloneDeep(value)
    const item = { rowId: uuid() }

    columns.forEach((col) => {
      item[col.value] = this.getItemDefaultValue(col, fields)
    })

    nextValue.push(item)
    onChange(nextValue)
  }

  handleDelete = (record) => {
    const { value, onChange } = this.props
    const nextValue = value.filter((item) => item.rowId !== record.rowId)
    onChange(nextValue)
  }

  handleCopy = (record) => {
    const { value, onChange } = this.props
    const index = value.findIndex((item) => item.rowId === record.rowId)
    const item = { ...record, rowId: uuid() }

    value.splice(index + 1, 0, item)

    onChange(value)
  }

  // 这里的selected参数为下拉外部数据源字段选中项的完整信息
  handleChange = (val, column, record, selected = []) => {
    const { onChange, tableRules } = this.props
    const value = _.cloneDeep(this.props.value)
    const { fields } = this.state
    const item = value.find((i) => i.rowId === record.rowId)
    if (!item) {
      return
    }

    item[column.value] = val

    if (tableRules && column.type === 'listSel') {
      // 常量关联赋值
      let constRules = []
      const field = fields.find((data) => data.code === column.source)

      // 把下拉外部字段的选中项存到field.params中，用于其他策略
      if (field.tabStatus === '1') {
        field.params = [...selected]
      }

      tableRules
        .filter((rule) => rule.observableCell === column.value && rule.type === 'const')
        .map((rule) => rule.constRules)
        .forEach((rules) => {
          constRules = constRules.concat(rules)
        })
      constRules.forEach((rule) => {
        const { cellCode, observableCellExpandCode } = rule
        // listSelExpand是下拉类型字段的扩展属性
        const param = field.params.find((data) => data.value === record[column.value].value)

        if (observableCellExpandCode === '_value') {
          item[cellCode] =
            field.tabStatus === '1' && record[column.value]
              ? record[column.value].value
              : record[column.value]
        } else {
          item[cellCode] = _.get(param, `listSelExpand.${observableCellExpandCode}`)
        }
      })
    }

    onChange(value)
  }

  // 给外部调用
  validate = (value) => {
    const { columns } = this.props
    const { fields } = this.state

    const error = columns.some((item) => {
      const field = fields.find((f) => f.code === item.source)
      return value.some((v) => validator(v[item.value], item, field))
    })

    this.setState({ error })
    return error
  }

  renderCell(column, record, parsedHideRules) {
    const { columns, scene } = this.props
    const { fields } = this.state
    if (isMatchHideRule(column, record, parsedHideRules, fields, columns)) {
      return null
    }

    const { disabled, tableRules, ticketId, tacheId } = this.props
    let field = {}

    if (column.type !== 'normal') {
      field = fields.find((item) => item.code === column.source) || {}
    }

    // 表格字段本身禁用 或者 不在表格字段编辑时引用的字段只读
    const fieldDisabled = disabled || (scene !== 'field' && column.readOnly === 1)

    // 只读
    if (fieldDisabled && column.type !== 'attachfile') {
      return <ReadOnly type={column.type} value={record[column.value]} field={field} />
    }

    switch (column.type) {
      case 'normal':
      case 'singleRowText':
        return (
          <SingleRowText
            field={field}
            disabled={fieldDisabled}
            placeholder={i18n('ticket.forms.pinput', '请输入')}
            value={record[column.value]}
            onChange={(value) => this.handleChange(value, column, record)}
          />
        )
      // return (
      //   <Input
      //     disabled={fieldDisabled}
      //     placeholder={i18n('ticket.forms.pinput', '请输入')}
      //     value={record[column.value]}
      //     onChange={e => this.handleChange(e.target.value, column, record)}
      //   />
      // )
      case 'multiRowText':
        return (
          <MultiRowText
            field={field}
            disabled={fieldDisabled}
            placeholder={i18n('ticket.forms.pinput', '请输入')}
            value={record[column.value]}
            onChange={(value) => this.handleChange(value, column, record)}
          />
        )
      case 'singleSel':
        return (
          <SelectWithColor
            disabled={fieldDisabled}
            isChooseColor={field.isChooseColor}
            options={field.params}
            value={record[column.value]}
            onChange={(val) => this.handleChange(val, column, record)}
          />
        )
      case 'multiSel':
        return (
          <NormalSelect
            mode="multiple"
            field={field}
            disabled={fieldDisabled}
            options={field.params}
            value={record[column.value]}
            onChange={(val) => this.handleChange(val, column, record)}
          />
        )
      case 'listSel':
        if (field.tabStatus === '1') {
          return (
            <OutsideSelect
              disabled={fieldDisabled}
              modelId={this.props.modelId}
              field={field}
              fields={fields}
              tableRules={tableRules}
              columns={columns}
              column={column}
              record={record}
              value={record[column.value]}
              onChange={(val, selected) => this.handleChange(val, column, record, selected)}
            />
          )
        } else if (field.tabStatus === '2') {
          return (
            <Dictionary
              disabled={fieldDisabled}
              field={field}
              value={record[column.value]}
              onChange={(val) => this.handleChange(val, column, record)}
            />
          )
        } else if (field.tabStatus === '0') {
          return (
            <NormalSelect
              mode={field.isSingle === '1' ? 'multiple' : ''}
              disabled={fieldDisabled}
              field={field}
              options={field.params}
              value={record[column.value]}
              onChange={(val) => this.handleChange(val, column, record)}
            />
          )
        } else {
          return null
        }
      case 'links':
        return (
          <Links
            disabled={fieldDisabled}
            value={record[column.value] || {}}
            onChange={(value) => this.handleChange(value, column, record)}
          />
        )
      case 'int':
        return (
          <React.Fragment>
            <InputNumber
              disabled={fieldDisabled}
              precision={0}
              min={field.intMin || 0}
              max={field.intMax || Number.MAX_SAFE_INTEGER}
              value={record[column.value]}
              onChange={(value) => this.handleChange(value, column, record)}
            />
            <span style={{ color: '#6ca4cd' }}>{field.unit}</span>
          </React.Fragment>
        )
      case 'double':
        return (
          <React.Fragment>
            <InputNumber
              disabled={fieldDisabled}
              min={field.doubleMin || 0}
              max={field.doubleMax || Number.MAX_SAFE_INTEGER}
              step={typeof field.precision === 'number' ? 1 / Math.pow(10, field.precision) : 0.01}
              precision={typeof field.precision === 'number' ? field.precision : 2}
              value={record[column.value]}
              onChange={(value) => this.handleChange(value, column, record)}
            />
            <span style={{ color: '#6ca4cd' }}>{field.unit}</span>
          </React.Fragment>
        )
      case 'dateTime':
        return (
          <DatePicker
            style={{ width: '100%' }}
            field={field}
            disabled={fieldDisabled}
            value={getDateTimeValue(record[column.value])}
            onChange={(value) => this.handleChange(value, column, record)}
          />
        )
      case 'attachfile':
        return (
          <Attachfile
            disabled={!ticketId || fieldDisabled}
            value={record[column.value] || []}
            field={field}
            ticketId={ticketId}
            tacheId={tacheId}
            onChange={(value) => this.handleChange(value, column, record)}
          />
        )
      case 'cascader':
        return (
          <Cascader
            disabled={fieldDisabled}
            value={record[column.value] || []}
            field={field}
            onChange={(value) => this.handleChange(value, column, record)}
          />
        )
      default:
        return null
    }
  }

  render() {
    const { mode, value, tableRules, error, ...rest } = this.props
    const parsedHideRules = parseHideRules(tableRules)
    const dilver = {
      ...rest,
      data: value,
      // canCopy: true,
      renderCell: (column, record) => {
        const field = this.state.fields.find((f) => f.code === column.source)
        const errorMes = this.state.error && validator(record[column.value], column, field)
        return (
          <Form.Item
            className="table-cell-form-item"
            validateStatus={errorMes ? 'error' : 'success'}
            help={errorMes || ''}
          >
            {this.renderCell(column, record, parsedHideRules)}
          </Form.Item>
        )
      },
      onChange: this.handleChange,
      onCopy: this.handleCopy,
      onDelete: this.handleDelete,
      onAdd: this.handleAdd,
      fields: this.state.fields
    }

    // if (!value || value.length === 0) {
    //   return null
    // }
    return (
      <div id="tc-content">
        {mode === TABLE_MODE && <TableView ref={this.tableRef} {...dilver} />}
        {mode === FORM_MODE && <FormView {...dilver} />}
      </div>
    )
  }
}

export default Content

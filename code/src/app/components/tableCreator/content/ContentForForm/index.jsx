import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Button, Form } from '@uyun/components'
import ImportButton from './ImportButton'
import FormView from './FormView'
import TableView from './TableView'
import OutsideSelect from '../../cell/outsieSelect'
import Dictionary from '../../cell/Dictionary'
import ReadOnly from '../../cell/ReadOnly'
import NestedTable from '../../cell/NestedTable'
import NormalCellWrapper from './NormalCellWrapper'
import uuid from '~/utils/uuid'
import { parseHideRules, isMatchHideRule, validator } from '../logic'
import TableStore from './TableStore'

import '../../index.less'
import _ from 'lodash'

// '0'表格模式, '1'表单模式
const TABLE_MODE = '0'
const FORM_MODE = '1'

@inject('tableListStore')
@observer
class ContentForForm extends Component {
  static defaultProps = {
    disabled: false,
    // value: [],
    columns: [],
    tableRules: [],
    mode: TABLE_MODE,
    ticketId: undefined, // 用于附件
    importAndExport: 0 // 是否支持导入导出
  }

  constructor(props) {
    super(props)

    const { ticketId, caseId, modelId, fieldCode, pageFlag, copyTicketId, columns } = props
    // 创建环节都不分页
    let pageShow = pageFlag
    if (
      window.location.href.indexOf('createTicket') !== -1 ||
      window.location.href.indexOf('createService') !== -1
    ) {
      pageShow = 0
    }
    this.store = new TableStore(
      {
        ticketId,
        caseId,
        modelId,
        fieldCode,
        contianeNestedTable: columns.filter((x) => x.type === 'nestedTable').map((x) => x.value)
      },
      { pageFlag: pageShow, copyTicketId }
    )
    props.tableListStore.push(this.store)

    this.state = {
      fields: [],
      allData: {},
      tableQueryFields: []
    }
  }

  async componentDidMount() {
    const { columns, value, ticketId, isRequired } = this.props
    const codes = this.getCodes(columns)

    this.store.setProps({
      columns,
      isRequired
    })
  }

  async componentDidUpdate(prevProps) {
    const { ticketTemplateId, isRequired, ticketId, fieldCode, allData } = this.props
    if (
      toJS(prevProps.tableListStore).tableQueryFields &&
      JSON.stringify(toJS(prevProps.tableListStore).tableQueryFields) !==
        JSON.stringify(this.state.tableQueryFields)
    ) {
      this.setState({ tableQueryFields: toJS(prevProps.tableListStore).tableQueryFields }, () => {
        const nextColumns = this.store.columns.slice().map((col) => {
          const nextCol = { ...col }
          if (nextCol.type === 'singleRowText') {
            const field = this.state.tableQueryFields.find((f) => f.code === nextCol.source) || {}
            nextCol.validation = field.validation
          }
          return nextCol
        })
        this.store.setProps({
          columns: nextColumns
        })
        this.setState({ fields: this.state.tableQueryFields })
        this.store.setProps({ fields: this.state.tableQueryFields })
      })
    }

    if (allData !== prevProps.allData) {
      if (_.isEmpty(allData[fieldCode])) allData[fieldCode] = {}
      const data = allData[fieldCode]?.list || []
      this.store.setProps({ data: data })
      const page = {
        pageNo: allData[fieldCode]?.pageNum || 1,
        pageSize: allData[fieldCode]?.pageSize || 20,
        total: allData[fieldCode]?.total || 0
      }
      this.store.setProps({ pagination: page })
    }

    if (ticketTemplateId !== prevProps.ticketTemplateId) {
      this.store.setProps({ ticketTemplateId })
      if (ticketTemplateId) {
        const res = await this.store.queryData({ ticketId: null, templateId: ticketTemplateId })
        if (_.isEmpty(res[fieldCode])) res[fieldCode] = {}
        // 如果表格有默认行，在新建工单打开的一瞬间就保存上了，切换模板时需要删除
        this.store.removeTicketDefaultData()
        this.store.setProps({ data: res[fieldCode]?.list })
        const page = {
          pageNo: res[fieldCode]?.pageNum || 1,
          pageSize: res[fieldCode]?.pageSize || 20,
          total: res[fieldCode]?.total || 0
        }
        this.store.setProps({ pagination: page })
      } else {
        // 会导致模板数据被覆盖先注释掉 hange
        // this.store.queryData()
      }
    } else if (isRequired !== prevProps.isRequired) {
      this.store.setProps({ isRequired })
    }
    // else if (ticketId && ticketId !== prevProps.ticketId) {

    //   const { params } = this.store
    //   this.store.setProps({ params: { ...params, ticketId } })
    //   const res = await this.store.queryData({ ticketId })
    //   if (_.isEmpty(res[fieldCode])) res[fieldCode] = {}
    //   this.store.setProps({ data: res[fieldCode]?.list })
    //   const page = {
    //     pageNo: res[fieldCode]?.pageNum || 1,
    //     pageSize: res[fieldCode]?.pageSize || 20,
    //     total: res[fieldCode]?.total || 0
    //   }
    //   this.store.setProps({ pagination: page })
    // }
  }

  componentWillUnmount() {
    this.props.tableListStore.quit(this.store)
  }

  getCodes = (columns) =>
    _.chain(columns)
      .filter((item) => item.type !== 'normal')
      .map((item) => item.source)
      .compact()
      .value()

  //   queryFields = async (codes) => {
  //     if (_.isEmpty(codes)) return

  //     const res = await axios.post(
  //       API.findFieldByCodeList,
  //       { fieldCodes: codes },
  //       { params: { modelId: this.props.modelId } }
  //     )
  //     // compact 过滤空的
  //     const fields = _.compact(res)

  //     // 查询单行文本字段的校验条件
  //     const nextColumns = this.store.columns.slice().map((col) => {
  //       const nextCol = { ...col }
  //       if (nextCol.type === 'singleRowText') {
  //         const field = fields.find((f) => f.code === nextCol.source) || {}
  //         nextCol.validation = field.validation
  //       }
  //       return nextCol
  //     })
  //     this.store.setProps({
  //       columns: nextColumns
  //     })

  //     this.setState({ fields })
  //     this.store.setProps({ fields })
  //     return fields
  //   }

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

  // 这里的selected参数为下拉外部数据源字段选中项的完整信息
  handleChange = (val, column, record, selected = [], from = 'inner') => {
    const { tableRules, tableListStore } = this.props
    const { data, setProps } = this.store
    const { fields } = this.state
    let nextData = toJS(data)
    if (from === 'nestedTable') {
      const item = nextData.find((i) => i.rowId === record.rowId)

      if (!item) {
        return
      }

      item.rowData[column.value] = val
      if (item.rowStatus !== 0) {
        item.rowStatus = 1
      }
      console.log('out store data', nextData, column, val, record, from)

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

          if (observableCellExpandCode === '_value') {
            item.rowData[cellCode] = field.tabStatus === '1' && val ? val.value : val
          } else {
            const param = field.params.find((data) => data.value === val.value)
            item.rowData[cellCode] = _.get(param, `listSelExpand.${observableCellExpandCode}`)
          }
        })
      }

      setProps({ data: nextData })
      this.props.onChange && this.props.onChange()
      tableListStore.validate([this.props.fieldCode])
    } else {
      const item = nextData.find((i) => i.rowId === record.rowId)

      if (!item) {
        return
      }

      item.rowData[column.value] = val
      if (item.rowStatus !== 0) {
        item.rowStatus = 1
      }
      console.log('out store data', nextData, column, val, record, from)

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

          if (observableCellExpandCode === '_value') {
            item.rowData[cellCode] = field.tabStatus === '1' && val ? val.value : val
          } else {
            const param = field.params.find((data) => data.value === val.value)
            item.rowData[cellCode] = _.get(param, `listSelExpand.${observableCellExpandCode}`)
          }
        })
      }

      setProps({ data: nextData })
      this.props.onChange && this.props.onChange()
      tableListStore.validate([this.props.fieldCode])
    }
  }

  handleAdd = () => {
    const { columns } = this.props
    const { fields } = this.state
    const { data, setProps } = this.store
    const nextData = toJS(data)
    const item = { rowId: uuid(), rowStatus: 0, rowData: {} }

    columns.forEach((col) => {
      item.rowData[col.value] = this.getItemDefaultValue(col, fields)
    })

    nextData.push(item)
    setProps({ data: nextData })
    this.props.onChange && this.props.onChange()
  }

  handleCopy = (record) => {
    const { data, setProps } = this.store
    const nextData = toJS(data)
    const index = nextData.findIndex((item) => item.rowId === record.rowId)
    const rowData = _.omit(record, 'rowId')
    const item = { rowData, rowId: uuid(), rowStatus: 0 }

    nextData.splice(index + 1, 0, item)
    setProps({ data: nextData })
    this.props.onChange && this.props.onChange()
  }

  handleDelete = (record) => {
    const { data, setProps } = this.store
    const nextData = toJS(data)
    const index = nextData.findIndex((item) => item.rowId === record.rowId)

    nextData[index].rowStatus = -1
    setProps({ data: nextData })
    this.props.onChange && this.props.onChange()
  }

  handlePaginationChange = async (page, size) => {
    const { fieldCode } = this.props
    const error = this.store.validate()

    if (error) {
      return
    }

    const res = await this.store.saveAndQueryData(null, { pageNo: page, pageSize: size })
    const data = res[fieldCode]?.list || []
    this.store.setProps({ data: data })
    const pages = {
      pageNo: res[fieldCode]?.pageNum || 1,
      pageSize: res[fieldCode]?.pageSize || 20,
      total: res[fieldCode]?.total || 0
    }
    this.store.setProps({ pagination: pages })
    // if (page) {
    //   // 分页切换时，先保存数据
    //   const res = await this.store.saveAndQueryData(null, { pageNo: page })
    //   const data = res[fieldCode]?.list || []
    //   this.store.setProps({ data: data })
    //   const pages = {
    //     pageNo: res[fieldCode]?.pageNum || 1,
    //     pageSize: res[fieldCode]?.pageSize || 20,
    //     total: res[fieldCode]?.total || 0
    //   }
    //   this.store.setProps({ pagination: pages })
    // }
    // if (size) {
    //   const res = await this.store.saveAndQueryData(null, { pageNo: 1, pageSize: size })
    //   const data = res[fieldCode]?.list || []
    //   this.store.setProps({ data: data })
    //   const page = {
    //     pageNo: res[fieldCode]?.pageNum || 1,
    //     pageSize: res[fieldCode]?.pageSize || 20,
    //     total: res[fieldCode]?.total || 0
    //   }
    //   this.store.setProps({ pagination: page })
    // }
  }

  renderCell(column, record, parsedHideRules) {
    const { columns, scene, fieldCode, isRequired } = this.props
    const { fields } = this.state
    if (isMatchHideRule(column, record, parsedHideRules, fields, columns)) {
      return null
    }
    const { disabled, tableRules, ticketId, tacheId } = this.props
    let field = {}

    if (column.type !== 'normal') {
      field = fields.find((item) => item.code === column.source) || {}
    }
    //获取脚本是否有只读状态isRequired为2的情况
    const scriptValidateRows = toJS(this.store.scriptValidateRows)
    let rowIDs = _.map(scriptValidateRows, (d) => d.rowId)
    let scriptIsrequired
    if (rowIDs.includes(record.rowId)) {
      let Index = scriptValidateRows.findIndex((d) => d.rowId === record.rowId)
      if (_.has(scriptValidateRows[Index].isRequired, column.value)) {
        scriptIsrequired = scriptValidateRows[Index].isRequired[column.value]
      }
    }
    // 表格字段本身禁用 或者 不在表格字段编辑时引用的字段只读
    const fieldDisabled =
      disabled ||
      isRequired === 2 ||
      scriptIsrequired === 2 ||
      (scene !== 'field' &&
        scriptIsrequired !== 0 &&
        scriptIsrequired !== 1 &&
        column.readOnly === 1)
    // 只读
    if (fieldDisabled && column.type !== 'attachfile' && column.type !== 'nestedTable') {
      return (
        <ReadOnly
          type={column.type}
          fieldCode={fieldCode}
          value={record[column.value]}
          field={field}
        />
      )
    }

    // 外部数据源的下拉字段
    if (column.type === 'listSel' && field.tabStatus === '1') {
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
          size="small"
          value={record[column.value]}
          onChange={(val, selected) => this.handleChange(val, column, record, selected)}
        />
      )
    }

    if (column.type === 'nestedTable') {
      return (
        <NestedTable
          disabled={fieldDisabled}
          column={column}
          field={field}
          record={record}
          ticketId={ticketId}
          tacheId={tacheId}
          columns={columns}
          onChange={(val) => this.handleChange(val, column, record, [], 'nestedTable')}
        />
      )
    }
    // 字典的下拉字段
    if (column.type === 'listSel' && field.tabStatus === '2') {
      return (
        <Dictionary
          disabled={fieldDisabled}
          field={field}
          size="small"
          value={record[column.value]}
          onChange={(val) => this.handleChange(val, column, record)}
        />
      )
    }

    // 除外部数据源的下拉字段以外的字段
    return (
      <NormalCellWrapper
        type={column.type}
        field={field}
        disabled={fieldDisabled}
        value={record[column.value]}
        onChange={(val) => this.handleChange(val, column, record)}
        ticketId={ticketId}
        tacheId={tacheId}
        tableColCode={column.value}
      />
    )
  }

  render() {
    const {
      mode,
      tableRules,
      ticketId,
      caseId,
      modelId,
      fieldCode,
      importAndExport,
      tableImportValidate,
      ...rest
    } = this.props
    const { data, pagination, loading, error } = this.store
    const parsedHideRules = parseHideRules(tableRules)
    // 过滤掉删除操作过的行
    const filterData = _.filter(toJS(data), (item) => item.rowStatus !== -1).map((item) => ({
      rowId: item.rowId,
      ...item.rowData
    }))
    const dilver = {
      ...rest,
      fieldCode,
      data: filterData,
      pagination,
      loading,
      // canCopy: true,
      renderCell: (column, record) => {
        record = { ...record }
        if (column.type === 'nestedTable') {
          console.log('rendercell', column, record)
          if (record[column.value] && record[column.value].length > 0) {
            record[column.value] = record[column.value].map((x) => {
              if (x.rowId) return x
              return {
                rowId: uuid(),
                rowStatus: 0,
                rowData: { ...x }
              }
            })
          } else {
            record[column.value] = []
          }
        }
        const scriptValidateRows = toJS(this.store.scriptValidateRows)
        const field = this.store.fields.find((f) => f.code === column.source)
        let errorMes = ''
        if (!rest.disabled && rest.isRequired !== 2) {
          let rowIDs = _.map(scriptValidateRows, (d) => d.rowId)
          let column2 = _.clone(column)
          if (rowIDs.includes(record.rowId)) {
            let Index = scriptValidateRows.findIndex((d) => d.rowId === record.rowId)
            if (_.has(scriptValidateRows[Index].isRequired, column2.value)) {
              column2.isRequired = scriptValidateRows[Index].isRequired[column2.value]
            }
            errorMes = validator(record[column2.value], column2, field)
          } else {
            errorMes = validator(record[column.value], column, field)
          }
        }

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
      onPaginationChange: this.handlePaginationChange,
      onChange: this.handleChange,
      onCopy: this.handleCopy,
      onDelete: this.handleDelete,
      onAdd: this.handleAdd
    }
    return (
      <div id="tc-content">
        {importAndExport === 1 && !rest.disabled && rest.isRequired !== 2 && (
          <ImportButton
            store={this.store}
            ticketId={ticketId}
            caseId={caseId}
            modelId={modelId}
            fieldCode={fieldCode}
            disabled={this.props.isRequired === 2}
            onSuccess={async () => {
              const res = await this.store.queryData({ pageNo: 1 })
              if (res) {
                const data = res[fieldCode]?.list || []
                this.store.setProps({ data: data })
                const pages = {
                  pageNo: res[fieldCode]?.page || 1,
                  pageSize: res[fieldCode]?.pageSize || 20,
                  total: res[fieldCode]?.total || 0
                }
                this.store.setProps({ pagination: pages })
                this.props.onChange && this.props.onChange()
                tableImportValidate(fieldCode)
              }
              // this.store.queryData({ pageNo: 1 }).then(() => {
              //   this.props.onChange && this.props.onChange()
              // })
            }}
          />
        )}
        {importAndExport === 1 && rest.isRequired !== 2 && (
          <Button
            style={{ marginRight: 10 }}
            disabled={toJS(data)?.length === 0}
            //   type="primary"
            onClick={() => this.store.saveAndExport()}
          >
            导出
          </Button>
        )}
        {mode === TABLE_MODE && <TableView {...dilver} />}
        {mode === FORM_MODE && <FormView {...dilver} />}
        <span className="error-span">{error}</span>
      </div>
    )
  }
}

export default ContentForForm

import React, { Component } from 'react'
import { Input, Modal, Table, Button } from '@uyun/components'
import {
  CloseCircleOutlined,
  CopyOutlined,
  PlusOutlined,
  QuestionCircleOutlined
} from '@uyun/icons'
import uuid from '~/utils/uuid'
import NestedTableInner from './NestedTableInner'
import _ from 'lodash'

class NestedTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
  }

  async componentDidMount() {
    const { columns, column, record } = this.props
    let cachedNestedTable = JSON.parse(sessionStorage.getItem('cachedNestedTable')) || {}
    if (!_.get(cachedNestedTable, column.tableCode)) {
      //获取所有的tableCode，获取所有列后存入sessionStorage
      let codes = columns
        .filter((c) => {
          if (!_.get(cachedNestedTable, c.tableCode) && c.type === 'nestedTable') {
            return true
          }
        })
        .map((c) => c.tableCode)
      const res = await axios.post(API.findFieldByCodeList, { fieldCodes: codes })
      _.omit()
      _.forEach(res, (c) => {
        cachedNestedTable[c.code] = {
          columns: c.params,
          defaultValue: (JSON.parse(c.defaultValue) || []).map((x) => {
            return { rowId: x.rowId, rowStatus: 0, rowData: _.omit(x, ['rowId']) }
          })
        }
      })
      sessionStorage.setItem('cachedNestedTable', JSON.stringify(cachedNestedTable))
      //把res里的params的所有source去重放到数组里
      let sources = []
      _.forEach(res, (r) => {
        _.forEach(_.get(r, 'params') || [], (p) => {
          if (p.source) {
            sources.push(p.source)
          }
        })
      })
      sources = new Array(...new Set(sources))
      const fieldsRes = await axios.post(API.findFieldByCodeList, { fieldCodes: sources })
      sessionStorage.setItem('cachedFields', JSON.stringify(fieldsRes))
    }
    //从缓存获取所有列
    this.setState({
      innerTableColumns: cachedNestedTable[column.tableCode].columns
    })
    if (_.get(record, column.value) && _.get(record, column.value).length > 0) {
      this.setState({
        innerTableData: record[column.value]
      })
    } else {
      this.setState({
        innerTableData: Array.isArray(cachedNestedTable[column.tableCode].defaultValue)
          ? cachedNestedTable[column.tableCode].defaultValue
          : []
      })
    }
  }

  handleOpenModal = () => {
    this.setState({ visible: true })
  }

  onModalOk = () => {
    this.setState({ visible: false })
  }

  onModalCancel = () => {
    this.setState({ visible: false })
  }

  handleChange = (data) => {
    this.props.onChange(data)
  }

  render() {
    const { field, column, tacheId, ticketId, disabled } = this.props
    const { visible, innerTableData, innerTableColumns } = this.state
    return (
      <div>
        <span onClick={this.handleOpenModal}>{field.inlineName}</span>
        <Modal open={visible} title="编辑表格" onOk={this.onModalOk} onCancel={this.onModalCancel}>
          <NestedTableInner
            scene="ticket"
            allData={undefined}
            isRequired={0}
            disabled={disabled}
            mode={'0'}
            from={'nestedTable'}
            modelId={'e39491ca988c4f0c97bc1eedc4690a03'}
            columns={innerTableColumns}
            tableRules={null}
            fieldCode={column.tableCode}
            copyTicketId={undefined} // 复制工单时，传被复制的ticketId
            ticketTemplateId={''}
            ticketId={ticketId}
            tacheId={tacheId}
            caseId={undefined}
            importAndExport={0}
            pageFlag={0} // 是否需要分页
            canCopy={true}
            error={false}
            value={innerTableData}
            onChange={this.handleChange}
            onRowOk={() => {}}
            tableImportValidate={undefined}
            showOkTables={[]}
          />
        </Modal>
      </div>
    )
  }
}

export default NestedTable

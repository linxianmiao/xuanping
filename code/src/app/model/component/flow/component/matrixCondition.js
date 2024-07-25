import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Select, Card } from '@uyun/components'
import matrixTargetList from '../../../config/matrixTargetList'
const Option = Select.Option

@inject('matrixStore')
@observer
class MatrixCondition extends Component {
  componentDidMount () {
    this.props.matrixStore.getEnableList()
  }

  onSelect = (value, type) => {
    const { matrixId, matrixTarget, fromMatrix, toMatrix } = this.props.value
    if (type === 'matrixId') {
      this.props.onChange({ matrixId: value, matrixTarget, fromMatrix: undefined, toMatrix: undefined })
    } else if (type === 'matrixTarget') {
      this.props.onChange({ matrixId, matrixTarget: value, fromMatrix, toMatrix })
    } else if (type === 'fromMatrix') {
      this.props.onChange({ matrixId, matrixTarget, fromMatrix: value, toMatrix: undefined })
    } else if (type === 'toMatrix') {
      this.props.onChange({ matrixId, matrixTarget, fromMatrix, toMatrix: value })
    }
  }

  render () {
    const { matrixEnableList } = this.props.matrixStore
    const { matrixId, matrixTarget, fromMatrix, toMatrix } = this.props.value
    let columnList = []
    if (matrixId && !_.isEmpty(matrixEnableList)) {
      columnList = _.find(matrixEnableList, matrix => matrix.id === matrixId).columnList
    }
    return (
      <div className="model-matrix-condition">
        <Select
          showSearch
          value={matrixId}
          optionFilterProp="children"
          style={{ marginBottom: 10, width: 192 }}
          placeholder={i18n('globe.select', '请选择')}
          notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
          onChange={(value) => { this.onSelect(value, 'matrixId') }}
        >
          {_.map(matrixEnableList, matrix => <Option key={matrix.id} value={matrix.id}>{matrix.name}</Option>)}
        </Select>
        <Card>
          <div className="model-matrix-condition-card">
            <span>{i18n('if', '如果')}</span>
            <Select
              showSearch
              value={matrixTarget}
              dropdownMatchSelectWidth={false}
              optionFilterProp="children"
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
              onChange={(value) => { this.onSelect(value, 'matrixTarget') }}
            >
              {_.map(matrixTargetList, matrix => <Option key={matrix.value} value={matrix.value}>{matrix.name}</Option>)}
            </Select>
            <span>{i18n('model-contain-matrix-condition', '属于矩阵中的')}</span>
            <Select
              showSearch
              value={fromMatrix}
              optionFilterProp="children"
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
              onChange={(value) => { this.onSelect(value, 'fromMatrix') }}
            >
              {_.map(columnList, column => <Option key={column.columnId} value={column.columnId}>{column.columnName}</Option>)}
            </Select>
            <span>{i18n('model-matrix-condition-executor', '那么当前处理人为')}</span>
            <Select
              showSearch
              value={toMatrix}
              optionFilterProp="children"
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
              onChange={(value) => { this.onSelect(value, 'toMatrix') }}
            >
              {_.map(columnList, column => <Option key={column.columnId} value={column.columnId}>{column.columnName}</Option>)}
            </Select>
          </div>
        </Card>
      </div>
    )
  }
}

export default MatrixCondition

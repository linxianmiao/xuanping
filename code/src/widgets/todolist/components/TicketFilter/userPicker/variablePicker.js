import React from 'react'
import { inject, observer } from 'mobx-react'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'
import { StoreConsumer } from './config'
import variableList from './variable'
@inject('userPickStore')
@observer
export default class VariablePicker extends BasicPicker {
  static defaultProps = {
    extendQuery: {}
  }

  get extendQuery() {
    return {
      type: 5,
      modelId: this.props.extendQuery.modelId
    }
  }

  render() {
    const { rowKey, type, onChangeUseVariable, useVariable } = this.props
    const { query, list } = this.state
    const selectedRowKeys = _.map(this.props.value.variables, item => item.id)
    const columns = [
      {
        title: i18n('name', '名称'),
        dataIndex: 'name'
      }, {
        title: i18n('ticket.create.type', '类型'),
        dataIndex: 'variableType',
        render: text => {
          // 特别注意，变量的类型和该人员组件的类型对应的不一样
          const typeObj = _.find(variableList, variable => variable.value === text)
          return typeObj.label
        }
      }, {
        title: i18n('field_code', '编码'),
        dataIndex: 'code'
      }, {
        title: i18n('listSel.input_tips3', '描述'),
        dataIndex: 'description'
      }
    ]
    return (
      <StoreConsumer>
        {
          ({ props }) => (
            <PickerPane
              query={query}
              columns={columns}
              dataSource={list}
              type={type}
              rowKey={rowKey}
              useVariable={useVariable}
              selectionType={props.selectionType}
              selectedRowKeys={selectedRowKeys}
              onSelectAll={this.onSelect}
              onSelect={this.onSelect}
              handleChangeQuery={this.handleChangeQuery}
              onChangeUseVariable={onChangeUseVariable}
            />
          )
        }
      </StoreConsumer>
    )
  }
}

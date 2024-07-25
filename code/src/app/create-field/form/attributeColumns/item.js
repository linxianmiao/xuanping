import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Select, Input } from '@uyun/components'
const Option = Select.Option
export default class Item extends Component {
    handleChangeCode = code => {
      const { index, expandField } = this.props
      const field = _.find(expandField, field => field.code === code)
      this.props.handleChange(_.assign({ code }, {
        type: field.type,
        name: field.name
      }), index)
    }

    handleChangeValue = selectValue => {
      const { index, item } = this.props
      item.value = selectValue
      this.props.handleChange(item, index)
    }

    render () {
      const { expandField, item, index } = this.props
      const selectParams = _.find(expandField, field => field.code === item.code)
      return (
        <div className="clearfix resource-attributeColumns-item">
          <Select
            value={item.code}
            showSearch
            optionFilterProp="children"
            notFoundContent={i18n('globe.not_find', '无法找到')}
            style={{ width: '200px', float: 'left', marginRight: '10px' }}
            onChange={this.handleChangeCode}>
            {_.map(expandField, (item, index) => <Option key={index} value={item.code}>{item.name}</Option>)}
          </Select>
          {
            (/multiSel|singleSel|listSel/.test(item.type) && selectParams) &&
            <Select
              mode="multiple"
              showSearch
              value={toJS(item.value)}
              optionFilterProp="children"
              notFoundContent={i18n('globe.not_find', '无法找到')}
              style={{ width: '200px', float: 'left', marginRight: '10px' }}
              onChange={this.handleChangeValue}>
              {_.map(selectParams.dict.items, item => <Option key={item.code} value={item.code}>{item.name}</Option>)}
            </Select>
          }
          {
            /singleRowText/.test(item.type) &&
            <Input
              style={{ width: '200px', float: 'left', marginRight: '10px' }}
              onChange={e => { this.handleChangeValue(e.target.value) }} />
          }
          <i className="icon-guanbi1 iconfont del" onClick={() => {
            this.props.handleDel(index)
          }} />
        </div>
      );
    }
}

import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Input, Button, Checkbox, Select } from '@uyun/components'

const OptGroup = Select.OptGroup
const Option = Select.Option

class QueryParams extends Component {
  static defaultProps = {
    data: [],
    onChange: () => {}
  }

  handleChange = (value, field, index) => {
    const { data, onChange } = this.props
    const nextData = _.cloneDeep(data)

    nextData[index][field] = value
    onChange(nextData)
  }

  handleSelectVariable = (variable, index) => {
    const { data, onChange } = this.props
    const nextData = _.cloneDeep(data)
    const value = nextData[index].value

    nextData[index].value = (value || '') + variable
    onChange(nextData)
  }

  handleDelete = index => {
    const { data, onChange } = this.props
    const nextData = _.cloneDeep(data)

    nextData.splice(index, 1)
    onChange(nextData)
  }

  handleAdd = () => {
    const { data, onChange } = this.props
    const nextData = _.cloneDeep(data)

    nextData.push({
      key: undefined,
      value: undefined,
      selected: false
    })
    onChange(nextData)
  }

  render() {
    const { data } = this.props

    return (
      <div className="ajax-wrap ajax-headers-wrap">
        {data.map((item, index) => {
          return (
            <div key={index} className="ajax-wrap-item">
              <span className="item-select">
                <Checkbox
                  checked={item.selected}
                  onChange={e => this.handleChange(e.target.checked, 'selected', index)}
                />
              </span>
              <span className="body-param-name">
                <Input
                  placeholder={i18n('listSel.input_tips1', '请输入参数名（字母或数字）')}
                  value={item.key}
                  onChange={e => this.handleChange(e.target.value, 'key', index)}
                />
              </span>
              <span className="body-param-value">
                <Input
                  placeholder={i18n('listSel.input_tips2', '请输入参数值，可插入变量')}
                  value={item.value}
                  onChange={e => this.handleChange(e.target.value, 'value', index)}
                />
              </span>
              <button
                className="field-options-btn iconfont icon-shanchu"
                onClick={() => this.handleDelete(index)}
              />
            </div>
          )
        })}
        <Button
          className="add-param"
          type="primary"
          icon={<PlusOutlined />}
          onClick={this.handleAdd}
        >
          {i18n('add_options', '添加选项')}
        </Button>
      </div>
    );
  }
}

export default QueryParams

import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Input, Button } from '@uyun/components'

class Headers extends Component {
  static defaultProps = {
    value: [],
    onChange: () => {}
  }

  handleChange = (val, index, type) => {
    const { value, onChange } = this.props
    const nextValue = _.cloneDeep(value)

    nextValue[index][type] = val
    onChange(nextValue)
  }

  handleAdd = () => {
    const { value, onChange } = this.props
    const nextValue = _.cloneDeep(value)

    nextValue.push({ paramName: '', paramValue: '' })

    onChange(nextValue)
  }

  handleDelete = index => {
    const { value, onChange } = this.props
    const nextValue = _.cloneDeep(value)

    nextValue.splice(index, 1)
    onChange(nextValue)
  }

  render() {
    const { value } = this.props

    return (
      <div className="ajax-wrap ajax-headers-wrap">
        {
          _.map(value, (item, index) => {
            return (
              <div key={index} className="ajax-wrap-item">
                <span className="headers-param-name">
                  <Input
                    value={item.paramName}
                    onChange={e => this.handleChange(e.target.value, index, 'paramName')}
                  />
                </span>
                <span className="headers-param-value">
                  <Input
                    value={item.paramValue}
                    onChange={e => this.handleChange(e.target.value, index, 'paramValue')}
                  />
                </span>
                {
                  value.length > 1 && (
                    <button
                      className="field-options-btn iconfont icon-shanchu"
                      onClick={() => this.handleDelete(index)}
                    />
                  )
                }
              </div>
            )
          })
        }
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

export default Headers

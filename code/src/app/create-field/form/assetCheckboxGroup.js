import React, { Component } from 'react'
import { CloseCircleOutlined, EditOutlined } from '@uyun/icons'
import { Form, Checkbox, Input, Tooltip } from '@uyun/components'
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
class AssetCheckboxGroup extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, inputValue } = this.props
    const suffix = inputValue ? <CloseCircleOutlined onClick={this.emitEmpty} /> : null
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue || []
        })(
          <CheckboxGroup>
            {_.map(item.params, (ite, index) => {
              return (
                <CheckboxItem
                  item={ite}
                  suffix={suffix}
                  index={index}
                  value={defaultValue[index]}
                />
              )
            })}
          </CheckboxGroup>
        )}
      </FormItem>
    )
  }
}

export default AssetCheckboxGroup
class CheckboxItem extends Component {
  constructor(props) {
    super()
    this.state = {
      showEdit: false
    }
  }

  handleClick = () => {
    this.setState({
      showEdit: true
    })
  }

  render() {
    const { item, suffix, index } = this.props
    return (
      <div style={{ margin: '5px 0' }}>
        <Checkbox disabled={item.disable} value={item.value} index={index}>
          {item.label}
        </Checkbox>
        {this.state.showEdit ? (
          <Input suffix={suffix} prefix={<EditOutlined />} style={{ width: '70%' }} />
        ) : (
          <Tooltip title={i18n('asset.tips', '自定义名称')}>
            <EditOutlined onClick={this.handleClick} />
          </Tooltip>
        )}
      </div>
    )
  }
}

import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form } from '@uyun/components'
import AppSelect from '~/components/AppSelect'

const FormItem = Form.Item

class AppSelectWrapper extends Component {
  state = {
    value: undefined
  }

  componentDidMount() {
    const { value, appName } = this.props
    this.setStateValue(value, appName)
  }

  componentDidUpdate(prevProps) {
    const { value, appName } = this.props

    if (value !== prevProps.value) {
      this.setStateValue(value, appName)
    }
  }

  setStateValue = (value, appName) => {
    let label = appName || value

    // 1008表示ITSM，因为ITSM不在应用接入列表中，所以后端不会返回ITSM名称
    if (value === '1008') {
      label = 'ITSM'
    }

    this.setState({
      value: value ? { key: value, label } : undefined
    })
  }

  handleChange = value => {
    const appCode = value ? value.key : undefined
    this.props.onChange(appCode)
  }

  render() {
    return (
      <AppSelect
        disabled={this.props.disabled}
        value={this.state.value}
        onChange={this.handleChange}
      />
    )
  }
}

@inject('globalStore')
@observer
export default class AppField extends Component {
  render() {
    const { item, getFieldDecorator, formItemLayout, defaultValue, appName } = this.props
    const { configAuthor } = this.props.globalStore
    const disabled = !configAuthor.appAccessPermission

    return (
      <FormItem {...formItemLayout} label={item.name}>
        {
          getFieldDecorator(item.code, {
            initialValue: defaultValue || '1008', // 默认选中ITSM
            rules: [{
              required: item.required === 1,
              message: `${i18n('ticket.create.select', '请选择')}${item.name}`
            }]
          })(
            <AppSelectWrapper disabled={disabled} appName={appName} />
          )
        }
      </FormItem>
    )
  }
}

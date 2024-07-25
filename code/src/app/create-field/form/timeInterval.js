import React, { Component } from 'react'
import { Form, Input, Select } from '@uyun/components'
const FormItem = Form.Item
const Option = Select.Option
class TimeInterval extends Component {
  constructor (props) {
    super(props)
    // 后端的defaultValue是string格式
    this.state = {
      values: typeof props.defaultValue === 'string' ? JSON.parse(props.defaultValue) : props.defaultValue
    }
  }

    handleChangeHours = value => {
      const values = _.assign({}, this.state.values, { hour: value })
      const { setFieldsValue, item } = this.props
      this.setState({
        values
      }, () => {
        setFieldsValue({ [item.code]: JSON.stringify(values) })
      })
    }

    handleChangeMinute = value => {
      const values = _.assign({}, this.state.values, { minute: value })
      const { setFieldsValue, item } = this.props
      this.setState({
        values
      }, () => {
        setFieldsValue({ [item.code]: JSON.stringify(values) })
      })
    }

    handleDayChange = e => {
      const reg = /^[0-9]*$/
      if (reg.test(e.target.value)) {
        const { setFieldsValue, item } = this.props
        const values = _.assign({}, this.state.values, { date: e.target.value })
        this.setState({
          values
        }, () => {
          setFieldsValue({ [item.code]: JSON.stringify(values) })
        })
      }
    }

    render () {
      const { date, hour, minute } = this.state.values
      const { formItemLayout, item, getFieldDecorator, defaultValue, getFieldValue } = this.props
      const timeRule = getFieldValue('timeRule') // 获取当前的时间规则
      return (
        <FormItem {...formItemLayout} label={item.name}>
          {getFieldDecorator(item.code, {
            initialValue: defaultValue,
            rules: [{
              required: item.required === 1
            }]
          })(
            <div>
              {timeRule === '1' && <Input
                placeholder={i18n('day', '天')} style={{ width: 56 }} value={date}
                onChange={this.handleDayChange} />}
              {timeRule === '1' && <span style={{ padding: '0 5px' }}>{i18n('day', '天')}</span>}
              <Select
                value={hour}
                placeholder={i18n('hours', '小时')}
                onChange={this.handleChangeHours}
                style={{ width: 60, display: 'inline-block' }}
                getPopupContainer={() => document.getElementById('defaultValue')}>
                {Array.from({ length: 24 }, (item, idx) => idx < 10 ? `0${idx}` : `${idx}`).map(item => <Option key={item} value={item}>{item}</Option>)}
              </Select>
              <span style={{ padding: '0 5px' }}>{i18n('hours', '小时')}</span>
              <Select
                value={minute}
                onChange={this.handleChangeMinute}
                placeholder={i18n('minute', '分钟')}
                style={{ width: 60, display: 'inline-block' }}
                getPopupContainer={() => document.getElementById('defaultValue')}>
                {Array.from({ length: 60 }, (item, idx) => idx < 10 ? `0${idx}` : `${idx}`).map(item => <Option key={item} value={item}>{item}</Option>)}
              </Select>
              <span style={{ padding: '0 5px' }}>{i18n('minute', '分钟')}</span>
            </div>
          )}
        </FormItem>
      )
    }
}
export default TimeInterval

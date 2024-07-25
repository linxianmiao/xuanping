import React, { Component } from 'react'
import { Form, Radio } from '@uyun/components'
import { Common } from '../index'
import CommonConfig from '../../config/commonConfig'
import value from '../../../trigger/config/defaultValue'

const RadioGroup = Radio.Group
const FormItem = Form.Item

const DEFAULTVALUE_LIST = [
  { label: i18n('system_time', '系统时间'), value: '1' },
  { label: i18n('no_time', '无'), value: '2' }
]

const TIMESCOPE_LIST = [
  { label: i18n('time_no', '全部'), value: 0 },
  { label: i18n('time_pase', '未来时间'), value: 1 },
  { label: i18n('time_future', '过去时间'), value: 2 }
]

const TIMEGRANULARITY_LIST = [
  { label: i18n('month', '月'), value: 0 },
  // { label: i18n('week', '周'), value: 1 },
  { label: i18n('conf.model.ruleTime', '日期'), value: 2 },
  { label: i18n('date-time-m', '日期+时间(分)'), value: 3 },
  { label: i18n('date-time-s', '日期+时间(秒)'), value: 4 }
]
class Index extends Component {
  componentDidMount() {
    const { timeGranularity } = this.props.store.fieldData || {}
    this.timeGranularity = timeGranularity
  }

  render() {
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: CommonConfig,
      type: 'dateTime'
    })
    const { formItemLayout } = this.props
    const { defaultValue, timeGranularity, timeScope } = this.props.store.fieldData || {}

    return (
      <Common {...diliver}>
        <FormItem label={i18n('default_value', '默认值')} {...formItemLayout}>
          {getFieldDecorator('defaultValue', {
            initialValue: defaultValue ?? undefined
          })(
            <RadioGroup buttonStyle="outline">
              {_.map(DEFAULTVALUE_LIST, (item, i) => (
                <Radio.Button value={item.value} key={i}>
                  {item.label}
                </Radio.Button>
              ))}
            </RadioGroup>
          )}
        </FormItem>

        <FormItem label={i18n('timeGranularity', '时间粒度')} {...formItemLayout}>
          {getFieldDecorator('timeGranularity', {
            initialValue: timeGranularity ?? undefined,
            normalize: (value) => {
              this.timeGranularity = value
              return value
            }
          })(
            <RadioGroup buttonStyle="outline">
              {_.map(TIMEGRANULARITY_LIST, (item, i) => (
                <Radio.Button value={item.value} key={i}>
                  {item.label}
                </Radio.Button>
              ))}
            </RadioGroup>
          )}
        </FormItem>

        {[2, 3, 4].includes(this.timeGranularity) && (
          <FormItem label={i18n('tobe_value_range', '时间范围')} {...formItemLayout}>
            {getFieldDecorator('timeScope', {
              initialValue: timeScope ?? undefined
            })(
              <RadioGroup buttonStyle="outline">
                {_.map(TIMESCOPE_LIST, (item, i) => (
                  <Radio.Button value={item.value} key={i}>
                    {item.label}
                  </Radio.Button>
                ))}
              </RadioGroup>
            )}
          </FormItem>
        )}
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(Index)

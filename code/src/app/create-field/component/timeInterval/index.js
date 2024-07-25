import React, { Component } from 'react'
import { Form } from '@uyun/components'

import TimeIntervalConfig from './timeIntervalConfig'
import { Common } from '../index'

class Index extends Component {
  render () {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      config: TimeIntervalConfig,
      type: 'dateTime'
    })
    return (
      <Common {...diliver} />
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(Index)

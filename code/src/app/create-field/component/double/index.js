import React, { Component } from 'react'
import { Form } from '@uyun/components'

import DoubleConfig from './doubleConfig'
import { Common } from '../index'

class Index extends Component {
  render () {
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: DoubleConfig,
      type: 'double'
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

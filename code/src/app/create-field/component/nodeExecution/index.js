import React, { Component } from 'react'
import { Form } from '@uyun/components'
import NodeExecutionConfig from './nodeExecutionConfig'

import {
  Common
} from '../index'

class NodeExecution extends Component {
  render () {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      setFieldsValue,
      getFieldValue,
      getFieldDecorator,
      config: NodeExecutionConfig,
      type: 'nodeExecution'
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
})(NodeExecution)

import React, { Component } from 'react'
import { Form } from '@uyun/components'
import configList from '../config'
import IntConfig from './intConfig'
import { Common } from '../index'

class Int extends Component {
  render() {
    const { source } = this.props
    const { getFieldDecorator, setFieldsValue } = this.props.form

    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: source === 'dataBase' ? configList(IntConfig) : IntConfig,
      type: 'int'
    })
    return <Common {...diliver} />
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(Int)

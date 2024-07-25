import React, { Component } from 'react'
import { Form } from '@uyun/components'
import { Common } from '../index'
import CommonConfig from '../../config/commonConfig'

const FormItem = Form.Item

class Index extends Component {
  render() {
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: CommonConfig,
      type: 'btn'
    })
    return <Common {...diliver} />
  }
}

export default Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    props.onValuesChange && props.onValuesChange()
  }
})(Index)

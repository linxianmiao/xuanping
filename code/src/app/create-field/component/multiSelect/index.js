import React, { Component } from 'react'
import { Form } from '@uyun/components'

import MultiSelectConfig from './multiSelectConfig'
import { Common } from '../index'

class MultiSelect extends Component {
  render () {
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: MultiSelectConfig,
      type: 'multiSel'
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
})(MultiSelect)

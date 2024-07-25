import React, { Component } from 'react'
import { Form } from '@uyun/components'

import SingleSelectConfig from './singleSelectConfig'
import { Common } from '../index'

class SingleSelect extends Component {
  render () {
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      config: SingleSelectConfig,
      type: 'singleSel'
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
})(SingleSelect)

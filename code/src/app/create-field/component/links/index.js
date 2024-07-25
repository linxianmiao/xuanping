import React, { Component } from 'react'
import { Form } from '@uyun/components'
import LinksConfig from './linksConfig'

import {
  Common
} from '../index'

class Links extends Component {
  render () {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      setFieldsValue,
      getFieldValue,
      getFieldDecorator,
      config: LinksConfig,
      type: 'links'
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
})(Links)

import React, { Component } from 'react'
import { Form } from '@uyun/components'

import ExcelImportConfig from './excelImportConfig'
import { Common } from '../index'

class Excel extends Component {
  render () {
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: ExcelImportConfig,
      type: 'excelImport'
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
})(Excel)

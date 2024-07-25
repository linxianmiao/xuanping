import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
import { Provider } from 'mobx-react'
import Common from './common'
import CreateFieldStore from '../stores/CreateFieldStore'
const FormItem = Form.Item
const createFieldStore = new CreateFieldStore()
@Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})
export default class FieldCreate extends Component {
  static defaultProps = {
    formItemLayout: {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 }
    }
  }

  render () {
    return (
      <Provider createFieldStore={createFieldStore}>
        <Common {...this.props} />
      </Provider>
    )
  }
}

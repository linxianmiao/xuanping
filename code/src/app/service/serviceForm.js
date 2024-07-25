import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Form } from '@uyun/components'
import { BASE_PARAMS } from './config'
import SingleRowText from '../ticket/forms/singleRowText'
import Double from '../ticket/forms/double'
import Int from '../ticket/forms/int'
import SingleSel from '../ticket/forms/singleSel'
class ServiceForm extends Component {
  render () {
    const { getFieldDecorator } = this.props.form
    const { serviceData } = this.props
    const params = serviceData.base_params ? JSON.parse(serviceData.base_params) : {}
    const { realname, email, mobile, phone } = runtimeStore.getState().user || {}
    return (
      <Form>
        {_.map(BASE_PARAMS, item => {
          if (params[item.code] !== undefined && +params[item.code] !== 2) {
            let initialValue
            if (item.code === 'requester') {
              initialValue = realname
            } else if (item.code === 'email') {
              initialValue = email
            } else if (item.code === 'phone') {
              initialValue = mobile || phone
            } else if (item.code === 'priority') {
              initialValue = '3'
            }
            item.isRequired = +params[item.code]
            const dilver = {
              getFieldDecorator,
              initialValue,
              field: _.assign({}, item, { fieldLabelLayout: 'vertical' })
            }

            switch (item.code) {
              case 'requester':
              case 'email':
              case 'phone':
              case 'content': return <SingleRowText key={item.code} {...dilver} />
              case 'priority': return <SingleSel key={item.code} {...dilver} />
              case 'amount' : return <Double key={item.code} {...dilver} />
              default : return <Int key={item.code} {...dilver} />
            }
          }
        })}
      </Form>
    )
  }
}
export default Form.create()(ServiceForm)

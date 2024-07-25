import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Input } from '@uyun/components'
const FormItem = Form.Item

@inject('globalStore')
@observer
class ITSMInput extends Component {
  handleCheckSingleRowText = (item, rule, value, callback) => {
    const {nameList , errMes} = this.props
    const { filterNamesByRegular } = this.props.globalStore
    const reg = new RegExp('[|;&$%><`\\!]')
    // const reg = new RegExp("[`~·!@#$^&*()《》_|{}':;',\\[\\]%.?~！@#￥……&*（\\-\\+）——|{}【】‘；：”“'。，、？]")
    if (!value) {
      callback(`${i18n('ticket.forms.pinput' , '请输入')}${item.name}`)
    }
    if(value && reg.test(value) && filterNamesByRegular){
      callback(i18n('conf.model.cannot.teshuchar','名称不能包含特殊字符'))
    }
    if(!_.isEmpty(nameList) && nameList.includes(value)){
      callback(errMes)
    }
    if (value && rule.max && value.length > rule.max) {
      callback(`${i18n('ticket.forms.beyond' , '不能高于')}${rule.max}${i18n('ticket.forms.character' , '字符')}`)
    } else if (value && rule.min && value.length < rule.min) {
      callback(`${i18n('ticket.forms.below' , '不能低于')}${rule.min}${i18n('ticket.forms.character' , '字符')}`)
    } else {
      callback()
    }
  }

  render () {
    const {formItemLayout, item, getFieldDecorator, defaultValue} = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue,
          rules: [{
            required: item.required === 1,
            min: item.minLength ? item.minLength : null,
            max: item.maxLength && item.maxLength > item.minLength ? item.maxLength : null,
            validator: (rule, value, callback) => { this.handleCheckSingleRowText(item, rule, value, callback) }
          }]
        })(
          <Input
            size='default'
            placeholder={`${i18n('ticket.forms.pinput' , '请输入')}${item.name}`}
          />
        )}
      </FormItem>
    )
  }
}

export default ITSMInput

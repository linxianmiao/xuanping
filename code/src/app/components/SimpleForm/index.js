import React, { Component } from 'react'
import { Form } from '@uyun/components'
import PropTypes from 'prop-types'
import SignleRowText from './SignleRowText'
import MultiRowText from './MultiRowText'

/**
 * 生成一个简单的表单，目前仅有单行文本和多行文本
 *  formItemLayout   默认 1 :3 等分
 *  maxLength   当行文本默认32   ， 多行文本默认50
 *  placeholder  默认： `请输入${item.name}`
 *  validator   仅单行文本有默认值 ，item.code === name : 没有特殊字符， item.code === code : 校验为字母数字下划线
 */
@Form.create()
export default class SimpleForm extends Component {
  static propTypes = {
    formItemLayout: PropTypes.shape({
      labelCol: PropTypes.object.isRequired,
      wrapperCol: PropTypes.object.isRequired
    }),
    list: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      value: PropTypes.string,
      required: PropTypes.boolean,
      disabled: PropTypes.boolean,
      maxLength: PropTypes.number,
      validator: PropTypes.func
    }))
  }

  render() {
    const {
      list = [],
      form,
      formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      }
    } = this.props
    return (
      <Form>
        {
          _.map(list, item => {
            const dilver = {
              item, form, formItemLayout
            }
            switch (item.type) {
              case 'signleRowText':
                return <SignleRowText key={item.code} {...dilver} />
              case 'multiRowText' :
                return <MultiRowText key={item.code} {...dilver} />
            }
          })
        }
      </Form>
    )
  }
}
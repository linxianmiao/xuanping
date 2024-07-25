import React, { Component } from 'react'
import { Form, Radio } from '@uyun/components'
const FormItem = Form.Item
const RadioGroup = Radio.Group

class ItsmRadio extends Component {
  render() {
    const {
      formItemLayout,
      item,
      getFieldDecorator,
      defaultValue,
      type,
      setFieldsValue,
      getFieldValue
    } = this.props
    const { builtin, fieldPrivacy } = this.props.fieldData
    // 由于各种历史原因，隐私字段是由2个字段控制的
    let privacyDefaultVal
    if (defaultValue === true) {
      privacyDefaultVal = 2
    } else if (defaultValue === false) {
      privacyDefaultVal = 0
    } else {
      privacyDefaultVal = item.code === 'privacy' ? fieldPrivacy || 0 : fieldPrivacy
    }
    if (item.code === 'multiple' && getFieldValue('isSingle') !== '0') {
      return null
    }
    return (
      <div>
        {!((builtin === 1 || !window.shared_switch) && item.code === 'isShared') && (
          <FormItem {...formItemLayout} label={item.name}>
            {getFieldDecorator(item.code, {
              initialValue:
                item.code === 'isShared' ||
                item.code === 'isRequired' ||
                item.code === 'isShowColumn'
                  ? defaultValue || 0
                  : item.code === 'privacy'
                  ? privacyDefaultVal
                  : String(defaultValue),
              rules: [
                {
                  required: item.required === 1
                }
              ],
              onChange: (e) => {
                // 当为配置项字段的时候，单选和多选对资源类型的单选和多选关联，每次变动时清空资源类型与属性过滤
                if (type === 'resource') {
                  setFieldsValue({
                    resType: undefined,
                    attributeValues: []
                  })
                  let formType = ''
                  if (item.code === 'formType') {
                    formType = e.target.value
                  } else {
                    formType = getFieldValue('formType')
                  }
                  this.props.store.queryAllResType({ formType })
                  this.props.store.queryCiAttributeColumn({
                    classCodes: getFieldValue('resType')
                      ? _.map(getFieldValue('resType'), (item) => item.key).join()
                      : undefined,
                    formType
                  })
                }
                if (type === 'listSel') {
                  const { fieldData } = this.props.store
                  _.forEach(fieldData.params, (d) => (d.select = 0))
                }
              }
            })(
              <RadioGroup buttonStyle={item.code === 'isShared' ? 'solid' : 'outline'}>
                {_.map(item.options, (item2, i) => {
                  if (item.buttonStyle === false) {
                    return (
                      <Radio value={item2.value} key={i}>
                        {item2.label}
                      </Radio>
                    )
                  }
                  return (
                    <Radio.Button value={item2.value} key={i}>
                      {item2.label}
                    </Radio.Button>
                  )
                })}
              </RadioGroup>
            )}
          </FormItem>
        )}
      </div>
    )
  }
}

export default ItsmRadio

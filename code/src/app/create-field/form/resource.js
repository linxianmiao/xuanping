import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Form, TreeSelect } from '@uyun/components'
import { observer } from 'mobx-react'
import _ from 'lodash'
import './style/resource.less'
const FormItem = Form.Item

const loop = (data) => {
  _.forEach(data, (d) => {
    d.value = d.code
    d.title = d.name
    if (d.dataType === 'layer') {
      d.value = `${d.code}-${d.dataType}`
      d.disabled = true
    }
    if (Array.isArray(d.children) && d.children.length > 0) {
      loop(d.children)
    }
  })
  return data
}

@observer
class Resource extends Component {
  componentDidMount() {
    const { defaultValue } = this.props
    const { formType = 'ALL' } = this.props.store.fieldData
    if (!_.isEmpty(defaultValue)) {
      this.props.store.queryCiAttributeColumn({
        classCodes: _.map(defaultValue, (item) => item.key).join(),
        formType
      })
    }
  }

  render() {
    const { resTypeList } = this.props.store
    const treeData = loop(toJS(resTypeList))
    const { formItemLayout, item, getFieldDecorator, defaultValue, getFieldValue } = this.props
    const formatedDefaultValue = _.map(toJS(defaultValue), (d) => ({
      key: d.key,
      value: d.key,
      label: d.label
    }))
    const show =
      item.type === 'resource' && !getFieldValue('checkEditPermission') && item.code === 'resType'
    return (
      <>
        {show && (
          <FormItem {...formItemLayout} label={item.name}>
            {getFieldDecorator(item.code, {
              initialValue: formatedDefaultValue,
              rules: [
                {
                  required: item.required === 1
                }
              ],
              getValueFromEvent: (value) => {
                let initialValue
                if (Object.prototype.toString.call(value) === '[object Object]') {
                  initialValue = [].concat(value)
                } else {
                  initialValue = value
                }
                if (this.props.type === 'resource') {
                  this.props.setFieldsValue &&
                    this.props.setFieldsValue({
                      attributeValues: []
                    })
                }
                this.timer && clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                  if (!_.isEmpty(initialValue)) {
                    this.props.store.queryCiAttributeColumn({
                      classCodes: _.map(initialValue, (item) => item.value).join() || undefined,
                      formType: getFieldValue('formType')
                    })
                  } else {
                    this.props.store.expandField = []
                  }
                }, 300)
                return initialValue
              }
            })(
              <TreeSelect
                treeData={treeData}
                allowClear
                labelInValue
                showSearch
                multiple={getFieldValue('isSingle') === '1'}
                notFoundContent={i18n('globe.not_find', '无法找到')}
                placeholder={i18n('ticket.create.select', '请选择')}
              />
            )}
          </FormItem>
        )}
      </>
    )
  }
}
export default Resource

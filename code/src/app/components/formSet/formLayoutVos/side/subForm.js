import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Radio, Select } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import CopyInput from '../components/cpoyInput'
import SubFormVariableSelect from '../components/SubFormVariableSelect'

const RadioGroup = Radio.Group
const FormItem = Form.Item
const Option = Select.Option

@inject('formSetGridStore')
@Form.create({
  mapPropsToFields: (props) => {
    const { name, mode, relatedTemplateId, relatedVariable, hidden } = props.sideData || {}
    return {
      name: Form.createFormField({
        value: name
      }),
      mode: Form.createFormField({
        value: mode
      }),
      relatedTemplateId: Form.createFormField({
        value: relatedTemplateId
      }),
      relatedVariable: Form.createFormField({
        value: relatedVariable
      }),
      hidden: Form.createFormField({
        value: Number(hidden)
      })
    }
  },
  onValuesChange: (props, changedValues, allValues) => {
    for (const key in changedValues) {
      if (key === 'hidden') {
        changedValues[key] = Boolean(changedValues[key])
      }
      if (key === 'mode') {
        changedValues[key] === 1
          ? (changedValues.relatedTemplateId = undefined)
          : (changedValues.relatedVariable = undefined)
      }
    }
    props.handleChange(changedValues)
  }
})
@observer
class SubFormSilder extends Component {
  serviceLoad = false

  static contextTypes = {
    modelId: PropTypes.string
  }

  onAutoCompleteFocus = async () => {
    if (this.serviceLoad) return
    await this.props.formSetGridStore.getrelatedService(this.context.modelId)
    this.serviceLoad = true
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { simpleTemplates, subFormVariableList } = this.props.formSetGridStore
    const { id, mode } = this.props.sideData
    return (
      <Form layout="vertical">
        <FormItem label={i18n('ticket.relateTicket.title', '标题')}>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                  'ticket.relateTicket.title',
                  '标题'
                )}`
              }
            ]
          })(
            <Input
              maxLength="32"
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n(
                'ticket.relateTicket.title',
                '标题'
              )}`}
            />
          )}
        </FormItem>

        <FormItem label={i18n('conf.model.field.code', '编码')}>
          <Input
            value={id}
            disabled
            addonAfter={
              <>
                <CopyInput id={id} />
              </>
            }
          />
        </FormItem>

        <FormItem label={i18n('subForm-quote', '子表单引用')}>
          {getFieldDecorator('mode', {
            rules: [{ required: true }]
          })(
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={0}>
                {i18n('addonBefore-subForm', '{name}子表单', { name: i18n('select') })}
              </Radio.Button>
              <Radio.Button value={1}>
                {i18n('conf.model.process.select.param', '选择变量')}
              </Radio.Button>
            </Radio.Group>
          )}
        </FormItem>

        {mode === 0 && (
          <FormItem>
            {getFieldDecorator('relatedTemplateId', {
              rules: [
                {
                  required: mode === 0,
                  message: i18n('addonBefore-subForm', '{name}子表单', {
                    name: i18n('globe.select', '请选择')
                  })
                }
              ]
            })(
              <Select
                allowClear
                showSearch
                placeholder={i18n('addonBefore-subForm', '{name}子表单', {
                  name: i18n('globe.select', '请选择')
                })}
              >
                {_.map(simpleTemplates, (item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}

        {mode === 1 && (
          <FormItem>
            {getFieldDecorator('relatedVariable', {
              rules: [
                {
                  required: mode === 1,
                  message: `${i18n('ticket.forms.pinput', '请输入')}${i18n(
                    'ticket-user-variable',
                    '变量'
                  )}`
                }
              ]
            })(
              <SubFormVariableSelect
                subFormVariableList={subFormVariableList}
                onAutoCompleteFocus={this.onAutoCompleteFocus}
              />
            )}
          </FormItem>
        )}
        <FormItem label={i18n('conf.model.field.tip1', '可见性')}>
          {getFieldDecorator(
            'hidden',
            {}
          )(
            <RadioGroup>
              <Radio.Button value={0}>{i18n('conf.model.field.tip2', '可见')}</Radio.Button>
              <Radio.Button value={1}>{i18n('conf.model.field.tip3', '隐藏')}</Radio.Button>
            </RadioGroup>
          )}
        </FormItem>
      </Form>
    )
  }
}
export default SubFormSilder

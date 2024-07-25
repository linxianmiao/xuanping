import React, { useState } from 'react'
import { Input, InputNumber, Select, Form, Modal } from '@uyun/components'
import TriggerRules from '~/components/triggerRules'

const Option = Select.Option
const FormItem = Form.Item
const formItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } }

export const units = [
  { label: '分', value: 'MINUTES' },
  { label: '时', value: 'HOURS' },
  { label: '天', value: 'DAYS' }
]

const ConditionForm = ({ children, record = {}, modelId, form, onOk, create }) => {
  const { getFieldDecorator, validateFieldsAndScroll, setFieldsValue } = form
  const [open, setOpen] = useState(false)

  const handleOk = () => {
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return false
      }
      onOk(values)
      if (create) {
        setFieldsValue({
          name: '',
          timeDifference: 0,
          condition: undefined
        })
      }
      setOpen(false)
    })
  }

  return (
    <>
      {React.cloneElement(children, { onClick: () => setOpen(true) })}
      <Modal
        title="过滤条件"
        onOk={handleOk}
        visible={open}
        onCancel={() => setOpen(false)}
        size={'large'}
      >
        <Form>
          <FormItem {...formItemLayout} label="条件名称">
            {getFieldDecorator('name', {
              initialValue: record.name,
              rules: [
                {
                  required: true,
                  message: '请输入条件名称'
                }
              ]
            })(<Input placeholder="请输入条件名称" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="处理时长">
            {getFieldDecorator('timeDifference', {
              initialValue: record.timeDifference || 1
            })(<InputNumber min={1} precision={0} />)}
            {getFieldDecorator('timeDifferenceUnit', {
              initialValue: record.timeDifferenceUnit || 'MINUTES'
            })(
              <Select style={{ width: 60, marginLeft: 10 }}>
                {units.map((unit) => (
                  <Option key={unit.value}>{unit.label}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem label="触发条件">
            {getFieldDecorator('condition', {
              initialValue: !_.isEmpty(record.condition)
                ? record.condition
                : {
                  when: 'all',
                  conditionExpressions: [],
                  nestingConditions: []
                }
            })(<TriggerRules addinitLine isRequired modelId={modelId} />)}
          </FormItem>
        </Form>
      </Modal>
    </>
  )
}

const ConditionModal = Form.create()(ConditionForm)

export default ConditionModal

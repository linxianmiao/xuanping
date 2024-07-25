import React, { useEffect, useState } from 'react'
import { Form, Select } from '@uyun/components'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}

const MessageNotify = ({ trigger = {}, setTriggerData, triggerIndex }) => {
  const [messageList, setMessageList] = useState([])

  const getMessageList = async () => {
    const res = await axios.get(API.getTriggerMessageList)
    setMessageList(res)
  }

  useEffect(() => {
    getMessageList()
  }, [])

  const selectMessage = (val) => {
    const value = [
      {
        code: 'communicationType',
        value: val
      }
    ]
    setTriggerData(triggerIndex, 0, value, true)
  }
  const defaultValue = trigger.executeParamPos ? trigger.executeParamPos[0].value : undefined
  return (
    <FormItem {...formItemLayout} label="触发消息">
      <Select
        style={{ width: 300 }}
        placeholder="请选择消息类型"
        onSelect={selectMessage}
        value={defaultValue}
      >
        {_.map(messageList, (d) => (
          <Select.Option key={d.communicationType} value={d.communicationType}>
            {d.communicationTypeShow}
          </Select.Option>
        ))}
      </Select>
    </FormItem>
  )
}

export default MessageNotify

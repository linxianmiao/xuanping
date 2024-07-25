import React, { useState, useEffect } from 'react'
import { Form, Select } from '@uyun/components'
// import ModelTypeLazySelect from '~/components/ModelTypeSelect/LazySelect'

const FormItem = Form.Item
const { Option } = Select

const StageScopeItem = (props) => {
  const [list, setList] = useState([])

  const getListData = async () => {
    const res = await axios.get(API.queryDictionaryType(''))
    setList(res)
  }
  useEffect(() => {
    getListData()
  }, [])
  const { item, getFieldDecorator, formItemLayout, defaultValue } = props
  let formatDefaultValue
  if (defaultValue) {
    formatDefaultValue = {
      label: defaultValue.dictionaryName,
      value: defaultValue.dictionaryCode,
      key: defaultValue.dictionaryCode
    }
  }
  return (
    <FormItem {...formItemLayout} label={item.name}>
      {getFieldDecorator(item.code, {
        initialValue: formatDefaultValue || undefined,
        rules: [
          {
            required: item.required === 1,
            message: `${i18n('ticket.create.select', '请选择')}${item.name}`
          }
        ]
      })(
        <Select labelInValue allowClear>
          {_.map(list, (d) => (
            <Option key={d.code}>{d.name}</Option>
          ))}
        </Select>
      )}
    </FormItem>
  )
}

export default StageScopeItem

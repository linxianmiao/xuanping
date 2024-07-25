import React from 'react'
import { Radio } from '@uyun/components'
import { lowcodeStore } from './LowcodeStore'

export default (props) => {
  const { style = {} } = props
  const { appDataKey } = lowcodeStore
  return (
    <Radio.Group
      style={style}
      value={appDataKey}
      onChange={(e) => lowcodeStore.setProp('appDataKey', e.target.value)}
    >
      <Radio.Button value="form_list">子表单</Radio.Button>
      <Radio.Button value="field_list">字段</Radio.Button>
      <Radio.Button value="dictionary_list">字典</Radio.Button>
    </Radio.Group>
  )
}

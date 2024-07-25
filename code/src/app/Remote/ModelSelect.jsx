import React, { useState, useRef } from 'react'
import { Select } from '@uyun/components'

const { Option } = Select

const ModelSelect = ({
  nodeId,
  value,
  onNodeMiss = () => {}, // 未选租户或者模型
  onChange = () => {}
}) => {
  const [list, setList] = useState([])
  const nodeIdRef = useRef()
  return (
    <Select
      style={{ width: 200 }}
      showSearch
      optionFilterProp="children"
      notFoundContent={i18n('globe.not_find', '无法找到')}
      placeholder="请选择模型"
      labelInValue
      onDropdownVisibleChange={(visible) => {
        if (visible) {
          if (nodeId && nodeId !== nodeIdRef.current) {
            nodeIdRef.current = nodeId
            axios.get(API.queryModelListByNode, { params: { nodeId } }).then(setList)
          } else if (!nodeId) {
            setList([])
            onNodeMiss()
          }
        }
      }}
      value={value}
      allowClear
      onChange={onChange}
    >
      {list.map((item) => (
        <Option key={item.id}>{item.name}</Option>
      ))}
    </Select>
  )
}

export default ModelSelect

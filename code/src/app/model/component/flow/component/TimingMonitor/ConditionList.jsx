/* eslint-disable react/jsx-boolean-value */
import React from 'react'
import { DeleteOutlined, PlusOutlined } from '@uyun/icons'
import { InputNumber, Select, Button } from '@uyun/components'
import ConditionModal, { units } from './ConditionModal'
import styles from './index.module.less'

const ConditionItem = React.memo(({ value, onChange, index, modelId, onDelete }) => {
  const handleChange = (val, type) => {
    onChange({ ...value, [type]: val }, index)
  }

  const handleOk = (val) => {
    onChange(val, index)
  }

  return (
    <div className="p8">
      <ConditionModal modelId={modelId} record={value} onOk={handleOk}>
        <span className={styles.conditionName}>{value.name}</span>
      </ConditionModal>
      <InputNumber
        min={1}
        precision={0}
        size="small"
        value={value.timeDifference || 1}
        onChange={(val) => handleChange(val, 'timeDifference')}
      />
      <Select
        size="small"
        style={{ width: 60, marginLeft: 8 }}
        value={value.timeDifferenceUnit || 'MINUTES'}
        onChange={(val) => handleChange(val, 'timeDifferenceUnit')}
      >
        {units.map((unit) => (
          <Option key={unit.value}>{unit.label}</Option>
        ))}
      </Select>
      <DeleteOutlined className="ml8" onClick={() => onDelete(index)} />
    </div>
  )
})

export default function ConditionList({ value = [], onChange, modelId }) {
  const handleChange = (val, index) => {
    const newValue = [...value]
    newValue.splice(index, 1, val)
    onChange(newValue)
  }

  const handleDelete = (index) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
  }
  const handleOk = (val) => {
    const newValue = [...value]
    newValue.push(val)
    onChange(newValue)
  }
  return (
    <div>
      {value.map((item, index) => (
        <ConditionItem
          modelId={modelId}
          onChange={handleChange}
          onDelete={handleDelete}
          key={index}
          value={item}
          index={index}
        />
      ))}
      <ConditionModal create modelId={modelId} onOk={handleOk}>
        <Button size="small" icon={<PlusOutlined />} type="default">
          添加处理时长以及过滤条件
        </Button>
      </ConditionModal>
    </div>
  )
}

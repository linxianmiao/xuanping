import React from 'react'
import { DeleteOutlined, PlusOutlined } from '@uyun/icons'
import { Input, Button, Row, Col } from '@uyun/components'
import styles from './index.module.less'

const InputGroup = Input.Group

const Headers = ({ value = [], onChange = () => {} }) => {
  const handleAdd = () => {
    const nextValue = [...value]
    nextValue.push({
      paramName: '',
      paramValue: ''
    })
    onChange(nextValue)
  }

  const handleDelete = (index) => {
    const nextValue = [...value]
    nextValue.splice(index, 1)
    onChange(nextValue)
  }

  const handleChange = (val, key, index) => {
    const nextValue = [...value]
    nextValue[index] = {
      ...nextValue[index],
      [key]: val
    }
    onChange(nextValue)
  }

  const renderItem = (item, index) => {
    const { paramName, paramValue } = item
    return (
      <div key={index + ''} className={styles.headersItem}>
        <InputGroup>
          <Row gutter={8}>
            <Col span={8}>
              <Input
                value={paramName}
                onChange={(e) => handleChange(e.target.value, 'paramName', index)}
              />
            </Col>
            <Col span={16}>
              <Input
                value={paramValue}
                onChange={(e) => handleChange(e.target.value, 'paramValue', index)}
              />
            </Col>
          </Row>
        </InputGroup>
        <DeleteOutlined onClick={() => handleDelete(index)} />
      </div>
    )
  }

  return (
    <div>
      {value ? value.map(renderItem) : null}
      <div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加选项
        </Button>
      </div>
    </div>
  )
}

export default Headers

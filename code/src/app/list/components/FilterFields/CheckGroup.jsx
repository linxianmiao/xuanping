import React, { useCallback } from 'react'
import { Checkbox, Row, Col, Tooltip } from '@uyun/components'
import styles from './index.module.less'

export default function CheckGroup(props) {
  const { list, checkedColumnCodes, onChange } = props
  const handleChange = useCallback(
    e => {
      const { checked, value } = e.target
      onChange({ value, checked })
    },
    [onChange]
  )
  return (
    <Row className={styles.checkGroup} gutter={10}>
      {list.map((data, index) => {
        const { code, name, disabled = false } = data
        return (
          <Col key={code} span={12} className={styles.checkboxWrapper}>
            <Tooltip title={`${name} | ${code}`}>
              <Checkbox
                value={code}
                disabled={disabled}
                checked={checkedColumnCodes.includes(code)}
                onChange={handleChange}
              >
                <span className={styles.checkName}>{name}</span>
              </Checkbox>
            </Tooltip>
          </Col>
        )
      })}
    </Row>
  )
}

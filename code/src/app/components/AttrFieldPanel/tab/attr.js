import React from 'react'
import { Row, Col } from '@uyun/components'

import Checkbox from './checkbox'
function Attr(props) {
  const { value, onChange, attrList, lockCondition, forbiddenFields } = props
  return (
    <Row>
      {attrList.map((item) => (
        <Col key={item.code} span={6}>
          <Checkbox
            record={item}
            value={value}
            onChange={onChange}
            disabled={
              lockCondition.includes(item.code) ||
              (Array.isArray(forbiddenFields) ? forbiddenFields.includes(item.code) : false)
            }
          />
        </Col>
      ))}
    </Row>
  )
}

Attr.defaultProps = {
  value: [],
  onChange: () => {},
  attrList: [],
  lockCondition: []
}

export default Attr

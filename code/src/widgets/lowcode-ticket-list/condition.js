import React from 'react'
import { Row, Input, Col } from '@uyun/components'

import styles from './index.module.less'

const LabelValue = ({ label, value }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', marginRight: 15 }}>
      <span style={{ marginRight: 5, flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 'auto' }}>{value}</span>
    </div>
  )
}

function Condition({ query, onChange }) {
  const conditionList = [
    {
      label: '',
      component: (
        <Input.Search
          allowClear
          enterButton
          placeholder={'请输入关键字'}
          onSearch={(value) => onChange({ ...query, wd: value })}
          onClear={() => onChange({ ...query, wd: undefined })}
        />
      )
    }
    // {
    //   label: '',
    //   component: (
    //     <Input.Search
    //       allowClear
    //       placeholder={'请输入流水号'}
    //       onSearch={value => onChange({ ...query, ticketNum: value })}
    //       onClear={() => onChange({ ...query, ticketNum: undefined })}
    //     />
    //   )
    // }
  ]
  return (
    <Row className={styles.conditionList}>
      {conditionList.map((item, i) => {
        return (
          <Col span={6} key={i}>
            <LabelValue label={item.label} value={item.component} />
          </Col>
        )
      })}
    </Row>
  )
}

Condition.defaultProps = {
  query: {},
  onChange: () => {}
}

export default Condition

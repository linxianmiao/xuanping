import React from 'react'
import Group from './Group'

import './index.less'

const Conditions = props => {
  const { fields, data, onChange } = props

  return (
    <div className="trigger-rules-wrap">
      <Group
        level={0}
        data={data}
        fields={fields}
        onChange={onChange}
      />
    </div>
  )
}

Conditions.defaultProps = {
  fields: [], // 可选字段
  data: {},
  onChange: () => {}
}

export default Conditions

import React from 'react'
import { Radio } from '@uyun/components'

import TenantSelect from './TenantSelect'

const RemoteTicketConfig = ({ record, onChange }) => {
  const { remoteNodeMode, remoteNodeInfos } = record
  return (
    <div>
      <div>
        <Radio.Group
          value={remoteNodeMode}
          onChange={e => {
            onChange('remoteNodeMode', e.target.value)
            onChange('remoteNodeInfos', [])
          }}
        >
          <Radio value={0}>固定节点</Radio>
          <Radio value={1}>人工选择</Radio>
        </Radio.Group>
      </div>
      <div>
        <TenantSelect
          multiple={remoteNodeMode === 1}
          value={remoteNodeInfos}
          onChange={value => onChange('remoteNodeInfos', value)}
        />
      </div>
    </div>
  )
}

RemoteTicketConfig.defaultProps = {
  record: {},
  onChange: () => {}
}

export default RemoteTicketConfig

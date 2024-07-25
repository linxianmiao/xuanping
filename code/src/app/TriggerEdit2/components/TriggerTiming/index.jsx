import React from 'react'
import { Radio, InputNumber, Select } from '@uyun/components'
import styles from '../../index.module.less'

const RadioGroup = Radio.Group
const Option = Select.Option

const TriggerTiming = ({
  delay = 0,
  delayTime = 0,
  delayUnit = 'HOURS',
  onChange = () => {}
}) => {
  return (
    <div>
      <RadioGroup value={delay} onChange={e => onChange(e.target.value, 'delay')}>
        <Radio value={0}>立即触发</Radio>
        <Radio value={1}>延时触发</Radio>
      </RadioGroup>
      {
        delay === 1 && (
          <>
            <InputNumber
              style={{ width: 60 }}
              min={0}
              max={9999}
              value={delayTime}
              onChange={value => onChange(value, 'delayTime')}
            />
            <Select
              style={{ width: 80, marginLeft: 10 }}
              value={delayUnit}
              onChange={value => onChange(value, 'delayUnit')}
            >
              <Option value="SECONDS">秒</Option>
              <Option value="MINUTES">分</Option>
              <Option value="HOURS">小时</Option>
              <Option value="DAYS">天</Option>
            </Select>
            <span className={styles.tip}>(点击测试时不会生效)</span>
          </>
        )
      }
    </div>
  )
}

export default TriggerTiming

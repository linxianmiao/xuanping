import React from 'react'
import { Checkbox, Tooltip } from '@uyun/components'
import lodash from 'lodash'

import { pickField } from '../constants'

import styles from '../index.module.less'
function CustomCheckbox({ record, value, disabled, onChange }) {
  const { name, code, modelId } = record
  return (
    <Tooltip title={`${name} | ${code}`}>
      <Checkbox
        disabled={disabled}
        checked={value.some(
          item =>
            (item.modelId && `${item.modelId}_${item.code}` === `${modelId}_${code}`) ||
            (!item.modelId && item.code === code)
        )}
        onChange={e => {
          let newSelected = []
          if (e.target.checked) {
            newSelected = value.concat([lodash.pick(record, pickField)])
          } else {
            newSelected = value.filter(
              item =>
                (item.modelId && `${item.modelId}_${item.code}` !== `${modelId}_${code}`) ||
                item.code !== code
            )
          }
          onChange(newSelected)
        }}
      >
        {<span className={styles.checkLabel}>{name}</span>}
      </Checkbox>
    </Tooltip>
  )
}

CustomCheckbox.defaultProps = {
  value: [],
  onChange: () => {},
  disabled: false,
  record: {}
}

export default CustomCheckbox

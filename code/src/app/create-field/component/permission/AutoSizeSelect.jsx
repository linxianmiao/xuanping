import React, { useState, useEffect } from 'react'
import { Input, Select, Spin } from '@uyun/components'

import styles from './index.module.less'

const globalGroup = {
  appId: '0',
  code: '0000',
  descriptionCn: '全局用户组',
  enName: 'Global'
}

/**
 * 可拖拽高度的多选Select
 */
const AutoSizeSelect = (props, ref) => {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(false)

  const queryApps = async () => {
    setLoading(true)

    const res = (await axios.get(API.listDiffAppGroups)) || []

    res.unshift(globalGroup)

    setApps(res)
    setLoading(false)
  }

  const handleDropdownVisibleChange = (visible) => {
    if (visible && apps.length === 0) {
      queryApps()
    }
  }

  const handleFilterOption = (inputValue, option) => {
    return inputValue && option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
  }

  const handleChange = (selected) => {
    const nextValue = []

    selected.forEach((item) => {
      const app = item.key === '0' ? globalGroup : apps.find((a) => a.appId === item.key)

      if (app) {
        nextValue.push({
          appId: app.appId,
          appCode: app.code,
          appName: app.descriptionCn,
          enName: app.enName
        })
      }
    })

    props.onChange(nextValue)
  }

  const value =
    props.value &&
    props.value.map((item) => ({ key: item.appId, label: `${item.enName} - ${item.appName}` }))

  return (
    <div ref={ref} className={styles.autoSizeSelect}>
      <Input.TextArea rows={2} />
      <Select
        mode="multiple"
        labelInValue
        loading={loading}
        value={value}
        filterOption={handleFilterOption}
        notFoundContent={loading ? <Spin size="small" /> : null}
        onDropdownVisibleChange={handleDropdownVisibleChange}
        onChange={handleChange}
        getPopupContainer={() => document.getElementById('create-file-field')}
      >
        {apps.map((item) => (
          <Select.Option key={item.appId}>{`${item.enName} - ${item.descriptionCn}`}</Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default React.forwardRef(AutoSizeSelect)

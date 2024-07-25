import React, { useState } from 'react'
import { Checkbox, Input, Tooltip, Button } from '@uyun/components'

import { changRecordInfoField, getUuid } from './logic'
import styles from './index.module.less'

// 配置基本信息（启用，名称）
const ConfigBaseInfo = ({ record, buttonList, onChange, coOperation }) => {
  const { label, isUseable, disabled, buttonName, type, activityFlowId, isEditName } = record
  const [editingType, setEditingType] = useState('')
  const [name, setName] = useState(buttonName)

  return (
    <>
      <Checkbox
        checked={type === 'CoOrganizer' ? coOperation.createCoOrganizer : Boolean(isUseable)}
        onChange={(e) => {
          const checkedValue = e.target.checked ? 1 : 0
          const value = changRecordInfoField(
            buttonList,
            'isUseable',
            getUuid(activityFlowId, type),
            checkedValue
          )
          onChange(value)
          type === 'CoOrganizer' && coOperation.onChange(checkedValue)
        }}
        disabled={disabled}
      >
        {label}
      </Checkbox>
      {/* 判断是否是编辑态 */}
      {editingType === getUuid(activityFlowId, type) ? (
        <>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            style={{ width: 180, top: -2 }}
            maxLength={10}
          />
          <Button
            size="small"
            type="success"
            ghost
            style={{ marginRight: 5 }}
            onClick={() => {
              const value = changRecordInfoField(buttonList, 'buttonName', editingType, name)
              onChange(value, activityFlowId)
              setEditingType('')
            }}
          >
            <i className="iconfont icon-dui" />
          </Button>
          <Button
            size="small"
            type="danger"
            ghost
            onClick={() => {
              setEditingType('')
              setName(buttonName)
            }}
          >
            <i className="iconfont icon-cha" />
          </Button>
        </>
      ) : (
        <>
          {buttonName ? <span className={styles.aliasName}>{`[${buttonName}]`}</span> : null}
          {isEditName ? (
            <Tooltip title="功能重命名">
              <i
                className="iconfont icon-zhongmingming"
                onClick={() => setEditingType(getUuid(activityFlowId, type))}
              />
            </Tooltip>
          ) : null}
        </>
      )}
    </>
  )
}

ConfigBaseInfo.defaultProps = {
  record: {},
  buttonList: [],
  onChange: () => {}
}

export default ConfigBaseInfo

import React, { useEffect } from 'react'
import { Checkbox, Form } from '@uyun/components'
import UserPicker from '~/components/userPicker'
import styles from './index.module.less'

const FormItem = Form.Item

const validator = (value) => {
  const { isAssignUsers, assignUsers } = value

  if (isAssignUsers === 1 && _.isEmpty(assignUsers)) {
    return true
  }
  return false
}

const ExceptionStrategy = ({ isSubmit = false, value = {}, onChange = () => {} }) => {
  const { isAssignUsers, assignAdmin, assignCreator, assignUsers = [] } = value

  const handleChecked = (checked, key) => {
    const nextValue = { ...value }

    // 这里是单选，先取消所有选项
    if (checked) {
      nextValue.isAssignUsers = 0
      nextValue.assignAdmin = 0
      nextValue.assignCreator = 0
    }

    nextValue[key] = checked ? 1 : 0
    onChange(nextValue)
  }

  const handleUserPick = (users) => {
    const nextValue = { ...value }
    nextValue.assignUsers = [...users]
    onChange(nextValue)
  }

  const isError = isSubmit && validator(value)

  return (
    <div className={styles.wrap}>
      <Checkbox
        checked={!!isAssignUsers}
        onChange={(e) => handleChecked(e.target.checked, 'isAssignUsers')}
      >
        指定固定用户处理
      </Checkbox>
      <FormItem validateStatus={isError ? 'error' : 'success'} help={isError ? '请选择人员' : ''}>
        <UserPicker
          value={assignUsers}
          tabs={[1]}
          showTypes={['users']}
          onChange={handleUserPick}
        />
      </FormItem>
      <Checkbox
        checked={!!assignAdmin}
        onChange={(e) => handleChecked(e.target.checked, 'assignAdmin')}
      >
        指派给应用管理员处理
      </Checkbox>
      <br />
      <Checkbox
        checked={!!assignCreator}
        onChange={(e) => handleChecked(e.target.checked, 'assignCreator')}
      >
        指派给工单创建人处理
      </Checkbox>
    </div>
  )
}

export default ExceptionStrategy

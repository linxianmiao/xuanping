import React, { Fragment } from 'react'
import { Input, Button } from '@uyun/components'

const DataSource = props => {
  const { value, onChange, onAjax } = props

  return (
    <Fragment>
      <Input
        style={{ width: 500, marginRight: 10 }}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <Button type="primary" onClick={onAjax}>
        {i18n('click_get', '点击获取')}
      </Button>
    </Fragment>
  )
}

export default DataSource

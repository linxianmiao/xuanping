import React, { useState } from 'react'
import { CheckOutlined, CloseOutlined } from '@uyun/icons'
import { Input, Button, message } from '@uyun/components'

const Edit = (props) => {
  const { value, loading, onOk, onCancel } = props
  const [text, setText] = useState(value)

  const handleOk = () => {
    if (!text) {
      message.error('name.empty.error')
      return
    }
    onOk(text)
  }

  return (
    <div className="cs-option-edit" onClick={(e) => e.stopPropagation()}>
      <div className="cs-option-edit-input-wrap">
        <Input
          size="small"
          maxLength={32}
          placeholder={i18n('ticket.forms.pinputName')}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <Button size="small" loading={loading} onClick={handleOk}>
        <CheckOutlined />
      </Button>
      <Button size="small" loading={loading} onClick={() => onCancel()}>
        <CloseOutlined />
      </Button>
    </div>
  )
}

export default Edit

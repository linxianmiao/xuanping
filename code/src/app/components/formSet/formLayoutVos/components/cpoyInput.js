import React, { useEffect } from 'react'
import { Input, message, Tooltip } from '@uyun/components'
import ClipboardJS from 'clipboard'

export default function CopyInput(props) {
  const { id } = props
  useEffect(() => {
    let clipboard = new ClipboardJS(`.copy${props.id}.iconfont`)
    clipboard.on('success', () => {
      message.success(i18n('copied', '已复制到剪贴板'))
    })
    return () => {
      clipboard.destroy()
      clipboard = null
    }
  }, [id])
  return (
    <Tooltip title={<p>code: {id}</p>} placement="topRight">
      <i
        data-clipboard-text={id}
        style={{ cursor: 'pointer' }}
        className={`copy${id} iconfont icon-fuzhi icon-fontSize`}
      />
    </Tooltip>
  )
}

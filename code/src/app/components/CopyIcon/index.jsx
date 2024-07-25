import React, { useEffect } from 'react'
import { CopyFilled } from '@uyun/icons'
import { message, Tooltip } from '@uyun/components'
import ClipboardJS from 'clipboard'

const CopyIcon = ({ value, style = {}, className = '' }) => {
  useEffect(() => {
    let clipboard = new ClipboardJS(`.copy${value}.iconfont`)
    clipboard.on('success', () => {
      message.success(i18n('copied', '已复制到剪贴板'))
    })
    return () => {
      clipboard.destroy()
      clipboard = null
    }
  }, [value])

  return (
    <Tooltip title={i18n('copy', '复制')}>
      <CopyFilled
        data-clipboard-text={value}
        style={{ cursor: 'pointer', marginLeft: 4, ...style }}
        className={`copy${value} iconfont icon-fuzhi ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
    </Tooltip>
  )
}

export default CopyIcon

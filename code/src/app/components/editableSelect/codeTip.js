import React, { useEffect } from 'react'
import { CopyFilled } from '@uyun/icons';
import { message, Icon } from '@uyun/components'
import ClipboardJS from 'clipboard'

const CodeTip = props => {
  const { value } = props

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
    <span>
      {value}
      <CopyFilled
        data-clipboard-text={value}
        style={{ cursor: 'pointer', marginLeft: 4 }}
        className={`copy${value} iconfont icon-fuzhi`}
        onClick={e => e.stopPropagation()} />
    </span>
  );
}

export default CodeTip

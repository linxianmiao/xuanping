import React, { useState, Children, useRef, cloneElement, useEffect } from 'react'
import { Popover } from '@uyun/components'
function Desc(props) {
  const { children } = props
  const ref = useRef()
  const [text, setText] = useState(undefined)
  if (!Children.only(children)) {
    return null
  }
  useEffect(() => {
    const { offsetHeight, innerText } = ref.current
    if (offsetHeight > 18) {
      setText(innerText)
    }
  }, [])

  return (
    text
      ? <Popover
        trigger="hover"
        placement="bottom"
        overlayStyle={{ width: 300 }}
        content={text}>
        {cloneElement(children, { ref, className: children.props.className + ' shenglue' })}
      </Popover>
      : cloneElement(children, { ref })
  )
}

export default Desc
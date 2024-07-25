import React, { forwardRef } from 'react'

/**
 * 字段开启"仅经办人可见"，且当前用户非经办人时，显示星号
 */
const Secrecy = forwardRef((props, ref) => {
  return (
    <div ref={ref} {...props} className="secrecy-div">
      <span>*********</span>
    </div>
  )
})

export default Secrecy

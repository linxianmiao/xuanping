import React, { useState, useEffect } from 'react'

const initMaxRowHeight = 5000
// 定义每行的高度为18px
const getMaxRowHeigth = (max) => max * 18

function TextPreview(props) {
  const { children, field, className, uuId } = props
  const [showMore, setShowMore] = useState(false)
  const [visible, setVisible] = useState(false)
  const [maxRowHeight, setMaxRowHeight] = useState(initMaxRowHeight)

  useEffect(() => {
    const getTextHeigth = () => {
      const textPreId = document.getElementById(`textPre${uuId}`)
      const height = textPreId ? textPreId.offsetHeight : 0
      const maxHeigth = getMaxRowHeigth(field.maxRowHeight || 0)
      if (height > maxHeigth && maxHeigth !== 0) {
        setShowMore(true)
        setVisible(true)
        setMaxRowHeight(maxHeigth)
      }
    }
    getTextHeigth()
  }, [field])

  return (
    <>
      <div
        id={`textPre${uuId}`}
        style={{ maxHeight: `${maxRowHeight}px`, overflow: 'hidden' }}
        className={className}
      >
        {children}
      </div>
      {showMore ? (
        <div>
          <a
            onClick={() => {
              setVisible(!visible)
              setMaxRowHeight(!visible ? getMaxRowHeigth(field.maxRowHeight) : initMaxRowHeight)
            }}
          >
            {!visible ? '收起' : '展开'}
          </a>
        </div>
      ) : null}
    </>
  )
}

TextPreview.defaultProps = {
  children: '',
  field: {},
  className: '',
  uuId: ''
}

export default TextPreview

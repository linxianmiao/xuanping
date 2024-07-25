import React, { Children, cloneElement, useEffect, useState, Fragment } from 'react'
import { Popover } from '@uyun/components'
function TagList (props) {
  const { children } = props
  const ids = []
  const [tagTop, setTagTop] = useState([])

  useEffect(() => {
    const tops = _.isEmpty(ids) ? [] : ids.map(id => document.getElementById(id).offsetTop)
    setTagTop(tops)
  }, [])

  return (
    <div className="field-card-section-tag">
      {Children.map(children, (child, index) => {
        ids.push(child.props.id)
        if (tagTop[index] < 54 && tagTop[index + 1] > 54) {
          return (
            <Fragment>
              {cloneElement(child)}
              <Popover
                placement="bottomRight"
                content={
                  <div style={{ width: 300 }}>
                    {
                      Children.map(children, (child, index) => {
                        if (tagTop[index] > 54) {
                          return cloneElement(child)
                        } else {
                          return <span />
                        }
                      })
                    }
                  </div>
                }>
                <span>...</span>
              </Popover>
            </Fragment>
          )
        } else {
          return cloneElement(child)
        }
      })}
    </div>
  )
}

export default TagList
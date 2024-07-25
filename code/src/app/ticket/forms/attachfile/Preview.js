import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { CloseCircleOutlined } from '@uyun/icons';
import { Icon } from '@uyun/components'
import styles from './index.module.less'
export default function Preview(props) {
  const ref = useRef()

  useEffect(() => {
    if (props.visible) {
      if (!ref.current) {
        ref.current = document.createElement('div')
      }
      document.body.appendChild(ref.current)
      _render()
    } else {
      ref.current && document.body.removeChild(ref.current)
    }
  }, [props.visible])

  function _render() {
    const DOM = (
      <div className={styles.reactRancyBox}>
        <div className="img-wrap">
          <CloseCircleOutlined onClick={e => { e.stopPropagation(); props.handlePreview() }} />
          <div className="img-inner" onClick={e => { e.stopPropagation() }}>
            <img src={props.url} />
          </div>
        </div>
      </div>
    )
    ReactDOM.render(DOM, ref.current)
  }

  return null
}
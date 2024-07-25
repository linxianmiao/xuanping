/**
 * 组件被用于低代码时，链接跳转不走路由
 */
import React from 'react'
import { Link } from 'react-router-dom'
import { lowcodeStore } from './LowcodeStore'
import { qs } from '@uyun/utils'

const LowcodeLink = (props) => {
  const { children, className, style, url, onClick, ...rest } = props

  if (window.LOWCODE_APP_KEY) {
    return (
      <a
        className={className}
        style={style}
        onClick={() => {
          onClick && onClick()
          if (lowcodeStore) {
            lowcodeStore.setProps({ ...rest })
          }
        }}
      >
        {props.children}
      </a>
    )
  }

  return (
    <Link className={className} style={style} to={url}>
      {children}
    </Link>
  )
}

LowcodeLink.defaultProps = {
  style: {},
  className: '',
  url: '',
  pageKey: '',
  homeKey: '',
  appDataKey: '',
  onClick: () => {}
}

export default LowcodeLink

export const linkTo = ({ url = '', history, ...rest }) => {
  if (window.LOWCODE_APP_KEY && lowcodeStore) {
    lowcodeStore.setProps({ ...rest })
  } else {
    let query = {}
    query.appkey = window.LOWCODE_APP_KEY
    if (window.location.href.includes('hideHeader')) {
      query.hideHeader = 1
    }
    if (rest.source === 'field' && rest.pageKey === 'model_edit') {
      query.source = 'field'
    }

    const queryString = qs.stringify(query)
    history && history.push(url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`)
  }
}

export const linkToData = ({ url = '', history, ...rest }) => {
  history && history.push(url)
}

import React, { forwardRef, Children, cloneElement } from 'react'
import ReactLazyLoad from 'react-lazyload'

const LazyLoad = forwardRef((props, ref) => {
  const { type = 'detail', children, ...restProps } = props
  const containerId = type === 'detail' ? 'itsm-wrap' : 'ticket-forms-wrap'
  // 除了工单新建、详情页，其他的比如创建子流程侧滑、新建关联等场景，获取不到滚动元素
  const isValidContainer = !!document.getElementById(containerId)

  const ChildrenMap = Children.map(children, child => {
    if (React.isValidElement(child)) {
      return cloneElement(child, { ...restProps, ref })
    }
  })

  if (isValidContainer && !window.LOWCODE_APP_KEY) {
    return (
      <ReactLazyLoad once scrollContainer={'#' + containerId}>
        {ChildrenMap}
      </ReactLazyLoad>
    )
  }

  return <div>{ChildrenMap}</div>
})

export default LazyLoad

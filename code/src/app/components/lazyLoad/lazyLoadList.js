import React, { Children, cloneElement, useRef, useEffect, useCallback, useMemo } from 'react'
import { findDOMNode } from 'react-dom'
import './index.less'

function LazyLoadList(props) {
  const ref = useRef()
  const queryRef = useRef()
  const { children, className, query, onChange, loading } = props
  const queryMemo = useMemo(() => query || {}, [query])
  const count = Children.count(children)
  const { pageNo } = queryMemo
  useEffect(() => {
    if (pageNo === 1) {
      const id = findDOMNode(ref.current)
      id.scrollTop = 0
    }
  }, [pageNo])

  useEffect(() => {
    queryRef.current = { queryMemo, count, loading }
  }, [queryMemo, count, loading])

  const throttleScrollFn = useCallback(_.throttle((e) => {
    const { queryMemo, count, loading } = queryRef.current
    const { pageNo, pageSize } = queryMemo
    const { scrollTop, scrollHeight, offsetHeight } = e.srcElement || {}
    if (offsetHeight + scrollTop >= scrollHeight && pageNo * pageSize <= count && !loading) {
      onChange(_.assign({}, queryMemo, { pageNo: pageNo + 1 }))
    }
  }, 300), [])

  useEffect(() => {
    const id = findDOMNode(ref.current)
    id.addEventListener('scroll', throttleScrollFn)
    return () => {
      id.removeEventListener('scroll', throttleScrollFn)
    }
  }, [])
  return (
    <div ref={ref} className={`lazy-load-list ${className}`}>
      {Children.map(children, child => cloneElement(child))}
    </div>
  )
}

export default LazyLoadList
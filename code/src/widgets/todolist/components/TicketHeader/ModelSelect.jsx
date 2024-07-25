import React, { useState, useEffect, useCallback } from 'react'
import { useInject } from '@uyun/core'
import { Select } from '@uyun/components'
const Option = Select.Option

function LazyLoadSelect(props) {
  const {
    value,
    onChange
  } = props

  const listStore = useInject('listStore')
  const i18n = useInject('i18n')

  const [list, setList] = useState([])
  const [visible, setVisible] = useState()
  const [canLoad, setCnLoad] = useState(true) // 是否可以继续滚动加载
  const [query, setQuery] = useState({ pageNum: 1, pageSize: 15, wd: '' }) // 下拉列表的筛选条件

  const debounceOnSerach = useCallback(_.debounce(onSearch, 300), []) // 搜索函数

  useEffect(() => {
    if (visible) {
      listStore.getModelList(query).then(res => {
        if (res.length < query.pageSize) {
          setCnLoad(false)
        }
        if (query.pageNum === 1) {
          setList(res)
        } else {
          setList([...list, ...res])
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // 初始化，点击下拉框展开的时候加载15条数据
  function onDropdownVisibleChange(visible) {
    setVisible(visible)
    if (visible) {
      setQuery({ pageNum: 1, pageSize: 15, wd: '' })
      setCnLoad(true)
    }
  }
  // 滚动加载
  function onPopupScroll(e) {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    if (offsetHeight + scrollTop >= scrollHeight && canLoad) {
      setQuery(_.assign({}, query, { pageNum: query.pageNum + 1 }))
    }
  }

  // 通过关键字查找
  function onSearch(wd) {
    setQuery(_.assign({}, query, { pageNum: 1, wd }))
  }

  return (
    <Select
      showSearch
      labelInValue
      allowClear
      value={value}
      open={visible}
      onChange={onChange}
      filterOption={false}
      style={{ width: 256, marginRight: 15 }}
      onPopupScroll={onPopupScroll}
      onSearch={debounceOnSerach}
      onDropdownVisibleChange={onDropdownVisibleChange}
      notFoundContent={i18n('globe.notFound', '无法找到')}
      placeholder={i18n('tip1', '请选择工单模型')}
    >
      {_.map(list, item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
    </Select>
  )
}
export default LazyLoadSelect

import React, { useState, useEffect, useCallback } from 'react'
import { Select } from '@uyun/components'
const Option = Select.Option

function LazyLoadSelect(props) {
  const { value, onChange, placeholder, style = {}, size = 'default', mode, labelInValue = true, lazy = true, getPopupContainer, allowClear = true, disabled, className } = props
  const [list, setList] = useState([])
  const [visible, setVisible] = useState()
  const [canLoad, setCnLoad] = useState(true) // 是否可以继续滚动加载
  const [query, setQuery] = useState({ pageNo: 1, pageSize: 15, kw: '' }) // 下拉列表的筛选条件

  const debounceOnSerach = useCallback(_.debounce(onSearch, 300), []) // 搜索函数

  // 增加一个lazy属性，为false时，会在组件加载时请求数据
  // 用于预设值的场景，防止匹配不了选项
  useEffect(() => {
    if (!lazy) {
      getFilterList()
    }
  }, [])

  // 筛选条件改变的时候触发加载事件
  useEffect(() => {
    if (visible) {
      getFilterList()
    }
  }, [query])

  // 初始化，点击下拉框展开的时候加载15条数据
  function onDropdownVisibleChange(visible) {
    setVisible(visible)
    if (visible) {
      setQuery({ pageNo: 1, pageSize: 15, kw: '' })
      setCnLoad(true)
    }
  }
  // 滚动加载
  function onPopupScroll(e) {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    if (offsetHeight + scrollTop >= scrollHeight && canLoad) {
      setQuery(_.assign({}, query, { pageNo: query.pageNo + 1 }))
    }
  }
  // 下拉列表数据的获取
  function getFilterList() {
    props.getList(query, res => {
      setCnLoad(res.length >= query.pageSize)
      if (query.pageNo === 1) {
        setList(res)
      } else {
        setList([...list, ...res])
      }
    })
  }
  // 通过关键字查找
  function onSearch(kw) {
    setQuery(_.assign({}, query, { pageNo: 1, kw }))
  }
  function handleChange(value) {
    const ids = _.map(value, item => item.key)
    const fullValue = _.filter(list, item => _.includes(ids, item.id))
    onChange(value, fullValue)
  }

  return (
    <Select
      className={className}
      disabled={disabled}
      allowClear={allowClear}
      showSearch
      labelInValue={labelInValue}
      size={size}
      mode={mode}
      style={style}
      value={value}
      open={visible}
      filterOption={false}
      onChange={handleChange}
      placeholder={placeholder}
      notFoundContent={i18n('globe.notFound', '无法找到')}
      onPopupScroll={onPopupScroll}
      onSearch={debounceOnSerach}
      onDropdownVisibleChange={onDropdownVisibleChange}
      getPopupContainer={getPopupContainer || (() => document.body)}
    >
      {_.map(list, item => <Option key={item.id} value={item.id}>{item.name}</Option>)}
    </Select>
  )
}
export default LazyLoadSelect

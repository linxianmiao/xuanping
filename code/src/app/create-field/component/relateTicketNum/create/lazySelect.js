import React, { useState, useEffect, useCallback } from 'react'
import { Select, Tooltip } from '@uyun/components'
import _ from 'lodash'
import { i18n } from '../utils'
const Option = Select.Option

function LazyLoadSelect (props) {
  const {
    value,
    onChange,
    placeholder,
    style = {},
    size = 'default',
    mode,
    labelInValue = true,
    lazy = true,
    getPopupContainer,
    allowClear = true,
    disabled,
    className,
    showTip,
    filterWithoutQuery, // 为true 表示前端做筛选
    ...restProps
  } = props

  const [list, setList] = useState([])
  const [visible, setVisible] = useState()
  const [canLoad, setCnLoad] = useState(true) // 是否可以继续滚动加载
  const [query, setQuery] = useState({ pageNo: 1, pageSize: 15, kw: '' }) // 下拉列表的筛选条件

  // 为了支持前端筛选，将关键字保存在状态
  const [kw, setKw] = useState(undefined)

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
  function onDropdownVisibleChange (visible) {
    setVisible(visible)
    if (visible) {
      setQuery({ pageNo: 1, pageSize: 15, kw: '' })
      setCnLoad(true)
    }
  }
  // 滚动加载
  function onPopupScroll (e) {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    if (offsetHeight + scrollTop >= scrollHeight && canLoad) {
      setQuery(_.assign({}, query, { pageNo: query.pageNo + 1 }))
    }
  }
  // 下拉列表数据的获取
  function getFilterList () {
    props.getList(query, (res) => {
      setCnLoad(res.length >= query.pageSize)
      if (query.pageNo === 1) {
        setList(res)
      } else {
        setList([...list, ...res])
      }
    })
  }
  // 通过关键字查找
  function onSearch (kw) {
    setQuery(_.assign({}, query, { pageNo: 1, kw }))
  }
  function handleChange (value, option) {
    let ids = []

    if (Array.isArray(value)) {
      ids = _.map(value, item => item.key)
    } else if (typeof value === 'string') {
      ids = [value]
    } else {
      ids = value ? [value.key] : []
    }

    const fullValue = _.filter(list, item => _.includes(ids, item.id))
    onChange(value, fullValue)
    setKw(undefined)
  }
  const popupContainer = document.getElementById('itsm-wrap') || document.body

  const finalList = filterWithoutQuery && kw
    ? list.filter(item => item.name.toLowerCase().indexOf(kw.toLowerCase()) !== -1)
    : list
  return (
    <Select
      {...restProps}
      showSearch
      className={className}
      disabled={disabled}
      allowClear={allowClear}
      labelInValue={labelInValue}
      size={size}
      mode={mode}
      style={style}
      value={value}
      open={visible}
      filterOption={false}
      onChange={handleChange}
      placeholder={placeholder}
      optionLabelProp="name"
      notFoundContent={i18n('can.not.found')}
      onPopupScroll={onPopupScroll}
      onSearch={value => {
        setKw(value)
        if (!filterWithoutQuery) {
          debounceOnSerach(value)
        }
      }}
      dropdownStyle={{ minWidth: 240 }}
      onDropdownVisibleChange={onDropdownVisibleChange}
      getPopupContainer={getPopupContainer || (() => popupContainer)}
    >
      {_.map(finalList, item => (
        <Option name={item.name} key={item.id} value={item.id}>
          {
            showTip
              ? <Tooltip mouseEnterDelay={0.5} mouseLeaveDelay={0} placement="right" title={`${item.name} | ${item.id}`} >
                <div className="trigger-condition-item-content-select-option-div">
                  <span className="shenglue">{item.name}</span>
                  <span className="shenglue">{item.id}</span>
                </div>
              </Tooltip>
              : item.name
          }
        </Option>
      ))}
    </Select>
  )
}
export default LazyLoadSelect

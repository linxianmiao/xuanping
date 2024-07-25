import { useState, useEffect, useCallback } from 'react'

const defaultOptions = {
  dataKey: 'data', // 返回值中的数据字段
  totalKey: 'total', // 返回值中的总数字段
  currentKey: 'current', // 返回值中的页码字段
  pageSizeKey: 'pageSize', // 返回值中的页大小字段

  table: {}, // table的属性，会被添加到tableProps返回

  pagination: {}, // 分页的属性，会被添加到paginationProps返回

  filters: {}, // 自定义的筛选条件

  needFiltersCache: false, // 是否需要缓存筛选数据，缓存到window对象
  filterCacheName: 'FILTERS' // 缓存到window对象下的键名
}

export default function useTable(service, options = defaultOptions) {
  const {
    dataKey = 'data',
    totalKey = 'total',
    currentKey = 'current',
    pageSizeKey = 'pageSize',
    table = {},
    pagination = {},
    filters: customFilters = {},

    needFiltersCache = false,
    filterCacheName = 'FILTERS'
  } = options

  // 结合window对象中缓存的数据
  const windowFilters = {}
  let windowCurrent = 1
  let windowPageSize = 20

  Object.keys(window[filterCacheName] || {}).forEach((key) => {
    if (key === currentKey) {
      windowCurrent = window[filterCacheName][currentKey]
    } else if (key === pageSizeKey) {
      windowPageSize = window[filterCacheName][pageSizeKey]
    } else {
      windowFilters[key] = window[filterCacheName][key]
    }
  })

  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(needFiltersCache ? windowCurrent : pagination.current || 1)
  const [pageSize, setPageSize] = useState(
    needFiltersCache ? windowPageSize : pagination.pageSize || 10
  )
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState(needFiltersCache ? windowFilters : customFilters)

  const query = useCallback(
    (changedParams = {}) => {
      const nextParams = {
        [currentKey]: current,
        [pageSizeKey]: pageSize,
        ...filters,
        ...changedParams
      }

      setLoading(true)

      service(nextParams).then((res) => {
        setData(res[dataKey] || [])
        setTotal(res[totalKey] || 0)
        setCurrent(res[currentKey] || current)
        setPageSize(res[pageSizeKey] || pageSize)
        setLoading(false)

        // 将筛选条件保存到window对象中
        if (needFiltersCache) {
          window[filterCacheName] = nextParams
        }
      })
    },
    [total, current, pageSize, filters]
  )

  // 页大小改变
  const onShowSizeChange = useCallback(
    (current, size) => {
      setCurrent(1)
      setPageSize(size)
      query({ [pageSizeKey]: size, [currentKey]: 1 })
    },
    [filters]
  )

  // 页码改变
  const onPageChange = useCallback(
    (page, pageSize) => {
      setCurrent(page)
      query({ [currentKey]: page })
    },
    [filters]
  )

  // 自定义筛选单个条件改变
  const onFieldChange = useCallback(
    (value, key, needQuery) => {
      const nextFilters = { ...filters, [key]: value }
      setFilters(nextFilters)

      if (needQuery) {
        setCurrent(1)
        query({ ...nextFilters, [currentKey]: 1 })
      }
    },
    [filters, pageSize]
  )

  // 自定义筛选多个条件改变
  const onFieldsChange = useCallback(
    (obj, needQuery) => {
      const nextFilters = { ...filters, ...obj }
      setFilters(nextFilters)

      if (needQuery) {
        setCurrent(1)
        query({ ...nextFilters, [currentKey]: 1 })
      }
    },
    [filters, pageSize]
  )

  // 自定义筛选提交，请求列表数据
  const onFilterSubmit = useCallback(() => {
    const nextCurrent = 1
    setCurrent(nextCurrent)
    query({ [currentKey]: nextCurrent })
  }, [filters, pageSize])

  useEffect(() => {
    query()
  }, [])

  return {
    tableProps: {
      ...table,
      loading,
      dataSource: data
    },
    paginationProps: {
      ...pagination,
      current,
      pageSize,
      total,
      onShowSizeChange,
      onChange: onPageChange
    },
    filterProps: {
      values: filters,
      onFieldChange,
      onFieldsChange,
      onSubmit: onFilterSubmit
    },

    setData
  }
}

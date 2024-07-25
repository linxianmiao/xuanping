/**
 * 配合@uyun/components/Table使用最佳
 * 功能点:
 * 1.维护table数据
 * 2.维护分页数据
 * 3.维护筛选条件
 * 4.发送接口请求
 */
import { useState, useEffect } from 'react'

type Obj = Record<string, any>

type Table = {
  dataSource: unknown[]
  loading: boolean
}

type Pagination = {
  current: number
  pageSize: number
  total: number
  onChange: (page: number) => void
  onShowSizeChange: (size: number) => void
}

export interface Filter {
  items: Obj
  onItemChange: (key: string, value: any, needQuery?: boolean) => void
  onItemsChange: (items: Obj, needQuery?: boolean) => void
}

type Return = [Table, Pagination, Filter]

type Options = {
  dataKey?: string
  totalKey?: string
  currentKey?: string
  pageSizeKey?: string
  defaultFilters?: Obj
  firstQuery?: boolean
}

type Props = {
  source: (params: any) => Promise<any>
  options?: Options
}

const useTable = (props: Props): Return => {
  const { source, options = {} } = props
  const {
    dataKey = 'data',
    totalKey = 'total',
    currentKey = 'current',
    pageSizeKey = 'pageSize',
    defaultFilters = {},
    firstQuery = true
  } = options

  /**
   * 状态
   */
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(false)

  /**
   * 动作
   */
  const query = (params: Obj = {}): void => {
    const finalParams = {
      [currentKey]: current,
      [pageSizeKey]: pageSize,
      ...filters,
      ...params
    }

    setLoading(true)
    source(finalParams).then(res => {
      setData(res[dataKey])
      // 后端请求和响应中的页码字段名称不统一
      // setCurrent(res[currentKey] || current)
      setPageSize(res[pageSizeKey] || pageSize)
      setTotal(res[totalKey] || 0)
      setLoading(false)
    })
  }
  // 页码改变
  const handlePageChange: Pagination['onChange'] = page => {
    setCurrent(page)
    query({ [currentKey]: page })
  }
  // 页大小改变
  const handlePageSizeChange: Pagination['onShowSizeChange'] = size => {
    setPageSize(size)
    query({ [pageSize]: size, [currentKey]: 1 })
  }
  // 单个筛选条件改变
  const handleFilterItemChange: Filter['onItemChange'] = (key, value, needQuery = true) => {
    setFilters({ ...filters, [key]: value })
    if (needQuery) {
      query({ [key]: value, [currentKey]: 1 })
    }
  }
  // 多个筛选条件改变
  const handleFilterItemsChange: Filter['onItemsChange'] = (items = {}, needQuery = true) => {
    setFilters({ ...filters, ...items })
    if (needQuery) {
      query({ ...items, [currentKey]: 1 })
    }
  }

  const table: Table = {
    dataSource: data,
    loading
  }

  const pagination: Pagination = {
    total,
    current,
    pageSize,
    onChange: handlePageChange,
    onShowSizeChange: handlePageSizeChange
  }

  const filter: Filter = {
    items: filters,
    onItemChange: handleFilterItemChange,
    onItemsChange: handleFilterItemsChange
  }

  useEffect(() => {
    if (firstQuery) {
      query()
    }
  }, [])

  return [table, pagination, filter]
}

export default useTable

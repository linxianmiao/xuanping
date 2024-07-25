import React, { useState, useCallback, UIEvent } from 'react'
import { Select } from '@uyun/components'
import { debounce } from 'lodash'

interface Item {
  label: string
  value: string
  [key: string]: any
}

export type Value = Item | Item[] | undefined

interface SelectValueItem {
  key: string
  label: string
}

type SelectValue = SelectValueItem | SelectValueItem[] | undefined

interface Props {
  source: (params: any) => Promise<any>
  value: Item | Item[] | undefined
  onChange(value: any): void
  [key: string]: any
}

export interface LazySelectQueryParams {
  pageNo: number
  pageSize: number
  kw: string
}

const { Option } = Select

const LazySelect = (props: Props) => {
  const { source, value, onChange, ...restProps } = props

  const [data, setData] = useState<Item[]>([])
  const [params, setParams] = useState<LazySelectQueryParams>({ pageNo: 1, pageSize: 15, kw: '' })
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const query = (extraParams = {}) => {
    const nextParams = { ...params, ...extraParams }

    setParams(nextParams)
    setLoading(true)
    source(nextParams).then((res: Item[]) => {
      console.log(res)
      if (params.pageNo === 1) {
        setData(res)
      } else {
        setData([...data, ...res])
      }
      setLoading(false)
      setHasMore(res.length >= nextParams.pageSize)
    })
  }

  const handleVisibleChange = (value: boolean) => {
    setVisible(value)

    if (value) {
      query({ ...params, pageNo: 1, pageSize: 15 })
    }
  }

  const handlePopupScroll = (e: UIEvent) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target as HTMLElement

    if (offsetHeight + scrollTop >= scrollHeight && hasMore && !loading) {
      query({ ...params, pageNo: params.pageNo + 1 })
    }
  }

  const handleSearch = useCallback(
    debounce(kw => query({ ...params, pageNo: 1, kw }), 300),
    []
  )

  const handleChange = (value: SelectValue) => {
    if (Array.isArray(value)) {
      onChange(value.map(item => ({ label: item.label, value: item.key })))
    } else {
      onChange(value ? { label: value.label, value: value.key } : value)
    }
  }

  const getValue = (value: Value) => {
    if (Array.isArray(value)) {
      return value.map(item => ({ key: item.value, label: item.label }))
    } else if (typeof value === 'object') {
      return { key: value.value, label: value.label }
    }
    return value
  }

  return (
    <Select
      {...restProps}
      showSearch
      labelInValue
      filterOption={false}
      // optionLabelProp='name'
      notFoundContent="无法找到"
      loading={loading}
      open={visible}
      value={getValue(value)}
      onDropdownVisibleChange={handleVisibleChange}
      onPopupScroll={handlePopupScroll}
      onSearch={handleSearch}
      onClear={() => handleSearch(undefined)}
      onBlur={() => setParams({ pageNo: 1, pageSize: 15, kw: '' })}
      onChange={handleChange}
    >
      {data.map(item => (
        <Option key={item.value}>{item.label}</Option>
      ))}
    </Select>
  )
}

export default LazySelect

import React, { useState, useEffect } from 'react'
import { Select } from '@uyun/components'
import request from '../../api/request'
const { Option } = Select

export default function DictionarySelect({ onChange }) {
  const [value, setValue] = useState()
  const [data, setData] = useState([])
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSelect = (code, menu) => {
    setValue(code)
    onChange(
      menu.find((item) => item.code === code),
      code
    )
  }

  useEffect(() => {
    async function getData() {
      setLoading(true)
      try {
        const menu = await request.get('/config/menu/list')
        const res = await request.get('/dic/queryDataByDicCode', {
          params: {
            dicCode: 'queryDeviceList',
            page_num: 1,
            page_size: 100
          }
        })
        setMenu(menu)
        setData(res.list)
        setLoading(false)
        if (res.list[0]) {
          handleSelect(res.list[0].value, menu)
        }
      } catch (error) {
        setLoading(false)
      }
    }
    getData()
  }, [])

  return (
    <Select
      value={value}
      onChange={(code) => handleSelect(code, menu)}
      loading={loading}
      showSearch
      style={{ width: 200, marginRight: 8 }}
      placeholder="请选择查询器"
      optionFilterProp="children"
    >
      {data.map((item) => (
        <Option key={item.value} value={item.value}>
          {item.name}
        </Option>
      ))}
    </Select>
  )
}

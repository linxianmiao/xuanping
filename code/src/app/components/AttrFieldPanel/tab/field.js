import React, { useMemo, useState } from 'react'
import { Row, Col, Spin, Input } from '@uyun/components'
import axios from 'axios'

import Checkbox from './checkbox'

const instance = axios.create()

const initQuery = {
  wd: undefined,
  pageNo: 1,
  pageSize: 50,
  scope: 0
}

function Field(props) {
  const { value, onChange, disabledType, modelIds, lockCondition = [], forbiddenFields } = props
  const [fieldList, setFieldList] = useState([])
  const [query, setQuery] = useState(initQuery)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const getList = async (params, type) => {
    setLoading(true)
    // 传模型id来获取模型在私有字段（服务端返回值中modelId不为空就是私有字段）
    const res = await instance.request({
      url: '/itsm/api/v2/config/field/listFieldWithPage',
      method: 'get',
      params: { ...params, modelId: modelIds.join(), appkey: window.LOWCODE_APP_KEY || undefined }
    })
    if (res.status === 200) {
      setQuery({ ...params, pageNo: params.pageNo + 1 })
      setTotal(res.data.data.total)
      setLoading(false)
      if (type) {
        setFieldList(fieldList.concat(res.data.data.list))
      } else {
        setFieldList(res.data.data.list)
      }
    }
  }

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    // 是否到达底部
    const isBottom = scrollTop + offsetHeight >= scrollHeight

    if (fieldList.length !== 0 && fieldList.length >= total) {
      return false
    }
    if (isBottom && !loading) {
      getList(query, 'scroll')
    }
  }

  useMemo(() => {
    getList(query)
  }, [])
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Input.Search
          style={{ width: 200 }}
          allowClear
          enterButton
          placeholder={'请输入关键字'}
          onSearch={(value) => getList({ ...query, pageNo: 1, wd: value })}
          onClear={() => getList({ ...query, pageNo: 1, wd: undefined })}
        />
      </div>
      <div style={{ height: 275, overflow: 'scroll' }} onScroll={handleScroll}>
        <Spin spinning={loading}>
          <Row>
            {fieldList.map((item) => (
              <Col key={item.id || item.code} span={6} style={{ marginBottom: 5 }}>
                <Checkbox
                  record={item}
                  value={value}
                  onChange={onChange}
                  disabled={
                    lockCondition.includes(item.code || item.id) ||
                    disabledType.indexOf(item.type) > -1 ||
                    (Array.isArray(forbiddenFields) ? forbiddenFields.includes(item.code) : false)
                  }
                />
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </>
  )
}

Field.defaultProps = {
  value: [],
  disabledType: [],
  onChange: () => {},
  lockCondition: []
}

export default Field

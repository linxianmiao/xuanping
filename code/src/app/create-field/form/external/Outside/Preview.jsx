import React, { useState } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

const Preview = props => {
  const [value, setValue] = useState(undefined)
  const { fieldData } = props

  const getList = (query, callback) => {
    let { formData, headers, outsideUrl, raw, requestType, keySel, valueSel, keyword, filterMode } = fieldData
    keyword = keyword || 'kw'
    const body = {
      formData,
      headers,
      outsideUrl,
      raw,
      requestType,
      keySel,
      valueSel,
      keyword,
      filterMode,
      type: 'listSel',
      pageNo: query.pageNo,
      // pageSize: query.pageSize
      pageSize: 9999
    }

    if (query.kw) {
      const sign = body.outsideUrl.indexOf('?') > -1 ? '&' : '?'
      body.outsideUrl = body.outsideUrl + sign + `${keyword}=` + encodeURIComponent(query.kw)
    }

    axios.post(API.get_value_by_request, body).then(res => {
      let { list } = res || {}

      list = list.map(item => ({ id: item.value, name: item.label }))
      callback(list)
    })
  }

  return (
    <LazySelect
      filterWithoutQuery={fieldData.filterMode === 0 ? true : false}
      placeholder={i18n('pls_select', '请选择')}
      style={{ width: 200 }}
      getList={getList}
      value={value}
      onChange={setValue}
      dropdownMatchSelectWidth={false}
    />
  )
}

export default Preview

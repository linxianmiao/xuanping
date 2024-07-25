import React, { Fragment } from 'react'
import { Checkbox, Input } from '@uyun/components'

const FilterMode = props => {
  const { value, keyword, onChange, onChangeKeyword } = props

  return (
    <Fragment>
      <Checkbox onChange={e => onChange(e.target.checked ? 1 : 0)} checked={value !== 0}>
        {i18n('filter_by_outside_data', '开启关键词传参实现接口过滤数据，关键词参数名可配置')}
      </Checkbox>
      {
        value !== 0 
        ? <div>{`${i18n('parameter_name', '参数名')}：`}<Input placeholder={i18n('default_kw', '默认为kw')} style={{ width: 200 }} value={keyword} onChange={e => onChangeKeyword(e.target.value)}/></div>
        : null
      }
      
    </Fragment>
  )
}

export default FilterMode

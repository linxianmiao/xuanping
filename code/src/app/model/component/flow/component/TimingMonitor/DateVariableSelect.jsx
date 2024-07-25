import React from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

const parseValue = value => {
  return value ? { key: value.id, label: value.name } : undefined
}

const filterValue = value => {
  if (value) {
    return _.pick(value, 'code', 'id', 'name', 'type')
  }
  return undefined
}

const DateVariableSelect = ({
  modelId,
  value,
  onChange = () => {},
  ...restProps
}) => {
  const getList = async (query, callback) => {
    const params = { ...query, model_id: modelId, types: '6' }
    const res = await axios.get(API.queryParamList, { params }) || {}

    callback(res.list || [])
  }

  return (
    <LazySelect
      {...restProps}
      value={parseValue(value)}
      labelInValue
      onChange={(val, all) => onChange(filterValue(all[0]))}
      getList={getList}
      placeholder="请选择日期时间变量"
    />
  )
}

export default DateVariableSelect

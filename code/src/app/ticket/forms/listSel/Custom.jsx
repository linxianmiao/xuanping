import React from 'react'
import { Select } from '@uyun/components'
import classnames from 'classnames'
// import { FormDebounceSelect } from '../../../components/FormController'

const Option = Select.Option

const Custom = React.forwardRef((props, ref) => {
  const { disabled, field, value, onChange, type } = props
  const clsName = classnames({
    'disabled-item': disabled
  })

  const filterOption = (inputValue, option) => {
    const { value, children } = option.props
    if (typeof children === 'string') {
      return [`${value}`, children].some(
        (item) => item.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
      )
    }
    return false
  }
  let option = field.params
  // if (window.location.href.indexOf('database') !== -1) {
  //   if (!_.isEmpty(option) && !Array.isArray(option)) {
  //     option = JSON.parse(option)
  //   }
  // }

  let finalValue = value
  if (type === 'preview' && field.isSingle === '0' && option && !value) {
    finalValue = _.find(option, (d) => d.select)?.value
  } else if (type === 'preview' && field.isSingle === '1' && option && !value) {
    finalValue = _.chain(option)
      .filter((d) => d.select)
      .map((d) => d.value)
      .value()
  }
  return (
    // <FormDebounceSelect value={value} onChange={onChange} code={field.code}>
    <Select
      ref={ref}
      id={field.code}
      className={clsName}
      allowClear
      showSearch
      mode={field.isSingle === '1' ? 'multiple' : ''}
      disabled={field.isRequired === 2}
      dropdownMatchSelectWidth={false}
      notFoundContent={`${i18n('globe.notFound', '无法找到')}`}
      placeholder={field.isRequired === 2 ? '' : `${i18n('globe.select', '请选择')}${field.name}`}
      // getPopupContainer={() => container || document.body}
      getPopupContainer={(triggerNode) => triggerNode || document.body}
      optionFilterProp="children"
      filterOption={filterOption}
      value={finalValue}
      onChange={onChange}
    >
      {_.map(option, (data) => (
        <Option key={`${data.value}`} value={`${data.value}`}>
          {data.label}
        </Option>
      ))}
    </Select>
    // </FormDebounceSelect>
  )
})

export default Custom

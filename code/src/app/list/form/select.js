import React, { Component } from 'react'
import { Form, Select } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
const FormItem = Form.Item
const Option = Select.Option

export default class ItsmSelect extends Component {
  getList = (query, callback) => {
    let { formData, headers, outsideUrl, raw, requestType, keySel, valueSel, keyword, filterMode } =
      this.props.item
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
      pageSize: query.pageSize
    }

    if (query.kw) {
      const sign = body.outsideUrl.indexOf('?') > -1 ? '&' : '?'
      body.outsideUrl = body.outsideUrl + sign + `${keyword}=` + encodeURIComponent(query.kw)
    }

    axios.post(API.get_value_by_request, body).then((res) => {
      let { list } = res || {}

      list = list.map((item) => ({ id: item.value, name: item.label }))
      callback(list)
    })
  }

  render() {
    let {
      formItemLayout,
      item,
      getFieldDecorator,
      defaultValue,
      size = 'default',
      filterType,
      getPopupContainer,
      disabled,
      label
    } = this.props
    if (item.code === 'overdue') {
      if (_.isString(defaultValue)) {
        defaultValue = [Number(defaultValue)]
      } else if (_.isArray(defaultValue)) {
        defaultValue = _.map(defaultValue, (item) => Number(item))
      }
    }

    return (
      <div>
        {item?.outsideUrl ? (
          <FormItem label={label || item.name} {...formItemLayout}>
            {getFieldDecorator(item.code, {
              initialValue: defaultValue || []
            })(
              <LazySelect
                filterWithoutQuery={item.filterMode === 0}
                disabled={
                  disabled ||
                  (item.code === 'status' &&
                    (filterType === 'myToDo' || filterType === 'groupTodo'))
                }
                placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
                dropdownMatchSelectWidth={false}
                getPopupContainer={getPopupContainer || ((el) => el)}
                mode="multiple"
                optionFilterProp="children"
                showSearch
                allowClear
                getList={this.getList}
                size={size}
                notFoundContent={i18n('globe.not_find', '无法找到')}
                labelInValue
                className="filter-item-select"
              />
            )}
          </FormItem>
        ) : (
          <FormItem label={label || item.name} {...formItemLayout}>
            {getFieldDecorator(item.code, {
              initialValue: defaultValue || []
            })(
              <Select
                mode="multiple"
                disabled={
                  disabled
                  //   ||
                  //   (item.code === 'status' &&
                  //     (filterType === 'myToDo' || filterType === 'groupTodo'))
                }
                showSearch
                allowClear
                size={size}
                getPopupContainer={getPopupContainer || ((el) => el)}
                optionFilterProp="children"
                notFoundContent={i18n('globe.not_find', '无法找到')}
                filterOption={(inputValue, option) => {
                  const { value, children } = option.props
                  if (typeof children === 'string') {
                    return [`${value}`, children].some(
                      (item) => item.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                    )
                  }
                  return false
                }}
                placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
                className="filter-item-select"
              >
                {_.map(item.params, (param) => (
                  <Option key={param.value} value={param.value}>
                    {param.label}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
      </div>
    )
  }
}

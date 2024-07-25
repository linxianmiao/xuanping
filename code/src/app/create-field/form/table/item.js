import React, { Component } from 'react'
import { Input, Select, Checkbox } from '@uyun/components'
const Option = Select.Option

class Item extends Component {
  render () {
    const { total, types, lists, item = {} } = this.props
    const { label, type, source, description, descEnable, value } = item
    const filter = _.find(lists, (o, key) => { return type === key })
    // 编码编辑的时候不能乱改，后端返回的数据中多了color，所以就用是否含有color的key来判断code是否禁用
    return (
      <tr>
        <td>
          <Input value={label} onChange={e => { this.props.onChange(e.target.value, 'label') }} />
        </td>
        <td>
          <Input value={value} disabled={_.has(item, 'color')} onChange={e => { this.props.onChange(e.target.value, 'value') }} />
        </td>
        <td>
          <Select
            value={type}
            showSearch
            optionFilterProp="children"
            getPopupContainer={el => el}
            notFoundContent={i18n('globe.notFound', '无法找到')}
            onChange={value => { this.props.onChange(value, 'type') }}>
            {_.map(types, (item, i) => {
              return <Option key={i} value={item.value}>{item.name}</Option>
            })}
          </Select>
        </td>
        <td>
          { filter
            ? <Select
              value={source}
              showSearch
              optionFilterProp="children"
              getPopupContainer={el => el}
              notFoundContent={i18n('globe.notFound', '无法找到')}
              onChange={value => { this.props.onChange(value, 'source') }}>
              {_.map(filter, (item, i) => {
                return <Option value={item.code} key={item.code}>{item.name}</Option>
              })}
            </Select>
            : <Input value={source} onChange={e => { this.props.onChange(e.target.value, 'source') }} />
          }
        </td>
        <td>
          <Input.TextArea value={description} onChange={e => { this.props.onChange(e.target.value, 'description') }} />
        </td>
        <td>
          <Checkbox checked={descEnable === 1} onChange={e => { this.props.onChange(e.target.checked, 'descEnable') }} />
        </td>
        <td>
          { total > 1 && <span onClick={this.props.onDelete} className="iconfont icon-shanchu" /> }
        </td>
      </tr>
    )
  }
}

export default Item
import React, { Component } from 'react'
import { Form, Button } from '@uyun/components'
import { toJS } from 'mobx'
import Item from './item'
import '../style/table.less'
const FormItem = Form.Item
const types = [
  { name: i18n('table.normal', '普通'), value: 'normal' },
  { name: i18n('single_select', '单选'), value: 'singleSel' },
  { name: i18n('multi_select', '多选'), value: 'multiSel' },
  { name: i18n('list_select', '下拉'), value: 'listSel' },
  { name: i18n('links', '链接'), value: 'links' },
  { name: i18n('attachfile', '附件'), value: 'attachfile' }
]

class Index extends Component {
  state = {
    data: toJS(this.props.defaultValue),
    lists: {}
  }

  onAdd = () => {
    const { data } = this.state
    data.push({ label: '', type: 'normal', source: '', description: '', descEnable: 0, value: undefined })
    this.onParams(data)
  }

  onDelete = index => {
    const { data } = this.state
    data.splice(index, 1)
    this.onParams(data)
  }

  onParams = data => {
    this.setState({ data }, () => {
      this.props.setFieldsValue({ params: data })
    })
  }

  onChange = (value, type, index) => {
    const { data } = this.state
    if (type === 'type') {
      data[index].type = value
      data[index].source = ''
    } else if (type === 'descEnable') {
      data[index][type] = value ? 1 : 0
    } else {
      data[index][type] = value
    }
    this.onParams(data)
  }

  componentDidMount () {
    axios.get(API.query_field_with_type).then(res => {
      this.setState({ lists: res })
    })
  }

  render () {
    const { item, getFieldDecorator, formItemLayout, defaultValue } = this.props
    const { data, lists } = this.state
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: data,
          rules: [{ required: true }]
        })(
          <div className="table-options-box">
            <div className="table-options-btn">
              <Button onClick={this.onAdd} size="small" type="primary">{i18n('add_options', '添加选项')}</Button>
            </div>
            <div className="u4-table u4-table-middle u4-table-scroll-position-left">
              <div className="u4-table-content">
                <div className="u4-table-body">
                  <table>
                    <thead className="u4-table-thead">
                      <tr>
                        <th>{i18n('col_name', '列名称')}</th>
                        <th>{i18n('col_code', '列编码')}</th>
                        <th>{i18n('col_type', '列类型')}</th>
                        <th>{i18n('col_source', '默认值/数据源')}</th>
                        <th>{i18n('col_desc', '列说明')}</th>
                        <th>{i18n('col_desc_enable', '使用说明')}</th>
                        <th>{i18n('operation', '操作')}</th>
                      </tr>
                    </thead>
                    <tbody className="u4-table-tbody">
                      {_.map(data, (item, i) => {
                        return (
                          <Item
                            key={i}
                            item={item}
                            lists={lists}
                            types={types}
                            total={data.length}
                            onChange={(value, type) => { this.onChange(value, type, i) }}
                            onDelete={() => { this.onDelete(i) }} />
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </FormItem>
    )
  }
}

export default Index

import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Select, Input, Cascader, DatePicker, TreeSelect } from '@uyun/components'
import moment from 'moment'
import TimeInterval from './timeInterval'
import ItsmUser from './itsmUser'
const { Option, OptGroup } = Select

export default class KeyValue extends Component {
  onChangeCondition (value, type) {
    if (type === 'int') {
      value = value.replace(/[^\d]/g, '')
    } else if (type === 'double') {
      value = value.replace(/[^\d.]/g, '')
    }
    this.props.onHandleChange(this.props.index, value)
  }

  render () {
    const { node, id } = this.props
    let { value } = this.props
    const widthStyle = {
      key: 150,
      value: 200
    }
    const type = node.type
    return (
      <span style={{ display: 'inline-block' }}>
        {
          (() => {
            if (/singleRowText|flowNo/.test(type)) {
              return (
                <Input
                  value={value}
                  style={{ width: widthStyle.value }}
                  onChange={e => {
                    this.onChangeCondition(e.target.value)
                  }}
                />
              )
            } else if (/listSel|singleSel|layer|business/.test(type)) {
              return (
                <Select
                  showSearch
                  optionFilterProp="children"
                  style={{ width: widthStyle.value }}
                  value={value ? value + '' : null}
                  notFoundContent={i18n('globe.not_find', '无法找到')}
                  getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
                  onChange={value => {
                    this.onChangeCondition(value)
                  }}
                >
                  {type === 'layer' && _.map(node.resParams, (val, key) => <OptGroup key={key} label={key}>{_.map(val, data => <Option key={`${data.value}`} value={`${data.value}`}>{ data.label }</Option>)}</OptGroup>)}
                  {type !== 'layer' && _.map(node.params, (param, i) => <Option key={node.id + i} value={'' + param.value}>{ param.label }</Option>)}
                </Select>
              )
            } else if (/cascader/.test(type)) {
              return (
                <Cascader
                  changeOnSelect
                  placeholder={''}
                  options={toJS(node.cascade)}
                  style={{ width: widthStyle.value }}
                  value={toJS(value)}
                  className="rule-cond-select"
                  notFoundContent={i18n('globe.not_find', '无法找到')}
                  getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
                  onChange={value => {
                    this.onChangeCondition(value)
                  }}
                />
              )
            } else if (/treeSel/.test(type)) {
              return (
                <TreeSelect
                  placeholder={`${i18n('globe.select', '请选择')}`}
                  treeData={toJS(node.treeVos)}
                  allowClear
                  multiple
                  treeCheckable
                  treeDefaultExpandAll
                  dropdownMatchSelectWidth={false}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
                  style={{ width: widthStyle.value }}
                  value={toJS(value)}
                  onChange={value => {
                    this.onChangeCondition(value)
                  }} />
              )
            } else if (/multiRowText/.test(type)) {
              return (
                <Input
                  type="textarea"
                  style={{ width: widthStyle.value }}
                  value={value}
                  onChange={e => {
                    this.onChangeCondition(e.target.value)
                  }}
                />
              )
            } else if (/multiSel/.test(type)) {
              if (value === '') {
                value = []
              }
              return (
                <Select
                  multiple
                  value={toJS(value)}
                  optionFilterProp="children"
                  style={{ width: widthStyle.value }}
                  notFoundContent={i18n('globe.not_find', '无法找到')}
                  getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
                  onChange={value => {
                    this.onChangeCondition(value)
                  }}
                >{
                    _.map(node.params, (param, i) => {
                      return (
                        <Option key={node.id + i} value={'' + param.value}>
                          { param.label }
                        </Option>
                      )
                    })
                  }
                </Select>
              )
            } else if (/user/.test(type)) {
              return (
                <ItsmUser
                  id={id}
                  userTab="1"
                  value={value}
                  style={{ width: widthStyle.value }}
                  onChangeCondition={data => { this.onChangeCondition(data) }} />
              )
            } else if (/department/.test(type)) {
              return (
                <ItsmUser
                  id={id}
                  userTab="2"
                  value={value}
                  style={{ width: widthStyle.value }}
                  onChangeCondition={data => { this.onChangeCondition(data) }} />
              )
            } else if (/int|double/.test(type)) {
              return (
                <Input
                  value={value}
                  style={{ width: widthStyle.value }}
                  onChange={e => {
                    this.onChangeCondition(e.target.value, type)
                  }}
                />)
            } else if (/dateTime/.test(type)) {
              value = value === '' ? undefined : moment(value)
              return (
                <DatePicker
                  value={value}
                  showTime={!node.formatDate}
                  format={node.formatDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
                  getCalendarContainer={() => document.getElementById(id || 'fields-wrap')}
                  onChange={value => {
                    if (value) {
                      const v = moment(value).format(node.formatDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm')
                      this.onChangeCondition(v)
                    }
                  }}
                />)
            } else if (/timeInterval/.test(type)) {
              return <TimeInterval
                style={{ width: widthStyle.value }}
                id={id}
                value={value}
                item={node}
                onChangeCondition={data => { this.onChangeCondition(data) }} />
            } else {
              return (
                <Input
                  value={value}
                  style={{ width: widthStyle.value }}
                  onChange={e => {
                    this.onChangeCondition(e.target.value)
                  }}
                />
              )
            }
          })()
        }
      </span>
    );
  }
}

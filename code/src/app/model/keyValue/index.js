import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Select, Input, Cascader, DatePicker, TreeSelect } from '@uyun/components'
import moment from 'moment'
import ItsmUser from './itsmUser'
import TimeInterval from './timeInterval'
const { Option, OptGroup } = Select

export default class KeyValue extends Component {
  constructor(props) {
    super(props)
    this.state = {
      key: '',
      comparison: '',
      value: ''
    }
  }

  componentDidMount() {
    const { value } = this.props
    if (!_.isEmpty(value)) {
      this.setState(value)
    }
  }

  selectChange(key) {
    this.setState({
      key,
      comparison: 'EQUALS',
      value: ''
    })
  }

  optionSetChange(comparison) {
    this.setState({
      comparison,
      value: ''
    })
  }

  onChangeCondition(value, type) {
    if (type === 'int') {
      value = value.replace(/[^\d]/g, '')
    } else if (type === 'double') {
      value = value.replace(/[^\d.]/g, '')
    }
    this.setState({
      value
    })
  }

  getKeyValueData() {
    const { key, comparison, value } = this.state
    const data = {
      key,
      value
    }
    if (this.props.optionSet) {
      data.comparison = comparison
    }
    return data
  }

  handleKeyValueDelete(index) {
    this.props.handleKeyValueDelete(index)
  }

  render() {
    const { fieldsArr, id, index, optionSet } = this.props
    const { key, comparison } = this.state
    let { value } = this.state
    let type = ''
    let node = null
    _.map(fieldsArr, (item) => {
      if (item.code === key) {
        type = item.type
        node = item
      }
    })

    const widthStyle = {
      key: 150,
      option: 100,
      value: 200
    }
    const selectOption = []
    _.map(fieldsArr, (item) => {
      if (/attachfile|resource|table|richText|securityCode|topology/.test(item.type)) {
        return
      }
      selectOption.push(
        <Option key={item.code} value={item.code}>
          {item.name}
        </Option>
      )
    })
    const optionArr = [
      <Option key="EQUALS" value="EQUALS">
        {i18n('globe.EQUALS', '等于')}
      </Option>,
      <Option key="NOTEQUALS" value="NOTEQUALS">
        {i18n('globe.NOTEQUALS', '不等于')}
      </Option>,
      <Option key="EMPTY" value="EMPTY">
        {i18n('globe.EMPTY', '空')}
      </Option>,
      <Option key="NOTEMPTY" value="NOTEMPTY">
        {i18n('globe.NOTEMPTY', '非空')}
      </Option>
    ]
    if (
      /title|singleRowText|multiRowText|multiSel|user|ticketDesc|singleSel|layer|business/.test(
        type
      )
    ) {
      optionArr.push(
        <Option key="CONTAINS" value="CONTAINS">
          {i18n('globe.CONTAINS', '包含')}
        </Option>
      )
      optionArr.push(
        <Option key="NOTCONTAINS" value="NOTCONTAINS">
          {i18n('globe.NOTCONTAINS', '不包含')}
        </Option>
      )
    }
    if (/int|double/.test(type)) {
      optionArr.push(
        <Option key="LT" value="LT">
          {i18n('globe.LT', '小于')}
        </Option>
      )
      optionArr.push(
        <Option key="GT" value="GT">
          {i18n('globe.GT', '大于')}
        </Option>
      )
    }
    return (
      <div className={this.props.wrapClassName ? this.props.wrapClassName : ''}>
        <div className="clearfix">
          <Select
            showSearch
            optionFilterProp="children"
            notFoundContent={i18n('globe.not_find', '无法找到')}
            value={key}
            style={{ width: widthStyle.key, float: 'left', marginRight: '10px' }}
            onChange={(key) => {
              this.selectChange(key)
            }}
            getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
          >
            {selectOption}
          </Select>
          {optionSet && (
            <Select
              value={comparison}
              style={{ width: widthStyle.option, float: 'left', marginRight: '10px' }}
              onChange={(comparison) => {
                this.optionSetChange(comparison)
              }}
              getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
            >
              {optionArr}
            </Select>
          )}
          <div className="fl">
            {(() => {
              if (/EMPTY|NOTEMPTY/.test(comparison)) {
                return null
              }
              if (/singleRowText|flowNo/.test(type)) {
                return (
                  <Input
                    value={value}
                    style={{ width: widthStyle.value }}
                    onChange={(e) => {
                      this.onChangeCondition(e.target.value)
                    }}
                  />
                )
              } else if (
                /listSel|singleSel|business|layer/.test(type) &&
                /EQUALS|NOTEQUALS/.test(comparison)
              ) {
                let params = _.map(node.params, (param, i) => (
                  <Option key={node.id + i} value={'' + param.value}>
                    {param.label}
                  </Option>
                ))
                if (type === 'layer') {
                  params = _.map(node.resParams, (val, key) => (
                    <OptGroup key={key} label={key}>
                      {_.map(val, (data) => (
                        <Option key={`${data.value}`} value={`${data.value}`}>
                          {data.label}
                        </Option>
                      ))}
                    </OptGroup>
                  ))
                }
                return (
                  <Select
                    showSearch
                    optionFilterProp="children"
                    style={{ width: widthStyle.value }}
                    value={value ? value + '' : null}
                    notFoundContent={i18n('globe.not_find', '无法找到')}
                    getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
                    onChange={(value) => {
                      this.onChangeCondition(value)
                    }}
                  >
                    {params}
                  </Select>
                )
              } else if (/cascader/.test(type)) {
                return (
                  <Cascader
                    changeOnSelect
                    placeholder={`${i18n('globe.select', '请选择')}`}
                    options={toJS(node.cascade)}
                    style={{ width: widthStyle.value }}
                    value={toJS(value)}
                    className="rule-cond-select"
                    notFoundContent={i18n('globe.not_find', '无法找到')}
                    getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
                    onChange={(value) => {
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
                    onChange={(value) => {
                      this.onChangeCondition(value)
                    }}
                  />
                )
              } else if (/multiRowText/.test(type)) {
                return (
                  <Input.TextArea
                    style={{ width: widthStyle.value }}
                    value={value}
                    onChange={(e) => {
                      this.onChangeCondition(e.target.value)
                    }}
                  />
                )
              } else if (
                /multiSel/.test(type) ||
                (/listSel|singleSel|business|layer/.test(type) &&
                  /CONTAINS|NOTCONTAINS/.test(comparison))
              ) {
                if (value === '') {
                  value = []
                }
                let params = _.map(node.params, (param, i) => (
                  <Option key={param.value} value={'' + param.value}>
                    {param.label}
                  </Option>
                ))
                if (type === 'layer') {
                  params = _.map(node.resParams, (val, key) => (
                    <OptGroup key={key} label={key}>
                      {_.map(val, (data) => (
                        <Option key={`${data.value}`} value={`${data.value}`}>
                          {data.label}
                        </Option>
                      ))}
                    </OptGroup>
                  ))
                }
                return (
                  <Select
                    mode="multiple"
                    value={toJS(value)}
                    style={{ width: widthStyle.value }}
                    notFoundContent={i18n('globe.not_find', '无法找到')}
                    getPopupContainer={() => document.getElementById(id || 'fields-wrap')}
                    onChange={(value) => {
                      this.onChangeCondition(value)
                    }}
                  >
                    {params}
                  </Select>
                )
              } else if (/user/.test(type)) {
                return (
                  <ItsmUser
                    id={id}
                    userTab="1"
                    value={value}
                    style={{ width: widthStyle.value }}
                    onChangeCondition={(data) => {
                      this.onChangeCondition(data)
                    }}
                  />
                )
              } else if (/department/.test(type)) {
                return (
                  <ItsmUser
                    id={id}
                    userTab="2"
                    value={value}
                    style={{ width: widthStyle.value }}
                    onChangeCondition={(data) => {
                      this.onChangeCondition(data)
                    }}
                  />
                )
              } else if (/int|double/.test(type)) {
                return (
                  <Input
                    value={value}
                    style={{ width: widthStyle.value }}
                    onChange={(e) => {
                      this.onChangeCondition(e.target.value, type)
                    }}
                  />
                )
              } else if (/dateTime/.test(type)) {
                value = value === '' ? undefined : moment(value)
                return (
                  <DatePicker
                    value={value}
                    showTime={!node.formatDate}
                    format={node.formatDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
                    getCalendarContainer={() => document.getElementById(id || 'fields-wrap')}
                    onChange={(value) => {
                      if (value) {
                        const v = moment(value).format(
                          node.formatDate ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'
                        )
                        this.onChangeCondition(v)
                      }
                    }}
                  />
                )
              } else if (/timeInterval/.test(type)) {
                return (
                  <TimeInterval
                    style={{ width: widthStyle.value }}
                    id={id}
                    value={value}
                    item={node}
                    onChangeCondition={(data) => {
                      this.onChangeCondition(data)
                    }}
                  />
                )
              } else {
                return (
                  <Input
                    value={value}
                    style={{ width: widthStyle.value }}
                    onChange={(e) => {
                      this.onChangeCondition(e.target.value)
                    }}
                  />
                )
              }
            })()}
          </div>
          <i
            style={{ right: '19px', top: '3px' }}
            className="iconfont icon-shanchu fl"
            onClick={() => {
              this.handleKeyValueDelete(index)
            }}
          />
        </div>
      </div>
    )
  }
}

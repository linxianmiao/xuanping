import React, { Component } from 'react'
import SingleUser from './singleUser'
import SimpEditor from '~/components/SimpEditor'
import { Select, Input, Cascader, TreeSelect, Form } from '@uyun/components'
import CodeMirror from '~/components/codeEditor'
import ItsmUser from '~/components/triggerValueList/users'
import { validJson } from '~/ticket/forms/utils/validatorField'
import TicketDate from '~/components/TicketDate'
const FormItem = Form.Item
const Option = Select.Option
export default class KeyValue extends Component {
  state = {
    inputType: 'password'
  }

  onChangeCondition = (value, type) => {
    if (type === 'int') {
      value = value.replace(/[^\d]/g, '')
    } else if (type === 'double') {
      value = value.replace(/[^\d.]/g, '')
    }
    this.props.onHandleChange && this.props.onHandleChange(this.props.index, value)
  }

  checkJOSN = (value) => {
    const { isError, errorMes } = validJson(null, value)

    return {
      validateStatus: isError ? 'error' : 'success',
      help: isError ? errorMes : ''
    }
  }

  handleClick = () => {
    this.setState((prveState) => ({
      inputType: prveState.inputType === 'password' ? 'text' : 'password'
    }))
  }

  render() {
    const { node, triggerNode } = this.props
    let { value, fieldUsers, variableUsers, store } = this.props
    const { inputType } = this.state
    const widthStyle = {
      key: 150,
      value: '100%'
    }
    const { type = 'singleRowText', isSingle, code } = node
    return (
      <div>
        <span>
          {(() => {
            if (/singleRowText/.test(type)) {
              return (
                <Input
                  value={value}
                  style={{ width: widthStyle.value }}
                  onChange={(e) => {
                    this.onChangeCondition(e.target.value)
                  }}
                />
              )
            } else if (/listSel|singleSel/.test(type)) {
              return (
                <Select
                  showSearch
                  mode={type === 'listSel' && isSingle === '1' ? 'multiple' : ''}
                  optionFilterProp="children"
                  style={{ width: widthStyle.value }}
                  value={value || undefined}
                  onChange={(value) => {
                    this.onChangeCondition(value)
                  }}
                >
                  {_.map(node.params, (param, i) => {
                    return (
                      <Option key={node.id + i} value={'' + param.value}>
                        {param.label}
                      </Option>
                    )
                  })}
                </Select>
              )
            } else if (/cascader/.test(type)) {
              return (
                <Cascader
                  changeOnSelect
                  placeholder={''}
                  options={node.cascade}
                  style={{ width: widthStyle.value }}
                  value={value}
                  className="rule-cond-select"
                  onChange={(value) => {
                    this.onChangeCondition(value)
                  }}
                />
              )
            } else if (/treeSel/.test(type)) {
              return (
                <TreeSelect
                  placeholder={''}
                  treeData={node.treeVos}
                  allowClear
                  multiple
                  treeCheckable
                  treeDefaultExpandAll
                  dropdownMatchSelectWidth={false}
                  className="rule-cond-select"
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  style={{ width: widthStyle.value }}
                  value={value}
                  onChange={(value) => {
                    this.onChangeCondition(value)
                  }}
                />
              )
            } else if (/multiRowText/.test(type)) {
              return (
                <Input
                  type="textarea"
                  style={{ width: widthStyle.value }}
                  value={value}
                  onChange={(e) => {
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
                  mode="multiple"
                  showSearch
                  value={value}
                  optionFilterProp="children"
                  style={{ width: widthStyle.value }}
                  onChange={(value) => {
                    this.onChangeCondition(value)
                  }}
                >
                  {_.map(node.params, (param, i) => {
                    return (
                      <Option key={node.id + i} value={'' + param.value}>
                        {param.label}
                      </Option>
                    )
                  })}
                </Select>
              )
            } else if (/jsontext/.test(type)) {
              const { validateStatus, help } = this.checkJOSN(value)
              return (
                <FormItem validateStatus={validateStatus} help={help}>
                  <CodeMirror value={value} onChange={this.onChangeCondition} />
                </FormItem>
              )
            } else if (/user/.test(type)) {
              return <ItsmUser type="user" value={value} onChangeCondition={this.handleChange} />
            } else if (/singleUser/.test(type)) {
              return (
                <SingleUser
                  value={value}
                  store={store}
                  triggerNode={triggerNode}
                  onChangeCondition={this.onChangeCondition}
                  fieldUsers={fieldUsers}
                  variableUsers={variableUsers}
                />
              )
            } else if (/department/.test(type)) {
              return (
                <ItsmUser type="department" value={value} handleChange={this.onChangeCondition} />
              )
            } else if (/richText/.test(type)) {
              return <SimpEditor value={value} code={code} onChange={this.onChangeCondition} />
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
              return <TicketDate field={node} value={value} onChange={this.onChangeCondition} />
            } else if (/securityCode/.test(type)) {
              return (
                <div className="new-itsm-create-field-pwd-wrap">
                  <Input
                    value={value}
                    type={inputType}
                    style={{ width: widthStyle.value }}
                    onChange={(e) => {
                      this.onChangeCondition(e.target.value)
                    }}
                  />
                  {inputType === 'password' ? (
                    <i onClick={this.handleClick} className="icon-yinjianhui iconfont" />
                  ) : (
                    <i onClick={this.handleClick} className="icon-biyan iconfont" />
                  )}
                </div>
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
        </span>
      </div>
    )
  }
}

import React, { Component } from 'react'
import { Select, Input, Cascader, InputNumber, TreeSelect } from '@uyun/components'
import UserValue from './userValue'
const Option = Select.Option
const OptGroup = Select.OptGroup

class ConditionValue extends Component {
    state = {
      list: [],
      type: '',
      inputType: 'password'
    }

    context = {

    }

    handleClick = () => {
      this.setState(prveState => ({
        inputType: prveState.inputType === 'password' ? 'text' : 'password'
      }))
    }

    getKeyValue = (code, type = 0, modelId) => {
      if (code === 'activity') {
        axios.get(API.get_nodes_by_model, { params: { id: modelId } }).then(res => {
          this.setState({
            list: res.comparsionList,
            type: res.comparsionType
          })
        })
      } else {
        axios.get(`${API.get_comparsion}/${code}`, {
          params: {
            type: type,
            modelId: modelId
          }
        }).then(res => {
          this.setState({
            list: code === 'layer' ? res.resParams : res.comparsionList,
            type: res.comparsionType
          })
        })
      }
    }

    onSelect = value => {
      this.props.onChange(value)
    }

    onChange = e => {
      this.props.onChange(e.target.value)
    }

    onUser = values => {
      this.props.onChange(values)
    }

    componentWillReceiveProps (nextProps) {
      if (nextProps.code !== this.props.code || nextProps.modelId !== this.props.modelId) {
        this.getKeyValue(nextProps.code, nextProps.type, nextProps.modelId)
      }
    }

    componentDidMount () {
      const { code, type, modelId } = this.props
      this.getKeyValue(code, type, modelId)
    }

    render () {
      const { type, list } = this.state
      const { value, comparison } = this.props
      return (
        <div>
          {
          // 单选
            (/listSel|singleSel|business/.test(type) && /EQUALS|NOTEQUALS/.test(comparison)) &&
            <Select value={value || ''}
              onSelect={this.onSelect}
              showSearch
              style={{ width: '100%' }}
              optionFilterProp="children"
            >
              {_.map(list, (item, i) => {
                return <Option key={item.value} value={String(item.value)}>{item.name || item.label}</Option>
              })}
            </Select>
          }
          {
          // 带搜索单选
            /layer/.test(type) &&
            <Select
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              value={value || ''}
              onSelect={this.onSelect}
            >
              {_.map(list, (item, i) => {
                return (
                  <OptGroup key={i} label={i}>
                    {_.map(item, child => {
                      return <Option key={child.value} value={String(child.value)}>{child.label}</Option>
                    })}
                  </OptGroup>
                )
              })}
            </Select>
          }
          {
          // 密码
            /securityCode/.test(type) &&
            <div className="new-itsm-create-field-pwd-wrap">
              <Input type={this.state.inputType} size="large" value={value}
                onChange={this.onChange} />
              {
                this.state.inputType === 'password'
                  ? <i onClick={this.handleClick} className="icon-yinjianhui iconfont" />
                  : <i onClick={this.handleClick} className="icon-biyan iconfont" />
              }
            </div>
          }
          {
          // 级联
            /cascader/.test(type) &&
            <Cascader changeOnSelect
              style={{ width: '100%' }}
              placeholder={''}
              options={list}
              value={value}
              onChange={this.onSelect}
            />
          }
          {
          // 树形
            /treeSel/.test(type) &&
            <TreeSelect
              style={{ width: '100%' }}
              placeholder={''}
              treeData={list}
              allowClear
              multiple
              treeCheckable
              treeDefaultExpandAll
              dropdownMatchSelectWidth={false}
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              value={value}
              onChange={this.onSelect}
            />
          }
          {
          // 单行文本
            /singleRowText|flowNo/.test(type) &&
            <Input value={value}
              onChange={this.onChange}
            />
          }
          {
          // 多行文本
            /multiRowText/.test(type) &&
            <Input
              type="textarea"
              value={value}
              onChange={this.onChange}
            />
          }
          {
          // 多选
            (/multiSel/.test(type) || (/listSel|singleSel|business/.test(type) && /CONTAINS|NOTCONTAINS/.test(comparison))) &&
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              value={value}
              onChange={this.onSelect}
            >
              {_.map(list, item => {
                return <Option key={item.value} value={String(item.value)}>{item.name || item.label}</Option>
              })}
            </Select>
          }
          {
          // 数字输入框
            /int|double/.test(type) &&
            <InputNumber
              value={value}
              className="rule-cond-select item-value"
              onChange={this.onSelect}
            />
          }
          {
          // 多选
            /user/.test(type) &&
            <UserValue value={value} onChange={this.onUser} />
          }
          {
            !/int|double|user|multiSel|business|singleRowText|multiRowText|cascader|listSel|singleSel|layer|treeSel|securityCode/.test(type) &&
            <Input
              value={value}
              className="rule-cond-select item-value"
              onChange={this.onChange}
            />
          }
        </div>
      );
    }
}

export default ConditionValue

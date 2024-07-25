import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Row, Col, Button, Radio, Card } from '@uyun/components'
import ItemWrap from '../cascader/itemWrap'
import OutsideData from './outsideData'
import DictionaryData from './dictionaryData'
import uuidv4 from 'uuid/v4'

import '../../component/listSel/style/index.less'

export default class External extends Component {
  // 参数来源切换
  onTabs = (value) => {
    const data = toJS(this.props.store.fieldData)
    data.tabStatus = value
    this.props.store.setFieldData(data)
    // 字典数据要单选
    if (value === '2') {
      this.props.form.setFieldsValue({ type: 'cascader' })
    }
  }

  // 设置整体字段信息值
  onChangeValue = (fieldData) => {
    this.props.store.setFieldData(fieldData)
  }

  state = {
    data: this.props.defaultValue || []
  }

  onAdd = (level, parantIndex, index, item) => {
    const { data } = this.state
    if (level === 0) {
      data.push({
        label: '',
        value: uuidv4(),
        select: 0,
        children: [
          {
            label: '',
            value: uuidv4(),
            select: 0,
            children: [
              {
                label: '',
                value: uuidv4(),
                select: 0,
                children: [
                  {
                    label: '',
                    value: uuidv4(),
                    select: 0,
                    children: [
                      {
                        label: '',
                        value: uuidv4(),
                        select: 0,
                        children: [
                          {
                            label: '',
                            value: uuidv4(),
                            select: 0,
                            children: null
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      })
    }

    if (level === 1) {
      data[parantIndex].children.push({ label: '', value: uuidv4(), select: 0, children: [] })
    }
    this.onParams(data)
  }

  onCopy = (level, parantIndex) => {
    const { data } = this.state
    const newdata = data
      .slice(0, parantIndex + 1)
      .concat({ label: '', value: uuidv4(), select: 0, children: [] })
      .concat(data.slice(parantIndex + 1))
    this.onParams(newdata)
  }

  onMoveUp = (index, parentIndex) => {
    const { data } = this.state
    const item = _.cloneDeep(data[index])
    const item2 = _.cloneDeep(data[index - 1])
    data[index - 1] = item
    data[index] = item2
    this.onParams(data)
  }

  onMoveDown = (index, parentIndex) => {
    const { data } = this.state
    const item = _.cloneDeep(data[index])
    const item2 = _.cloneDeep(data[index + 1])
    data[index] = item2
    data[index + 1] = item
    this.onParams(data)
  }

  onDelete = (index) => {
    const { data } = this.state
    data.splice(index, 1)
    this.onParams(data)
  }

  onChange = (item, i) => {
    const { data } = this.state
    data[i] = item
    this.onParams(data)
  }

  onValue = (value, index) => {
    const data = _.cloneDeep(this.state.data)
    data[index].label = value
    this.onParams(data)
  }

  onParams = (data) => {
    const { setFieldsValue } = this.props
    this.setState({ data }, () => {
      setFieldsValue && setFieldsValue({ cascaderData: data })
    })
  }

  cascaderORtreeSel = (e) => {
    this.props.setFieldsValue && this.props.setFieldsValue({ type: e.target.value })
  }

  render() {
    const { fieldData, formItemLayout } = this.props
    const { data } = this.state
    const props = {
      fieldData,
      onChange: this.onChangeValue,
      store: this.props.store
    }

    return (
      <Row style={{ marginBottom: 10 }}>
        <Col span={formItemLayout.labelCol.span} className="u4-form-item-label">
          <label className="u4-form-item-required">{i18n('col_data_source', '数据源')}</label>
        </Col>
        <Col span={formItemLayout.wrapperCol.span} className="list-select-component">
          <Radio.Group value={fieldData.tabStatus} onChange={(e) => this.onTabs(e.target.value)}>
            <Radio.Button value="0">{i18n('custom_options', '自定义选项')}</Radio.Button>
            <Radio.Button value="2">{i18n('dictionary_data', '字典数据')}</Radio.Button>
            <Radio.Button value="1">{i18n('outside_data', '外部数据')}</Radio.Button>
          </Radio.Group>
          <Card style={{ marginTop: 10 }}>
            {fieldData.tabStatus === '0' && (
              <div className="cascader-options-box">
                <div className="cascader-options-btn">
                  <Button
                    onClick={() => {
                      this.onAdd(0)
                    }}
                    size="small"
                    type="primary"
                  >
                    {i18n('add_options', '添加选项')}
                  </Button>
                </div>
                <div className="cascader-options-content">
                  {_.map(data, (item, i) => {
                    return (
                      <ItemWrap
                        total={data.length}
                        index={i}
                        level={1}
                        key={i}
                        item={item}
                        onAdd={this.onAdd}
                        onCopy={this.onCopy}
                        onDelete={this.onDelete}
                        onChange={this.onChange}
                        onValue={this.onValue}
                        onMoveUp={this.onMoveUp}
                        onMoveDown={this.onMoveDown}
                      />
                    )
                  })}
                </div>
              </div>
            )}
            {fieldData.tabStatus === '2' && <DictionaryData {...props} />}
            {fieldData.tabStatus === '1' && <OutsideData {...props} />}
          </Card>
        </Col>
      </Row>
    )
  }
}

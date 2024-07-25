import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Row, Col, Card, Radio } from '@uyun/components'
import CustomOptions from './customOptions'
import OutsideData from './Outside'
import DictionaryData from './dictionaryData'

export default class External extends Component {
  // 参数来源切换
  onTabs = (value) => {
    const data = toJS(this.props.store.fieldData)
    data.tabStatus = value
    this.props.store.setFieldData(data)
  }

  // 设置整体字段信息值
  onChange = (fieldData) => {
    this.props.store.setFieldData(fieldData)
  }

  render() {
    const { fieldData, formItemLayout, getFieldValue } = this.props
    const props = {
      fieldData,
      formItemLayout,
      onChange: this.onChange,
      store: this.props.store,
      getFieldValue
    }

    return (
      <Row>
        <Col span={formItemLayout.labelCol.span} className="u4-form-item-label">
          <label className="u4-form-item-required">{i18n('col_data_source', '数据源')}</label>
        </Col>
        <Col span={formItemLayout.wrapperCol.span}>
          <div className="list-select-component">
            <Radio.Group value={fieldData.tabStatus} onChange={(e) => this.onTabs(e.target.value)}>
              <Radio.Button value="0">{i18n('custom_options', '自定义选项')}</Radio.Button>
              <Radio.Button value="1">{i18n('outside_data', '外部数据')}</Radio.Button>
              <Radio.Button value="2">{'字典数据'}</Radio.Button>
            </Radio.Group>
            <Card style={{ margin: '10px 0' }}>
              {fieldData.tabStatus === '0' && <CustomOptions {...props} />}
              {fieldData.tabStatus === '1' && <OutsideData {...props} />}
              {fieldData.tabStatus === '2' && <DictionaryData {...props} />}
            </Card>
          </div>
        </Col>
      </Row>
    )
  }
}

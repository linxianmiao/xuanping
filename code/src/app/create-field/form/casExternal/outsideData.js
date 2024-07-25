import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Row, Col, Button, Input, Radio, Checkbox, Select, Tabs, Popover, Cascader } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'

const Option = Select.Option
const TabPane = Tabs.TabPane

const TabPaneTitle = props => {
  const { data, value, label, onChange } = props
  return <span>
    <Radio onChange={() => { onChange(value) }} checked={data && data.isSelect} />
    <Popover placement="top" content={i18n('selected_work', '选中才会生效')} title="" trigger="hover">
      {label}
    </Popover>
  </span>
}

class OutsideData extends Component {
  constructor(props) {
    super(props)
    this.state = {
      options: [],
      activeKey: (props.fieldData.raw && props.fieldData.raw.isSelect) ? '1' : '0',
      value: undefined,
      showOptions: false
    }
  }

  // 数据来源，请求类型, key, value变更
  onChange = (value, type) => {
    const { fieldData } = this.props
    fieldData[type] = value
    this.props.onChange(fieldData)
  }

  // body类型变更
  onRadio = type => {
    const { fieldData } = this.props
    _.set(fieldData, 'formData.isSelect', 0)
    _.set(fieldData, 'raw.isSelect', 0)
    fieldData[type].isSelect = 1
    this.props.onChange(fieldData)
  }

  // formData参数必选选择
  onCheckbox = (e, index) => {
    const { fieldData } = this.props
    fieldData.formData.data[index].isRequired = e.target.checked ? 1 : 0
    this.props.onChange(fieldData)
  }

  // 添加参数
  onAddParam = type => {
    const { fieldData } = this.props
    if (type === 'headers') {
      if (fieldData[type]) {
        fieldData[type].push({ paramName: '', paramValue: '' })
      } else {
        fieldData[type] = [{ paramName: '', paramValue: '' }]
      }
    }
    if (type === 'formData') {
      if (_.get(fieldData, 'formData.data')) {
        fieldData[type].data.push({ paramName: '', paramValue: '', paramDesc: '', isRequired: 0 })
      } else {
        _.set(fieldData, 'formData.data', [{ paramName: '', paramValue: '', paramDesc: '', isRequired: 0 }])
      }
    }
    this.props.onChange(fieldData)
  }

  // 删除参数
  onDeleteParam = (index, type) => {
    const { fieldData } = this.props
    if (type === 'headers') {
      fieldData[type].splice(index, 1)
    }
    if (type === 'formData') {
      fieldData[type].data.splice(index, 1)
    }
    this.props.onChange(fieldData)
  }

  // 变更参数
  onParams = (e, index, paramType, param) => {
    const { fieldData } = this.props
    if (paramType === 'headers') {
      fieldData[paramType][index][param] = e.target.value
    }
    if (paramType === 'formData') {
      fieldData[paramType].data[index][param] = e.target.value
    }
    this.props.onChange(fieldData)
  }

  // 获取参外部数据
  onAjax = (query, callback) => {
    const { fieldData } = this.props
    const { formData, headers, outsideUrl, raw, requestType } = fieldData
    const params = { formData, headers, outsideUrl, raw, requestType, type: 'cascader', pageNo: 1, pageSize: 9999 }

    if (query) {
      params.pageNo = query.pageNo
      params.pageSize = query.pageSize
    }

    axios.post(API.get_key_by_request, params).then(res => {
      let { list = [] } = res || {}

      list = list.map(item => ({ id: item.value, name: item.label , children :item.children || []}))
      callback && callback(list)

      if (list && list.length > 0) {
        this.setState({ showOptions: true })
      }
      fieldData.thirdPartData = res || []
      this.props.onChange(fieldData)
    })
  }

  setEmptyChildrenForCascade = (cascade = []) => {
    if (!cascade || cascade.length === 0) {
      return []
    }

    return cascade.map(item => {
      if (item.children && item.children.length > 0) {
        return { ...item, children: this.setEmptyChildrenForCascade(item.children) }
      }
      return { ...item, children: null }
    })
  }

  // 预览
  onView = () => {
    const { fieldData } = this.props
    const { formData, headers, outsideUrl, raw, requestType, keySel, valueSel } = fieldData
    const params = { formData, headers, outsideUrl, raw, requestType, keySel, valueSel, type: 'cascader' }
    axios.post(API.get_value_by_request, params).then(res => {
      this.setState({ options: res })
    })
  }

  handleChangeRaw = e => {
    const { fieldData } = this.props
    fieldData.raw.data = e.target.value
    this.props.onChange(fieldData)
  }

  onTabs = activeKey => {
    this.setState({ activeKey })
  }

  render() {
    const { headers, formData, outsideUrl, requestType, raw, thirdPartData, keySel, valueSel } = this.props.fieldData
    const { showOptions, activeKey, value } = this.state
    const formDataList = formData ? formData.data || [] : []
    const rawValue = raw ? raw.data || '' : ''
    return (
      <div className="list-select-outside-data">
        <Row>
          <Col span={3}>{i18n('outside_data_origin', '外部数据来源')}</Col>
          <Col span={21}>
            <Input value={outsideUrl} style={{ width: 500, marginRight: 10 }} onChange={e => { this.onChange(e.target.value, 'outsideUrl') }} />
            <Button type="primary" onClick={() => this.onAjax()}>{i18n('click_get', '点击获取')}</Button>
          </Col>
        </Row>
        <Row>
          <Col span={3}>{i18n('ajax_type', '请求类型')}</Col>
          <Col span={21}>
            <Select value={requestType} style={{ width: 500 }} onChange={value => { this.onChange(value, 'requestType') }} >
              <Option value="get">GET</Option>
              <Option value="post">POST</Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={3}>Headers</Col>
          <Col span={21}>
            <div className="ajax-wrap ajax-headers-wrap">
              {_.map(headers, (item, i) => {
                return <div className="ajax-wrap-item" key={i}>
                  <span className="headers-param-name">
                    <Input onChange={e => { this.onParams(e, i, 'headers', 'paramName') }} value={item.paramName} />
                  </span>
                  <span className="headers-param-value">
                    <Input onChange={e => { this.onParams(e, i, 'headers', 'paramValue') }} value={item.paramValue} />
                  </span>
                  {headers.length > 1 &&
                    <button className="field-options-btn iconfont icon-shanchu" onClick={() => { this.onDeleteParam(i, 'headers') }} />
                  }
                </div>
              })}
              <Button onClick={() => { this.onAddParam('headers') }} className="add-param" type="primary" icon={<PlusOutlined />}>{i18n('add_options', '添加选项')}</Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={3}>Body</Col>
          <Col span={21} style={{ marginBottom: 10 }}>
            <Tabs activeKey={activeKey} type="card" onChange={this.onTabs} className="outside-data-body">
              <TabPane tab={<TabPaneTitle data={formData} label="form-data" value="formData" onChange={this.onRadio} />} key="0">
                <div className="ajax-wrap ajax-headers-wrap">
                  {_.map(formDataList, (item, i) => {
                    return <div className="ajax-wrap-item" key={i}>
                      <span className="item-select">
                        <Checkbox checked={item.isRequired} onChange={e => { this.onCheckbox(e, i) }} />
                      </span>
                      <span className="body-param-name">
                        <Input value={item.paramName}
                          onChange={e => { this.onParams(e, i, 'formData', 'paramName') }}
                          placeholder={i18n('listSel.input_tips1', '请输入参数名（字母或数字）')}
                        />
                      </span>
                      <span className="body-param-value">
                        <Input value={item.paramValue}
                          onChange={e => { this.onParams(e, i, 'formData', 'paramValue') }}
                          placeholder={i18n('listSel.input_tips2', '请输入参数值，可插入变量')}
                        />
                      </span>
                      <span className="body-param-desc">
                        <Input value={item.paramDesc}
                          onChange={e => { this.onParams(e, i, 'formData', 'paramDesc') }}
                          placeholder={i18n('listSel.input_tips3', '描述')}
                        />
                      </span>
                      {formDataList.length > 1 &&
                        <button className="field-options-btn iconfont icon-shanchu" onClick={() => { this.onDeleteParam(i, 'formData') }} />
                      }
                    </div>
                  })}
                  <Button onClick={() => { this.onAddParam('formData') }} className="add-param" type="primary" icon={<PlusOutlined />}>{i18n('add_options', '添加选项')}</Button>
                </div>
              </TabPane>
              <TabPane tab={<TabPaneTitle data={raw} label="raw" value="raw" onChange={this.onRadio} />} key="1">
                <Input.TextArea onChange={this.handleChangeRaw} className="outside-data-raw" value={rawValue} />
              </TabPane>
            </Tabs>
          </Col>
        </Row>
        {showOptions && <Row>
          <Col span={3}>{i18n('selected_value', '选项的值')}</Col>
          <Col span={10}>
          <Cascader
            style={{width:'250px'}}
            allowClear
            showSearch
            placeholder={`${i18n('globe.select', '请选择')}`}
            notFoundContent={`${i18n('globe.notFound', '无法找到')}`}
            options={this.setEmptyChildrenForCascade(this.props.fieldData.thirdPartData?.list || [])}
          />
            {/* <LazySelect
              placeholder={i18n('pls_select', '请选择')}
              style={{ width: 200 }}
              getList={this.onAjax}
              value={value}
              onChange={value => this.setState({ value })}
              type = 'cascader'
              cascade ={this.props.fieldData.thirdPartData?.list || []}
            /> */}
            {/* <Cascader
              // allowClear
              changeOnSelect
              // showSearch
              // placeholder={`${i18n('globe.select', '请选择')}`}
              notFoundContent={`${i18n('globe.notFound', '无法找到')}`}
              // getPopupContainer={el => el}
              options={thirdPartData} /> */}
          </Col>
          {/* <Col span={4}>
            <Select value={keySel} onChange={value => this.onChange(value, 'keySel')}>
              {_.map(thirdPartData, (item, i) => {
                return <Option key={i} value={item.value}>{item.label}</Option>
              })}
            </Select>
          </Col>
          <Col span={3}>{i18n('selected_text', '选项的文字')}</Col>
          <Col span={4}>
            <Select value={valueSel} onChange={value => this.onChange(value, 'valueSel')}>
              {_.map(thirdPartData, (item, i) => {
                return <Option key={i} value={item.value}>{item.label}</Option>
              })}
            </Select>
          </Col>
          <Col span={2} style={{ paddingLeft: 10 }}>
            <Button onClick={this.onView} type='primary'>{i18n('conf.model.yulan', '预览')}</Button>
          </Col> */}
        </Row>}
        {/* {(options && options.length > 0) && <Row>
          <Col span={3}>{i18n('list_sel_view', '下拉效果预览')}</Col>
          <Col span={21}>
            <Select placeholder={i18n('pls_select', '请选择')} style={{ width: 200 }}>
              {_.map(options, (item, i) => {
                return <Option key={i} value={item.value}>{item.label}</Option>
              })}
            </Select>
          </Col>
        </Row>} */}
      </div>
    );
  }
}

export default OutsideData

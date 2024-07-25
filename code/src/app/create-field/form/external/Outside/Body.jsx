import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons';
import { Input, Button, Tabs, Checkbox, Radio, Popover } from '@uyun/components'

const TabPane = Tabs.TabPane

const TabPaneTitle = props => {
  const { checked, value, label, onSelect } = props
  return (
    <span>
      <Radio checked={checked} value={value} onChange={() => onSelect(value)} />
      <Popover
        placement="top"
        content={i18n('selected_work', '选中才会生效')}
        title=""
        trigger="hover"
      >
        {label}
      </Popover>
    </span>
  )
}

class Body extends Component {
  static defaultProps = {
    formData: {},
    raw: {},
    onChange: () => {}
  }

  constructor(props) {
    super(props)

    const { raw } = props
    const activeKey = raw && raw.isSelect ? '1' : '0'

    this.state = {
      activeKey
    }
  }

  handleSelect = type => {
    const { formData, raw, onChange } = this.props

    if (type === 'formData') {
      formData.isSelect = 1
      raw.isSelect = 0
    } else if (type === 'raw') {
      formData.isSelect = 0
      raw.isSelect = 1
    }

    onChange({ formData, raw })
  }

  handleCheckFormData = (checked, index) => {
    const { formData, raw, onChange } = this.props

    formData.data[index].isRequired = checked ? 1 : 0
    onChange({ formData, raw })
  }

  handleFormDataChange = (value, index, type) => {
    const { formData, raw, onChange } = this.props

    formData.data[index][type] = value
    onChange({ formData, raw })
  }

  handleAddFormData = () => {
    const { formData, raw, onChange } = this.props

    if (formData.data) {
      formData.data.push({ paramName: '', paramValue: '', paramDesc: '', isRequired: 0 })
    } else {
      formData.data = [{ paramName: '', paramValue: '', paramDesc: '', isRequired: 0 }]
    }

    onChange({ formData, raw })
  }

  handleDeleteFormData = index => {
    const { formData, raw, onChange } = this.props

    formData.data.splice(index, 1)
    onChange({ formData, raw })
  }

  handleRawChange = value => {
    const { formData, raw, onChange } = this.props

    raw.data = value
    onChange({ formData, raw })
  }

  render() {
    const { formData, raw } = this.props
    const { activeKey } = this.state

    return (
      <Tabs
        type="card"
        className="outside-data-body"
        activeKey={activeKey}
        onChange={key => this.setState({ activeKey: key })}
      >
        <TabPane
          key="0"
          tab={
            <TabPaneTitle
              checked={formData.isSelect}
              label="form-data"
              value="formData"
              onSelect={this.handleSelect}
            />
          }
        >
          <div className="ajax-wrap ajax-headers-wrap">
            {
              _.map(formData.data, (item, index) => {
                return (
                  <div key={index} className="ajax-wrap-item">
                    <span className="item-select">
                      <Checkbox
                        checked={item.isRequired}
                        onChange={e => this.handleCheckFormData(e.target.checked, index)}
                      />
                    </span>
                    <span className="body-param-name">
                      <Input
                        placeholder={i18n('listSel.input_tips1', '请输入参数名（字母或数字）')}
                        value={item.paramName}
                        onChange={e => this.handleFormDataChange(e.target.value, index, 'paramName')}
                      />
                    </span>
                    <span className="body-param-value">
                      <Input
                        placeholder={i18n('listSel.input_tips2', '请输入参数值，可插入变量')}
                        value={item.paramValue}
                        onChange={e => this.handleFormDataChange(e.target.value, index, 'paramValue')}
                      />
                    </span>
                    <span className="body-param-desc">
                      <Input
                        placeholder={i18n('listSel.input_tips3', '描述')}
                        value={item.paramDesc}
                        onChange={e => this.handleFormDataChange(e.target.value, index, 'paramDesc')}
                      />
                    </span>
                    {
                      formData.data && formData.data.length > 1 && (
                        <button
                          className="field-options-btn iconfont icon-shanchu"
                          onClick={() => this.handleDeleteFormData(index)}
                        />
                      )
                    }
                  </div>
                )
              })
            }
            <Button
              className="add-param"
              type="primary"
              icon={<PlusOutlined />}
              onClick={this.handleAddFormData}
            >
              {i18n('add_options', '添加选项')}
            </Button>
          </div>
        </TabPane>
        <TabPane
          key="1"
          tab={
            <TabPaneTitle
              checked={raw.isSelect}
              label="raw"
              value="raw"
              onSelect={this.handleSelect}
            />
          }
        >
          <Input.TextArea
            className="outside-data-raw"
            value={raw.data || ''}
            onChange={e => this.handleRawChange(e.target.value)}
          />
        </TabPane>
      </Tabs>
    );
  }
}

export default Body

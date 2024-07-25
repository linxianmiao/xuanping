import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { DeleteOutlined, PlusOutlined } from '@uyun/icons'
import { Input, Button, Tabs, Checkbox, Radio, Popover, Row, Col, Icon } from '@uyun/components'
import AddVar from '~/trigger/component/triggerRule/addVar'
import ParamsSelect from '~/trigger/component/paramSelect'
import styles from './index.module.less'

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

@inject('triggerStore')
@observer
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

  handleFormDataVarChange = (variable, index, type) => {
    const { formData, raw, onChange } = this.props
    const prevValue = formData.data[index][type]

    formData.data[index][type] = prevValue + '${ticket.' + variable + '}'
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
    let { triggerStore, fullParams } = this.props
    const formData = this.props.formData || {}
    const raw = this.props.raw || {}
    const { activeKey } = this.state
    if (!fullParams) {
      fullParams = triggerStore.fieldParams.fullParams
    }

    const fieldParamsType = [
      { code: 'fieldparamlist', name: i18n('system_attr', '系统属性'), list: toJS(fullParams) },
      { code: 'builtinParams', name: i18n('builtin_field', '内置字段') },
      { code: 'defineParams', name: i18n('custom_field', '自定义字段') }
    ]

    return (
      <Tabs
        type="card"
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
          <div style={{ marginBottom: 10 }}>
            {
              _.map(formData.data, (item, index) => {
                return (
                  <Row key={index} gutter={8} className={styles.formDataItem}>
                    <Col span={1}>
                      <Checkbox
                        checked={item.isRequired}
                        onChange={e => this.handleCheckFormData(e.target.checked, index)}
                      />
                    </Col>
                    <Col span={5}>
                      <Input
                        placeholder={i18n('listSel.input_tips1', '请输入参数名（字母或数字）')}
                        value={item.paramName}
                        onChange={e => this.handleFormDataChange(e.target.value, index, 'paramName')}
                      />
                    </Col>
                    <Col span={7}>
                      <Input
                        placeholder={i18n('listSel.input_tips2', '请输入参数值，可插入变量')}
                        value={item.paramValue}
                        onChange={e => this.handleFormDataChange(e.target.value, index, 'paramValue')}
                      />
                    </Col>
                    <Col span={3}>
                      <ParamsSelect
                        paramsType={fieldParamsType}
                        onChangeParam={key => this.handleFormDataVarChange(key, index, 'paramValue')}
                      >
                        <Input placeholder="插入变量" value={undefined} />
                      </ParamsSelect>
                    </Col>
                    <Col span={6}>
                      <Input
                        placeholder={i18n('listSel.input_tips3', '描述')}
                        value={item.paramDesc}
                        onChange={e => this.handleFormDataChange(e.target.value, index, 'paramDesc')}
                      />
                    </Col>
                    {
                      formData.data && formData.data.length > 1 && (
                        <DeleteOutlined onClick={() => this.handleDeleteFormData(index)} />
                      )
                    }
                  </Row>
                )
              })
            }
            <Button
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
          <AddVar
            type="textarea"
            item={{ value: raw.data }}
            titleParams={toJS(fullParams)}
            setTriggerData={(triggerIndex, paramIndex, value) => this.handleRawChange(value)}
          />
        </TabPane>
      </Tabs>
    )
  }
}

export default Body

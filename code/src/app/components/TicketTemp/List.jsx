import React, { Component } from 'react'
import { DeleteOutlined, EditOutlined } from '@uyun/icons'
import { Select, Tooltip, Divider } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { getNoDisabledCodes, deleteTemp } from './logic'
import classnames from 'classnames'
const { Option } = Select

@inject('ticketTemplateStore')
@observer
export default class TempList extends Component {
  static defaultProps = {
    onManage: () => {}, // 打开模板管理
    handleChangeTempData: () => {}
  }

  state = {
    loading: false,
    formInitValue: null
  }

  onDropdownVisibleChange = async (open) => {
    if (open) {
      const { temp } = this.props.ticketTemplateStore
      const { modelId } = this.props

      if (modelId) {
        this.setState({ loading: true })
        await this.props.ticketTemplateStore.getModelFormTemplateList({ modelId })
        this.setState({ loading: false })
      }
    }
  }

  onDel = (item) => deleteTemp(item, this.props.ticketTemplateStore)

  onChange = async (id) => {
    const { fieldList, setTicketValues, ticketId, modelId, caseId, tacheId } = this.props
    const jobField = fieldList.find((d) => d.type === 'job') || {}
    const jobCode = jobField.code
    const notDisabledCode = getNoDisabledCodes(fieldList).filter((d) => d !== jobCode)
    if (id) {
      const res = (await this.props.ticketTemplateStore.getModelFormTemplate({ id })) || {}
      const { formData } = res
      formData.ticketTemplateId = res.templateId
      notDisabledCode.push('ticketTemplateId')

      if (_.isEmpty(this.state.formInitValue)) {
        this.setState({ formInitValue: this.props.getTicketValues() })
      }
      this.props.ticketTemplateStore.setProps({ currentTemp: res })
      setTicketValues(_.pick(formData, notDisabledCode))
    } else {
      setTicketValues(_.pick(this.state.formInitValue, notDisabledCode))
      this.props.ticketTemplateStore.setProps({ currentTemp: null })
    }

    // 切换模板之后触发绑定在自身身上的自定义事件
    // 表单的 src\app\ticket\forms\index.js 文件中会监听该事件，然后决定要不要重新执行onload脚本
    let event
    try {
      event = new CustomEvent('ticketTemplateSwitch', {
        detail: { ticketId, modelId, caseId, tacheId }
      })
    } catch (e) {
      event = document.createEvent('CustomEvent')
      event.initCustomEvent('ticketTemplateSwitch', false, false, {
        ticketId,
        modelId,
        caseId,
        tacheId
      })
    }
    const dom = document.getElementById(`ticketTemplate${ticketId}`)
    dom.dispatchEvent(event)
  }

  render() {
    const { modelId, ticketId, onManage } = this.props
    const { temp, currentTemp } = this.props.ticketTemplateStore

    return (
      <div className="ticket-temp-list" id={`ticketTemplate${ticketId}`}>
        <Select
          allowClear
          optionLabelProp="name"
          onChange={this.onChange}
          value={_.get(currentTemp, 'templateId')}
          onDropdownVisibleChange={this.onDropdownVisibleChange}
          placeholder={i18n('primary-template', '模板', { name: i18n('globe.select', '请选择') })}
          dropdownRender={(menu) => (
            <div>
              {menu}
              <Divider style={{ margin: '4px 0' }} />
              <div
                style={{ padding: '8px', cursor: 'pointer', textAlign: 'center' }}
                onMouseDown={onManage}
              >
                {i18n('template.manage', '模板管理')}
              </div>
            </div>
          )}
        >
          {_.map(temp[modelId], (item) => {
            return (
              <Option
                key={item.id}
                value={item.id}
                name={item.templateName}
                title={item.templateName}
              >
                <Tooltip
                  placement="left"
                  title={item.desc}
                  mouseLeaveDelay={0}
                  mouseEnterDelay={0.3}
                >
                  <div className="ticket-temp-list-option">
                    <span className="name">{item.templateName}</span>
                    <span className={classnames('icons', { disabled: item.editOrDelete !== 1 })}>
                      <EditOutlined
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.editOrDelete === 1) this.props.handleChangeTempData(item)
                        }}
                      />
                      <DeleteOutlined
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.editOrDelete === 1) this.onDel(item)
                        }}
                      />
                    </span>
                  </div>
                </Tooltip>
              </Option>
            )
          })}
        </Select>
      </div>
    )
  }
}

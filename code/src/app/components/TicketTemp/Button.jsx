import React, { Component } from 'react'
import { Button } from '@uyun/components'
import { inject, observer } from 'mobx-react'

/**
 * 未选择模版—底部按钮为“创建”、“保存为模板
 * 选择模板（他人共享）—底部按钮为“创建”、“保存为模板”，
 * 选择模板（自身创建）—底部按钮为“创建”、“更新模板”
 */

@inject('ticketTemplateStore')
@observer
class TemplateButton extends Component {
  static defaultProps = {
    handleChangeTempData: () => {}
  }

  handleClick = () => {
    const { currentTemp } = this.props.ticketTemplateStore
    const { templateId, editOrDelete, templateName } = currentTemp || {}
    const data = { ...currentTemp }

    if (editOrDelete === 1) {
      data.templateId = templateId
      data.templateName = templateName
    } else {
      data.templateId = undefined
      data.templateName = templateName ? templateName + '(1)' : ''
    }

    this.props.handleChangeTempData(data)
  }

  render() {
    const { hideButton = false } = this.props
    const { currentTemp } = this.props.ticketTemplateStore

    const { editOrDelete, templateId } = currentTemp || {}

    // 模板为自己创建的且选中模板后可以更新
    const text =
      editOrDelete === 1 && templateId
        ? i18n('primary-template', { name: i18n('globe.update', '更新') })
        : i18n('save-ticket-template', '保存为模板')
    return hideButton ? (
      <span onClick={this.handleClick}>{text}</span>
    ) : (
      <Button onClick={this.handleClick}>{text}</Button>
    )
  }
}
export default TemplateButton

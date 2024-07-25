import React from 'react'
import { toJS } from 'mobx'
import { Modal, message } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import TriggerConfig from './triggerConfig'
import './index.less'

@inject('formSetGridStore')
@observer
class FieldSettingModal extends React.Component {
  constructor(props) {
    super(props)
    this.triggerConfig = React.createRef()
  }

  get field() {
    const { modalValue } = this.props
    const { layoutIndex, tabsIndex, fieldIndex, parentType } = modalValue || {}
    const { currentGrid } = this.props.formSetGridStore
    const { formLayoutVos } = currentGrid
    let field = {}
    if (parentType === 'group' || parentType === 'panel') {
      field = formLayoutVos[layoutIndex].fieldList[fieldIndex]
    } else if (parentType === 'tab') {
      field = formLayoutVos[layoutIndex].tabs[tabsIndex].fieldList[fieldIndex]
    } else if (parentType === 'layout') {
      field = formLayoutVos[layoutIndex]
    }
    return field
  }

  handleOk = async () => {
    try {
      const linkageStrategyVos = await this.checkLinkageStrategyVos()
      const { layoutIndex, tabsIndex, fieldIndex, parentType } = this.props.modalValue
      let dataType
      if (this.props.linkSource === 'group') {
        dataType = 'linkage'
      }
      this.props.formSetGridStore.changeField(
        layoutIndex,
        tabsIndex,
        fieldIndex,
        parentType,
        _.assign({}, this.field, { linkageStrategyVos }),
        dataType
      )

      this.handleCancel()
    } catch (e) {
      message.error(e)
    }
  }

  checkLinkageStrategyVos = () => {
    return new Promise((resolve, reject) => {
      const { linkageStrategyVos } = this.triggerConfig.current.state
      const emptyMsg = i18n('conf.model.field.setting.tip1', '请填写完整触发规则')

      for (const item of linkageStrategyVos) {
        const { changeContent, conditionExpressions } = item

        if (!changeContent || changeContent.length === 0) {
          reject(emptyMsg)
        }
        if (!conditionExpressions || conditionExpressions.length === 0) {
          reject(emptyMsg)
        }

        for (const content of changeContent) {
          const { value, type, empty } = content
          // 未置空 且 未设值
          if (empty !== 1 && _.isEmpty(value)) {
            reject(emptyMsg)
          } else {
            if (type === 'asyncValue') {
              try {
                eval('(' + content.value + ')')
              } catch (e) {
                reject(i18n('conf.model.field.setting.tip0', '动态值函数错误'))
              }
            }
          }
        }

        for (const expression of conditionExpressions) {
          const { key, comparison, value } = expression
          if (
            _.isEmpty(key) ||
            _.isEmpty(comparison) ||
            (_.isEmpty(value) && !_.includes(['EMPTY', 'NOTEMPTY'], comparison))
          ) {
            reject(emptyMsg)
          }
        }
      }
      resolve(linkageStrategyVos)
    })
  }

  handleCancel = () => {
    this.props.handleSideShow(null, 'modal')
  }

  render() {
    const { modalValue, linkSource } = this.props
    const { allFields } = this.props.formSetGridStore
    return (
      <Modal
        size="large"
        destroyOnClose
        visible={Boolean(modalValue)}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        title={this.field.name}
        width={900}
      >
        {Boolean(modalValue) && (
          <TriggerConfig
            ref={this.triggerConfig}
            field={this.field}
            linkSource={linkSource}
            allFields={allFields}
            linkageStrategyVos={toJS(this.field.linkageStrategyVos)}
          />
        )}
      </Modal>
    )
  }
}
export default FieldSettingModal

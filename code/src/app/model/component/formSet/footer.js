import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { Button, message } from '@uyun/components'
import { getAndvalidateFields, getFormLayoutVos } from '~/components/formSet/logic'
import LowcodeLink, { linkTo } from '~/components/LowcodeLink'
import { orLowcode } from '~/utils/common'
@inject('formSetGridStore', 'globalStore', 'basicInfoStore')
@withRouter
@observer
class Footer extends Component {
  state = {
    loading: false
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  handleSave = async () => {
    const { currentGrid } = this.props.formSetGridStore
    let { formLayoutVos } = currentGrid
    const childFormIds = []
    const relatedVariables = []
    // 对formLayoutVos进行处理
    formLayoutVos = getFormLayoutVos(formLayoutVos)
    for (const item of formLayoutVos) {
      if (item.type === 'subForm') {
        item.mode === 0 ? childFormIds.push(item.id) : relatedVariables.push(item.relatedVariable)
      }
    }
    try {
      const fields = await getAndvalidateFields(formLayoutVos)
      this.setState({ loading: true })
      const res = await this.props.formSetGridStore.saveModelForm({
        ...currentGrid,
        formLayoutVos,
        fieldList: fields,
        templateEnable: 0,
        childFormIds,
        relatedVariables,
        modelId: this.context.modelId,
        isChildForm: 0 // 不是子表单
      })
      this.setState({ loading: false })
      if (res) {
        const { type, ordinaryError } = res
        if (type === 'ordinary' && !_.isEmpty(ordinaryError)) {
          this.props.formSetGridStore.setData(ordinaryError, 'errors')
        } else {
          this.props.formSetGridStore.setData({}, 'errors')
          this.props.handleChangeFieldType('grid')
        }
      }
    } catch (e) {
      console.error('ee', e.toString())
      let mesg = ''
      if (e.toString().includes('group')) {
        mesg = '纵向分组标题'
      } else if (e.toString().includes('subForm')) {
        mesg = '子表单标题或子表单引用'
      } else if (e.toString().includes('iframe')) {
        mesg = 'iframe标题或URL相关配置'
      } else if (e.toString().includes('sla')) {
        mesg = 'SLA标题'
      } else if (e.toString().includes('relateSubProcess')) {
        mesg = '关联任务流程标题或关联子流程、自定义列'
      }
      if (mesg) {
        message.error(i18n('model.field.create.card.err', '请完善表单信息') + ': ' + mesg)
      } else {
        message.error(i18n('model.field.create.card.err', '请完善表单信息'))
      }
    }
  }

  handleBack = () => {
    this.props.history.replace('/conf/model')
  }

  render() {
    const { modelModify } = this.props.globalStore.configAuthor
    const { showStatusButton } = this.props.globalStore
    const { fieldType } = this.props
    const { loading } = this.state
    const { modelStatus } = this.props.basicInfoStore
    const disabled = modelStatus !== -1 && !orLowcode(showStatusButton)
    return (
      <div className="footer">
        {fieldType === 'formLayout' && (
          <span className="footer-btns">
            {orLowcode(modelModify) && (
              <Button
                loading={loading}
                type="primary"
                onClick={this.handleSave}
                disabled={disabled}
              >
                {i18n('conf.model.save.fields', '保存表单')}
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => {
                this.props.handlePreview(true)
              }}
            >
              {i18n('conf.model.yulan', '预览')}
            </Button>
            <Button
              onClick={() => {
                this.props.handleChangeFieldType('grid')
              }}
            >
              {i18n('conf.model.foot.backCrads', '返回表单列表')}
            </Button>
          </span>
        )}
        {fieldType === 'grid' && (
          <Button
            onClick={() => {
              let url = '/conf/model'
              if (window.LOWCODE_APP_KEY) {
                url = `/modellist/${window.LOWCODE_APP_KEY}/?activeTab=model`
              }
              linkTo({
                url: url,
                history: this.props.history,
                pageKey: 'model_list'
              })
            }}
          >
            {/* <LowcodeLink url="/conf/model" pageKey="home" homeKey="model_list"> */}
            {i18n('conf.model.foot.backModelList', '返回模型列表')}
            {/* </LowcodeLink> */}
          </Button>
        )}
      </div>
    )
  }
}
export default Footer

import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Button, Modal, message } from '@uyun/components'
import getFields, { getFormLayoutVos } from '~/components/common/getFields'
@inject('formSetGridStore')
@observer
export default class Footer extends Component {
  state = {
    loading: false
  }

  handleSave = async () => {
    const { currentGrid } = this.props.formSetGridStore
    let { formLayoutVos } = currentGrid
    formLayoutVos = getFormLayoutVos(formLayoutVos)
    try {
      const fields = await getFields(formLayoutVos)
      this.setState({ loading: true })
      const forms = _.assign({}, currentGrid, {
        templateEnable: 1,
        fieldList: fields,
        formLayoutVos,
        isChildForm: 1 // 子表单
      })
      const res = await this.props.formSetGridStore.saveModelForm(forms)
      this.setState({ loading: false })
      if (res == null) {
        return false
      }
      const { subformError, type } = res || {}

      if (type === 'subForm' && !_.isEmpty(subformError)) {
        this.props.formSetGridStore.setData(subformError, 'errors')
      } else {
        this.props.formSetGridStore.setData({}, 'errors')
        this.props.handleChangeFieldType('customize')
      }
    } catch (e) {
      if (e.message === 'iframe') {
        message.error(i18n('model.field.create.card.err', '请完善表单信息'))
      }
    }
  }

  handleCancel = () => {
    this.props.handleChangeFieldType('customize')
  }

  render() {
    const { loading } = this.state
    return (
      <div className="form-management-footer">
        <Button loading={loading} type="primary" onClick={this.handleSave}>{i18n('conf.model.save.fields', '保存表单')}</Button>
        <Button type="primary" onClick={() => { this.props.handlePreview(true) }}>{i18n('conf.model.yulan', '预览')}</Button>
        <Button onClick={this.handleCancel}>{i18n('globe.back', '返回')}</Button>
      </div>
    )
  }
}
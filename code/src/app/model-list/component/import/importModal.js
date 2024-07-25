import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Modal, Progress } from '@uyun/components'
import ImportForm from './importForm'

@inject('modelListStore')
@observer
export default class Import extends Component {
  state = {
    loading: false,
    percent: 30
  }

  handleImport = e => {
    this.importModal.validateFields((errors, values) => {
      if (errors) return false
      this.props.handleShowImport({ key: 'progress' })
      setInterval(() => {
        if (this.state.percent !== 90) {
          this.setState({ percent: this.state.percent + 10 })
        }
      }, 1000)
      const { file, updateModelId, updateModules, modelLayoutId } = values
      const formData = new FormData()
      updateModelId && formData.append('updateModelId', updateModelId)
      modelLayoutId && formData.append('modelLayoutId', modelLayoutId)
      formData.append('fileName', file.name)
      formData.append('fileLength', file.size)
      formData.append('contentType', file.type)
      formData.append('updateModules', updateModules.join())
      formData.append('file', new Blob([file], { type: 'text/csv' }))

      this.props.modelListStore.importAdvancedModel(formData).then(res => {
        this.props.handleShowImport({ key: '' })
        if (res) {
          this.props.modelListStore.getConfModelList()
          Modal.success({
            title: i18n('import.sucess', '导入成功'),
            content: res === '200' ? '' : res
          })
        } else {
          Modal.error({
            title: i18n('import-failed')
          })
        }
      })
    })
  }

  render () {
    const { visible } = this.props
    const { percent } = this.state
    const dilver = {
      visible: Boolean(visible),
      onOk: this.handleImport,
      closable: visible !== 'progress',
      maskClosable: visible === 'progress',
      okText: i18n('modal.import.text', '导入'),
      title: visible !== 'progress' ? i18n('modal.import.text1', '模型导入') : '',
      onCancel: () => {
        this.props.handleShowImport({ key: '' })
      }
    }
    if (visible === 'progress') {
      _.assign(dilver, { footer: null })
    }
    return (
      <Modal {...dilver}>
        {visible !== 'progress' &&
        <ImportForm
          ref={node => { this.importModal = node }}
          visible={visible} />}
        {visible === 'progress' && <div style={{ padding: '50px 0' }}><Progress percent={percent} /></div>}
      </Modal>
    )
  }
}

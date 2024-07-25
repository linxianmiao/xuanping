import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Grid from './grid'
import FormLayoutVos from './formLayoutVos'
import { inject, observer } from 'mobx-react'
import './index.less'
@inject('formSetGridStore')
@observer
export default class Field extends Component {
  static childContextTypes = {
    scene: PropTypes.string
  }

  getChildContext() {
    const { scene } = this.props
    return {
      scene // 表示当前的场景 'formManagement':子表单管理；'model':模型
    }
  }

  componentWillUnmount() {
    this.props.formSetGridStore.setData([], 'allFields')
  }

  render () {
    const { fieldType, previewVisible,modelId} = this.props

    const dilver = {
      previewVisible,
      handlePreview: this.props.handlePreview,
      handleChangeFieldType: this.props.handleChangeFieldType,
      modelId
    }
    return (
      <div className="itsm-components-form-set">
        {fieldType === 'formLayout' && <FormLayoutVos {...dilver} store={this.props.formSetGridStore}/>}
        {fieldType === 'grid' && <Grid {...dilver} />}
        {fieldType === 'customize' && this.props.customize}
      </div>
    )
  }
}

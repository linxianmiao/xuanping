import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import FormSet from '~/components/formSet'
import Footer from './footer'
import './index.less'
@inject('formSetGridStore')
@observer
export default class FormManagement extends Component {
  static contextTypes = {
    modelId: PropTypes.string
  }

  state = {
    fieldType: 'grid',
    previewVisible: false
  }

  handleChangeFieldType = (fieldType) => {
    if (fieldType === 'grid') {
      this.props.formSetGridStore.getGridList(this.context.modelId)
    }
    this.setState({ fieldType })
  }

  handlePreview = (previewVisible) => {
    this.setState({ previewVisible })
  }

  render() {
    const { fieldType, previewVisible } = this.state
    return (
      <div className="model-private-form-management">
        <FormSet
          fieldType={fieldType}
          previewVisible={previewVisible}
          modelId={this.context.modelId}
          handlePreview={this.handlePreview}
          handleChangeFieldType={this.handleChangeFieldType}
        />
        <Footer
          fieldType={fieldType}
          previewVisible={previewVisible}
          handlePreview={this.handlePreview}
          handleChangeFieldType={this.handleChangeFieldType} />
      </div>
    )
  }
}
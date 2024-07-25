import React, { Component } from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Drag from './drag'
import FormLayout from './formLayout'
import Side from './side'
import Modal from './modal'
import PreviewForm from './previewForm'
import './index.less'

export default class FormLayoutVos extends Component {
  state = {
    modalValue: null,
    sideValue: null,
    linkSource: null
  }

  async componentDidMount() {
    await this.props.store.getFieldList(this.props.modelId)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.previewVisible) {
      return {
        modalValue: null,
        sideValue: null
      }
    }
  }

  handleSideShow = (value, type, source) => {
    if (type === 'modal') {
      this.setState({ modalValue: value, linkSource: source })
    } else {
      this.setState({ sideValue: value })
    }
  }

  render() {
    const { previewVisible } = this.props
    const { sideValue, modalValue, linkSource } = this.state
    // Drag , Side , FormLayout, 用到浮动三列布局，不要乱动位置
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="clearfix form-set-formLayoutVos">
          <Drag />
          <div className="formset-layout-wrap">
            <Side
              sideValue={sideValue}
              handleSideShow={this.handleSideShow}
              modelId={this.props.modelId}
            />
            <FormLayout
              sideValue={sideValue}
              modalValue={modalValue}
              handleSideShow={this.handleSideShow}
            />
          </div>
          <Modal
            modalValue={modalValue}
            linkSource={linkSource}
            handleSideShow={this.handleSideShow}
          />
          <PreviewForm previewVisible={previewVisible} handlePreview={this.props.handlePreview} />
        </div>
      </DndProvider>
    )
  }
}

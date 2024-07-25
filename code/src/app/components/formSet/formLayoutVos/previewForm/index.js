import React, { Component } from 'react'
import { Drawer } from '@uyun/components'
import Forms from './forms'

export default class PreviewForm extends Component {
  handleClose = (e) => {
    this.props.handlePreview(false)
  }

  render() {
    const { previewVisible } = this.props
    return (
      <Drawer
        destroyOnClose
        outerClose={false}
        title={i18n('conf.model.yulan', '预览')}
        visible={previewVisible}
        onClose={this.handleClose}
        // ref={(node) => {
        //     this.drawer = node
        //   }}
      >
        {/* <ConfigProvider getPopupContainer={() => this.drawer?.bodyNode} locale={locale}> */}
        <Forms />
        {/* </ConfigProvider> */}
      </Drawer>
    )
  }
}

import React, { Component } from 'react'
import BasicForm from './basicForm'
class ServiceGuide extends Component {
  render () {
    const { serviceData, formItemLayout } = this.props
    return (
      <div className="service-rich-text-wrap">
        { !_.isEmpty(serviceData) &&
        <div
          className="editor-style"
          dangerouslySetInnerHTML={{ __html: JSON.parse(serviceData.content).richText || '' }} /> }
      </div>
    )
  }
}
export default ServiceGuide

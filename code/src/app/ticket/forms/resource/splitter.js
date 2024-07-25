import React, { Component } from 'react'
import MultipleResource from './multiple'
import SignleResource from './signle'
import IframeModal from './iframe'
import ResourceConflict from './conflict'
class Splitter extends Component {
  state = {
    url: '',
    visible: ''
  }

  showCMDB = (record) => {
    const { modelId, tacheId, ticketId, caseId } = this.props.forms
    const { code, formType, isCiFormAuthority } = this.props.field
    const { id, taskId, name, status, commitSandbox } = record
    // 已删除,新增的数据无法查看
    if (_.includes('7', status)) {
      return false
    }
    // * 0：已关联，且未到审核环节
    // * 1：更新中
    // * 2：已生效
    // * 3：有冲突
    // * 4：已关联，但是已经过了审核阶段
    // * 5: 新建配置项中
    // * 6: 计划删除
    // * 7: 已在配置库中删除
    let url = '/cmdb/config.html#'
    if (_.includes(['2', '0', '4'], status)) {
      url += `/ci/${id}?hideOperation=true`
    } else if (_.includes(['1', '3', '5', '6', '9', '10'], status)) {
      url += `/detail?sandboxTaskId=${taskId}&fieldType=${code}&formType=${formType}&dealType=check`
      if (id) {
        url += `&ciId=${id}`
      }
      if (isCiFormAuthority === 1) {
        url += `&modelId=${modelId}&tacheId=${tacheId}&ticketId=${ticketId}`
        if (caseId) {
          url += `&caseId=${caseId}`
        }
      }
    } else if (commitSandbox) {
      url += `/ci/${id}?hideOperation=true`
    }

    this.setState({ url, visible: 'look', name: name })
  }

  render() {
    const { field, type, forms } = this.props
    const { status, isExcutor } = forms || {}
    const { url, visible, name } = this.state
    return field.privacy && type === 'detail' ? (
      status === 2 && isExcutor ? (
        <div id={field.code}>
          {field.isSingle === '1' ? (
            <MultipleResource showCMDB={this.showCMDB} {...this.props} />
          ) : (
            <SignleResource showCMDB={this.showCMDB} {...this.props} />
          )}
          <ResourceConflict {...this.props} />
          <IframeModal
            name={name}
            url={url}
            iframeVisible={visible}
            field={field}
            hideIframe={() => {
              this.setState({ url: '', visible: '' })
            }}
          />
        </div>
      ) : null
    ) : (
      <div id={field.code}>
        {field.isSingle === '1' ? (
          <MultipleResource showCMDB={this.showCMDB} {...this.props} />
        ) : (
          <SignleResource showCMDB={this.showCMDB} {...this.props} />
        )}
        <ResourceConflict {...this.props} />
        <IframeModal
          name={name}
          url={url}
          iframeVisible={visible}
          field={field}
          hideIframe={() => {
            this.setState({ url: '', visible: '' })
          }}
        />
      </div>
    )
  }
}
export default Splitter

import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Upload, message } from '@uyun/components'
@inject('handleRuleStore')
@observer
export default class RuleImport extends Component {
  render() {
    const props = {
      name: 'file',
      action: API.importRule,
      showUploadList: false,
      beforeUpload: (info) => {
        if (info.size > 20 * 1024 * 1024) {
          message.error(i18n('ticket.create.upload.tip1', '单文件上传文件最大20M'))
          return false
        }
        if (info.name.indexOf('.xlsx') === -1) {
          message.error(i18n('ticket.create.upload.tip2', '上传文件格式不正确'))
          return false
        }
      },
      onChange: (info) => {
        const { response } = info.file
        if (!_.isEmpty(response)) {
          if (+response.errCode === 200 && _.isEmpty(response.data)) {
            message.success(i18n('import.sucess', '导入成功'))
            const { ruleQuery } = this.props.handleRuleStore
            this.props.handleRuleStore.setDate({
              ruleQuery: {
                pageNo: 1,
                pageSize: 20,
                kw: undefined,
                sceneId: ruleQuery.sceneId,
                type: 'HANDLER_RULE'
              }
            })
          } else {
            message.error(response.data)
          }
        }
      }
    }
    return (
      <Upload {...props}>
        <Button style={{ marginRight: 15 }} type="primary">{i18n('import', '导入')}</Button>
      </Upload>
    )
  }
}
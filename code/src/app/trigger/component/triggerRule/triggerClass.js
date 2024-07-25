import React, { Component } from 'react'
import AddVar from './addVar'
import CodeEditor from '../codeEditor'
import User from './user'
import Color from './Color'
import OutlineSelect from './OutlineSelect'
import { Form, Radio, Input, Upload, Button, message } from '@uyun/components'
const { TextArea } = Input
const FormItem = Form.Item
const RadioGroup = Radio.Group
class triggerClass extends Component {
  componentDidMount() {
    this.initialExecuteWay()
  }

  // 逾期策略中，调用脚本只支持异步，初始默认选中异步
  initialExecuteWay = () => {
    const {
      trigger: { executeParamPos },
      triggerIndex,
      setTriggerData,
      source
    } = this.props

    if (source !== 'olaStrategy') {
      return
    }

    const index = executeParamPos.findIndex((item) => item.type === 4)

    if (index > -1) {
      setTriggerData(triggerIndex, index, 'async')
    }
  }

  onChange = (info, index, value = []) => {
    const { setTriggerData, triggerIndex } = this.props
    if (info.file.status === 'done') {
      if (+info.file.response.errCode === 200) {
        const fileList = _.concat(value || [], info.file.response.data)
        setTriggerData(triggerIndex, index, fileList)
        message.success(`${info.file.name} file uploaded successfully`)
      } else {
        message.error(`${info.file.name} file upload failed.`)
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  }

  deleteUpload = (index, i, value) => {
    const { setTriggerData, triggerIndex } = this.props
    value.splice(i, 1)
    setTriggerData(triggerIndex, index, _.isEmpty(value) ? null : value)
    message.success('file removed successfully')
  }

  render() {
    const {
      source,
      modelId,
      formItemLayout,
      titleParams,
      builtinParams,
      defineParams,
      fullParams,
      trigger,
      triggerIndex,
      setTriggerData,
      store,
      links
    } = this.props
    const diliver = {
      modelId,
      titleParams,
      builtinParams,
      defineParams,
      fullParams,
      triggerIndex,
      trigger,
      store,
      setTriggerData
    }
    const codeFormItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 24 }
    }
    const executeParamPos = trigger.executeParamPos
    const codeEditor = _.filter(
      trigger.executeParamPos,
      (executeParamPo) => +executeParamPo.type === 5
    )[0]
    const props = {
      action: API.uploadParam,
      accept: '.jar',
      data: (file) => {
        return { file_name: file.name }
      },
      headers: {
        authorization: 'authorization-text'
      },
      showUploadList: false
    }
    return (
      <div>
        {executeParamPos.map((item, index) => {
          diliver.item = item
          if (+item.type === 1) {
            return (
              <FormItem required key={index} {...formItemLayout} label={item.name}>
                <AddVar {...diliver} paramIndex={index} code={item.code} type="input" />
              </FormItem>
            )
          } else if (+item.type === 2) {
            return (
              <FormItem required key={index} {...formItemLayout} label={item.name}>
                <User {...diliver} paramIndex={index} code={item.code} />
              </FormItem>
            )
          } else if (+item.type === 3) {
            return (
              <FormItem required key={index} {...formItemLayout} label={item.name}>
                <AddVar {...diliver} paramIndex={index} code={item.code} type="textarea" />
              </FormItem>
            )
          } else if (+item.type === 7) {
            // 第三方类的全路径名
            return (
              <FormItem key={index} {...formItemLayout} label={item.name}>
                <TextArea
                  rows={4}
                  value={item.value || ''}
                  onChange={(e) => {
                    setTriggerData(triggerIndex, index, e.target.value)
                  }}
                  placeholder={i18n(
                    'path_full_name_tips',
                    '请输入第三类的全路径名，多条路径请用回车键间隔'
                  )}
                />
              </FormItem>
            )
          } else if (+item.type === 6) {
            // 上传jar包
            const defaultFileList = _.map(item.value, (val) => {
              return {
                uid: val.fileId,
                name: val.fileName,
                status: 'done'
              }
            })
            return (
              <FormItem key={index} {...formItemLayout} label={item.name}>
                <Upload
                  {...props}
                  defaultFileList={defaultFileList}
                  onChange={(info) => {
                    this.onChange(info, index, item.value)
                  }}
                >
                  <Button>{i18n('globe.upload', '上传文件')}</Button>
                </Upload>
                <p style={{ display: 'inline-block', marginLeft: '10px' }}>
                  {i18n('param_expand_jar', '仅支持.jar的压缩包')}
                </p>
                {_.map(item.value, (val, i) => {
                  const href =
                    API.downloadParam + `?file_id=${val.fileId}&file_name=${val.fileName}`
                  return (
                    <div className="upload-tips" key={i}>
                      <a href={href} target="_blank">
                        {val.fileName}
                      </a>
                      <i
                        className="iconfont icon-shanchu"
                        style={{ margin: '0px 5px', cursor: 'pointer' }}
                        onClick={() => {
                          this.deleteUpload(index, i, item.value)
                        }}
                      />
                    </div>
                  )
                })}
              </FormItem>
            )
          } else if (+item.type === 4) {
            // 执行方式
            // 触发事件中是否包含"合并工单任务结束时"
            const hasMergedTicketIncident = this.props.incidents.includes('mergedTicketEnd')
            return (
              <FormItem required key={index} {...formItemLayout} label={item.name}>
                <RadioGroup
                  onChange={(e) => {
                    setTriggerData(triggerIndex, index, e.target.value)
                  }}
                  value={item.value}
                >
                  {source !== 'olaStrategy' && <Radio value={'sync'}>{i18n('sync', '同步')}</Radio>}
                  <Radio value={'async'}>{i18n('async', '异步')}</Radio>
                  {source !== 'olaStrategy' && !hasMergedTicketIncident && (
                    <Radio value={'pre'}>{i18n('preposition', '前置')}</Radio>
                  )}
                </RadioGroup>
              </FormItem>
            )
          } else if (+item.type === 8) {
            // 颜色
            return (
              <FormItem required key={index} {...formItemLayout} label={item.name}>
                <Color
                  value={item.value}
                  onChange={(value) => setTriggerData(triggerIndex, index, value)}
                />
              </FormItem>
            )
          } else if (+item.type === 9) {
            // 迁出路径
            return (
              <FormItem required key={index} {...formItemLayout} label={item.name}>
                <p>自动审批到下一节点</p>
                <OutlineSelect
                  links={links}
                  value={item.value}
                  onChange={(value) => setTriggerData(triggerIndex, index, value)}
                />
              </FormItem>
            )
          }
        })}
        {codeEditor ? (
          <FormItem required key={0} {...codeFormItemLayout} label={codeEditor.name}>
            <CodeEditor {...diliver} paramIndex={0} value={codeEditor.value} />
          </FormItem>
        ) : null}
      </div>
    )
  }
}

export default triggerClass

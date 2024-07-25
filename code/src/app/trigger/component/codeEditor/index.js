import React, { Component } from 'react'
import { Button, message, notification, Tree } from '@uyun/components'
import QueueAnim from 'rc-queue-anim'
import fnConfig from './fnConfig'
import classnames from 'classnames'
import ParamsSelect from '../paramSelect'
import '../../style/editor.less'
const { TreeNode } = Tree
class Editor extends Component {
  static defaultProps = {
    value: '',
    showHeader: true,
    showExtraPytionInfo: false,
    readOnly: false,
    language: 'groovy',
    languageData: [],
    highlightLines: [],
    setTriggerData: () => {},
    onTypeChange: () => {},
    full: false
  }

  instance = null

  state = {
    visible: false,
    insertVisible: false
  }

  addHighlightLines(lines) {
    lines.forEach((line) => {
      this.instance.addLineClass(parseInt(line) - 1, 'wrap', 'au-codemirror-hightlight')
    })
  }

  pushFn = (index) => {
    const { line, ch } = this
    this.instance.replaceRange(fnConfig[index].content, { line, ch }, { line, ch })
  }

  changeVisible = () => {
    this.setState({
      visible: true,
      insertVisible: false
    })
    const { line, ch } = this.instance.getCursor()
    this.line = line
    this.ch = ch
  }

  checkCode = () => {
    const data = this.instance.getValue()
    axios.post(API.checkGroovy, { content: data }).then((resp) => {
      if (+resp === 200) {
        message.success(i18n('Grammar check_success', '语法检查通过'))
      } else {
        const key = `open${Date.now()}`
        const btn = (
          <Button type="primary" size="small" onClick={() => notification.close(key)}>
            Confirm
          </Button>
        )
        notification.open({
          description: resp,
          btn,
          key,
          onClose: () => {}
        })
      }
    })
  }

  changeInsertVisible = () => {
    this.setState({
      insertVisible: true,
      visible: false
    })
    const { line, ch } = this.instance.getCursor()
    this.line = line
    this.ch = ch
  }

  onSelect = (code, fieldType) => {
    const { line, ch } = this.instance.getCursor()
    this.line = line
    this.ch = ch
    const value =
      fieldType === 'modelParams' ? '${ticket.modelField.' + code + '}' : '${ticket.' + code + '}'
    // const { line, ch } = this
    this.instance.replaceRange(value, { line, ch }, { line, ch })
  }

  onCancel = () => {
    this.setState({
      insertVisible: false,
      visible: false
    })
  }

  getPoint = (instance) => {
    const { line, ch } = instance.getCursor()
    this.line = line
    this.ch = ch
  }

  fullEditor = () => {
    this.setState({
      full: !this.state.full
    })
  }

  render() {
    const { modelId, style, value, builtinParams, defineParams, fullParams } = this.props
    const { visible, insertVisible, full } = this.state
    const tip = '123'
    const titleParams = [
      {
        name: i18n('ticket_id', '工单ID'),
        code: 'ticketId'
      },
      {
        name: i18n('model_name'),
        code: 'model.name'
      },
      {
        name: i18n('model_code', '模型编码'),
        code: 'model.code'
      },
      {
        name: i18n('ticket_baseUrl', '租户地址'),
        code: 'baseUrl'
      }
    ]
    let fieldParamsType = [
      { code: 'fieldparamlist', name: i18n('system_attr', '系统属性'), list: titleParams },
      { code: 'builtinParams', name: i18n('builtin_field', '内置字段') }
    ]
    if (modelId) {
      fieldParamsType.push({ code: 'modelParams', name: '模型字段' })
    }
    fieldParamsType = fieldParamsType.concat([
      { code: 'defineParams', name: i18n('custom_field', '自定义字段') },
      { code: 'fullParams', name: i18n('other_field', '其他字段'), list: fullParams }
    ])
    return (
      <div
        className={classnames('au-editor', {
          'au-fullscreen': full
        })}
        id="au-fullscreen"
      >
        <header className="au-editor-header">
          <div style={{ display: 'inline-block' }}>{i18n('Script_editor', '脚本编辑器')}</div>
          <div style={{ float: 'right' }}>
            <ParamsSelect
              modelId={modelId}
              getPopupContainer={() => document.getElementById('au-fullscreen')}
              paramsType={fieldParamsType}
              onChangeParam={this.onSelect}
            >
              <Button size="small" style={{ float: 'right' }}>
                {i18n('insert_value', '插入变量')}
              </Button>
            </ParamsSelect>
          </div>
          <Button
            size="small"
            style={{ float: 'right', marginRight: '10px' }}
            onClick={this.changeVisible}
          >
            {i18n('Insert_method', '插入方法')}
          </Button>
          <Button
            size="small"
            style={{ float: 'right', marginRight: '10px' }}
            onClick={this.checkCode}
            disabled={!(this.instance && this.instance.getValue())}
          >
            {i18n('Grammar_check', '语法检查')}
          </Button>
          <i
            className={full ? 'iconfont icon-shouqiquanping' : 'iconfont icon-quanping'}
            style={{ float: 'right', marginRight: '6px' }}
            onClick={this.fullEditor}
          />
        </header>
        <div className="au-editor-body" style={style}>
          <div className="au-editor-wrap" ref="editor" />
          {value ? null : tip}
          <QueueAnim>
            {(insertVisible || visible) && (
              <i className="iconfont icon-cha editor-cancel-icon" onClick={this.onCancel} />
            )}
            {visible && (
              <div className="au-deitor-side">
                <div className="side_wrap">
                  {fnConfig.map((item, index) => {
                    return (
                      <div
                        className="side_content_row"
                        onClick={() => {
                          this.pushFn(index)
                        }}
                        key={index}
                      >
                        {item.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <QueueAnim>
              {insertVisible && (
                <div className="au-deitor-side">
                  <div className="side_wrap">
                    <Tree onSelect={this.onSelect}>
                      <TreeNode
                        title={i18n('system_attr', '系统属性')}
                        key="0-0"
                        selectable={false}
                      >
                        {titleParams.map((item) => {
                          return <TreeNode title={item.name} key={item.code} />
                        })}
                        <TreeNode title={i18n('ticket_id', '工单ID')} key={'ticketId'} />
                        <TreeNode title={i18n('model_code', '模型编码')} key={'model.code'} />
                      </TreeNode>
                      <TreeNode
                        title={i18n('builtin_field', '内置字段')}
                        key="0-1"
                        selectable={false}
                      >
                        {builtinParams.map((item) => {
                          return <TreeNode title={item.name} key={item.code} />
                        })}
                      </TreeNode>
                      <TreeNode
                        title={i18n('custom_field', '自定义字段')}
                        key="0-2"
                        selectable={false}
                      >
                        {defineParams.map((item) => {
                          return <TreeNode title={item.name} key={item.code} />
                        })}
                      </TreeNode>
                      <TreeNode
                        title={i18n('other_field', '其他字段')}
                        key="0-3"
                        selectable={false}
                      >
                        {fullParams.map((item) => {
                          if (['keyInfo', 'sandboxId'].indexOf(item.code) > -1) {
                            return <TreeNode title={item.name} key={item.code} />
                          }
                        })}
                        {/* <TreeNode title={i18n('current.user.token', '当前用户token')} key={token} /> */}
                      </TreeNode>
                    </Tree>
                  </div>
                </div>
              )}
            </QueueAnim>
          </QueueAnim>
        </div>
      </div>
    )
  }

  async componentDidMount() {
    const { language, value, readOnly, highlightLines, setTriggerData, triggerIndex, paramIndex } =
      this.props
    const theme =
      document.querySelector('html').className.indexOf('white') > -1 ? 'eclipse' : 'monokai'
    const { default: CodeMirror } = await import('../../../components/codeEditor/lib')

    this.instance = new CodeMirror(this.refs.editor, {
      theme,
      value,
      readOnly,
      lineNumbers: true,
      indentWithTabs: false,
      mode: language
    })
    this.instance.on('change', (instance) =>
      setTriggerData(triggerIndex, paramIndex, instance.getValue())
    )
    this.instance.on('focus', (instance) => {
      this.getPoint(instance)
    })
    this.addHighlightLines(highlightLines)
    axios.get('/tenant/api/v1/user/details/token').then((res) => {
      this.setState({ token: res })
    })
  }
}

export default Editor

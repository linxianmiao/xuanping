import React, { Component } from 'react'
import { Empty, Skeleton } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import ErrorBoundary from '~/components/ErrorBoundary'
import classnames from 'classnames'
import RelateTicket from '~/ticket/relateTicket'
import { Button } from '@uyun/components'
import { PlusOutlined } from '@uyun/icons'
import { store as runtimeStore } from '@uyun/runtime-react'

const cssSet = new Set()

function importWidget(widgetInfo) {
  return new Promise((resolve, reject) => {
    const { path, css, js = '/index.js' } = widgetInfo
    const origin = window.location.origin
    // css 原先是true,后改成 /index.css?t=1709018589035
    const cssUrl = css ? `${origin}${path}${css === true ? '/index.css' : css}` : null
    const jsUrl = `${origin}${path}${js}`
    if (cssUrl && !cssSet.has(cssUrl)) {
      cssSet.add(cssUrl)
      const link = document.createElement('link')
      link.href = cssUrl
      link.rel = 'stylesheet'
      link.type = 'text/css'
      document.querySelector('head').appendChild(link)
    }
    try {
      window.System.import(jsUrl)
        .then((module) => {
          if (!module) {
            console.error(`require([${path}])=>${module}`)
          }
          if (module.__useDefault) {
            resolve(module.default.default)
          } else {
            resolve(module.default)
          }
        })
        .catch((err) => {
          resolve(() => <Empty type="loading" />)
          console.error(`require-${err}`)
        })
    } catch (e) {
      console.log(e)
      resolve(() => (
        <Empty
          type="loading"
          description={i18n('ErrorBoundary.loading', '扩展字段内部出错无法加载！')}
        />
      ))
    }
  })
}

const PICK_PROPS = ['modelId', 'goHome', 'isEdit', 'fieldData', 'formItemLayout', 'onValuesChange']

@inject('loadFieldWidgetStore')
@observer
class CustomizeField extends Component {
  static defaultProps = {
    widgetType: 'create'
  }

  state = {
    WidgetComponent: null,
    visible: false
  }

  componentDidMount() {
    this.addFieldWidgets()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.type !== this.props.type) {
      this.addFieldWidgets()
    }
  }

  addFieldWidgets() {
    const { type } = this.props
    const { widgets, customFieldList } = this.props.loadFieldWidgetStore
    if (!widgets[type]) {
      const widgetInfo = _.find(customFieldList, (item) => item.type === type)
      importWidget(widgetInfo).then((module) => {
        this.setState({
          WidgetComponent: module
        })
      })
    }
  }

  handleClick = (val) => {
    this.setState({ visible: val })
  }

  render() {
    const { WidgetComponent, visible } = this.state
    let { loadFieldWidgetStore, ...rest } = this.props

    if (this.props.widgetType === 'create') {
      rest = _.pick(this.props, PICK_PROPS)
    }
    const { isSingle, relateTicketModels, relateTicketModelsScope, type, createRelateTicket } =
      this.props?.field || {}
    const CreateRelateTicket = createRelateTicket || false
    const { currexcutor, isReceiveTicket, isManager, isModelManager } = this.props?.forms || {}
    const { userId } = runtimeStore.getState().user || {}
    const isRenderCreateRelatedButton =
      CreateRelateTicket &&
      currexcutor &&
      currexcutor.indexOf(userId) > -1 &&
      !isReceiveTicket &&
      (!_.isEmpty(relateTicketModels) || isManager || isModelManager)

    let ticketId = this.props?.forms?.ticketId || ''
    let disabled = this.props?.disabled

    const isShow =
      !(
        window.location.href.indexOf('createTicket') !== -1 ||
        window.location.href.indexOf('createService') !== -1
      ) &&
      !disabled &&
      type === 'relateTicketNum' &&
      isRenderCreateRelatedButton
    return (
      <ErrorBoundary>
        {WidgetComponent ? (
          <div
            className={classnames({
              'field-relate-ticket-num': type === 'relateTicketNum',
              'field-relate-ticket-num-active': isShow
            })}
          >
            <WidgetComponent
              {...rest}
              isSingle={isSingle}
              disabled={disabled}
              relateTicketModels={relateTicketModelsScope}
            />
            {window.location.href.indexOf('createTicket') !== -1 ||
            window.location.href.indexOf('createService') !== -1 ? null : (
              <>
                {!disabled && type === 'relateTicketNum' && isRenderCreateRelatedButton && (
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => this.handleClick(true)}
                    disabled={this.props?.field.isRequired === 2}
                  ></Button>
                )}
              </>
            )}

            {visible ? (
              <RelateTicket
                source="relateTicketNum"
                relateTicketVisible={visible}
                onClose={() => this.handleClick(false)}
                models={relateTicketModels || []}
                id={ticketId}
                onChange={this.props && this.props?.onChange}
                selectedValue={this.props.value}
                isSingle={isSingle}
                relateSource={'table'}
              />
            ) : null}
          </div>
        ) : (
          <Skeleton />
        )}
      </ErrorBoundary>
    )
  }
}

export default CustomizeField

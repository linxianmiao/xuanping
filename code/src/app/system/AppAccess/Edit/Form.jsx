import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Form, Input, Switch, Title, Spin, Button, message } from '@uyun/components'
import AppKey from './Components/AppKey'
import Actions from './Components/Actions'
import EditInput from './Components/EditInput'
import styles from './index.module.less'

const FormItem = Form.Item

@withRouter
@Form.create({
  onValuesChange: props => props.onLeaveNotify(true)
})
export default class AppAccessForm extends Component {
  static defaultProps = {
    appCode: undefined,
    onLeaveNotify: () => {}
  }

  state = {
    detail: {},
    loadingType: ''
  }

  webhookAddressRef = React.createRef()

  componentDidMount() {
    const { appCode, detail } = this.props

    if (detail) {
      this.setState({ detail })
    } else if (appCode) {
      // 获取应用接入详情
      this.queryApp(appCode)
    }
  }

  checkEmpty = value => {
    const reg = /^[\s\S]*.*[^\s][\s\S]*$/
    return reg.test(value)
  }

  validateAppName = (rule, value, callback) => {
    if (this.checkEmpty(value)) {
      callback()
    } else {
      callback('应用名称不能为空')
    }
  }

  validateWebhook = (rule, value, callback) => {
    if (this.checkEmpty(value)) {
      callback()
    } else {
      callback('Webhook地址不能为空')
    }
  }

  queryApp = async appCode => {
    this.setState({ loadingType: 'query' })

    const res = await axios.get(API.getAppAccess, { params: { appCode } }) || {}

    this.setState({ loadingType: '', detail: res })
  }

  handleSubmit = () => {
    if (this.webhookAddressRef.current && this.webhookAddressRef.current.state.editing) {
      this.props.form.setFields({
        webhookAddress: {
          errors: [new Error('请完成编辑')]
        }
      })
      return false
    }
    this.props.form.validateFieldsAndScroll((error, values) => {
      if (error) return

      const submitData = {
        ...this.state.detail,
        ...values,
        isAvailable: values.isAvailable ? 1 : 0
      }

      this.setState({ loadingType: 'submit' })
      // 已接入的调修改接口，未接入的调保存接口
      const url = submitData.isAccess ? API.updateAppAccess : API.saveAppAccess
      axios.post(url, submitData).then(res => {
        if (res) {
          message.success(i18n('save_success', '保存成功'))
          this.props.onLeaveNotify(false)
          this.props.history.replace('/sysCon/appAccess')
        }
      })
    })
  }

  getOutputURL = () => {
    const formWebhook = this.props.form.getFieldValue('webhookAddress')

    if (formWebhook === undefined) {
      return this.state.detail.webhookAddress || 'http://ip:port/webhook'
    }
    return formWebhook
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { detail, loadingType } = this.state
    const { appCode, appPlatformCode, appName, appType, appDescription, isAvailable, appkey, actions, webhookAddress } = detail

    return (
      <Spin spinning={loadingType === 'query'}>
        <Form className={styles.form}>
          <FormItem label={i18n('app.name', '应用名称')} required>
            {
              getFieldDecorator('appName', {
                initialValue: appName,
                rules: [{
                  required: true,
                  message: i18n('ticket.forms.pinputName', '请输入名称')
                }, {
                  validator: this.validateAppName
                }]
              })(
                <Input
                  style={{ width: 360 }}
                  placeholder={i18n('ticket.forms.pinputName', '请输入名称')}
                  maxLength={20}
                />
              )
            }
          </FormItem>
          <FormItem label={i18n('app.info', '应用信息')}>
            <div className={styles.appCard}>
              <img
                src={`/tenant/styles/images/${appPlatformCode}.png`}
                onError={e => e.target.src = '/tenant/styles/images/cmdb-icon.png'}
              />
              <div>
                <h2>{appCode}</h2>
                <p>{appDescription}</p>
              </div>
            </div>
          </FormItem>
          <FormItem label="app access key">
            {
              getFieldDecorator('appkey', {
                initialValue: appkey || undefined
              })(<AppKey />)
            }
          </FormItem>
          <FormItem label={i18n('is.available', '是否启用')}>
            {
              getFieldDecorator('isAvailable', {
                initialValue: !!isAvailable,
                valuePropName: 'checked'
              })(
                <Switch />
              )
            }
          </FormItem>
          <FormItem style={{paddingLeft: 100, marginTop: 100}}>
            <Button
              type="primary"
              loading={loadingType === 'submit'}
              onClick={this.handleSubmit}
            >
              {i18n('save', '保存')}
            </Button>
          </FormItem>
        </Form>
      </Spin>
    )
  }
}

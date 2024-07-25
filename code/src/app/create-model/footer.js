import React, { Component } from 'react'
import { Button, Modal } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { linkTo } from '~/components/LowcodeLink'
import { orLowcode } from '~/utils/common'

@inject('basicInfoStore', 'globalStore')
@withRouter
@observer
class Footer extends Component {
  constructor(props) {
    super(props)
    this.timer = null
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
    this.timer = null
  }

  saveBasicInfo = async (basicInfoData) => {
    const result = await this.props.basicInfoStore.saveBaseModel(basicInfoData)
    if (result) {
      let url = `/conf/model/advanced/${result}`

      const model = Modal.success({
        title: i18n('ticket.kb.success', '创建成功'),
        content: `1 ${i18n('conf.model.create.tip', '秒后进入模型编辑页面')}`,

        onOk: () => {
          this.timer && clearTimeout(this.timer)
          this.timer = null
          linkTo({
            history: this.props.history,
            url: url,
            pageKey: 'model_edit',
            modelId: result
          })
        }
      })
      this.timer = setTimeout(() => {
        model.destroy()
        linkTo({
          history: this.props.history,
          url: url,
          pageKey: 'model_edit',
          modelId: result
        })
      }, 1000)
    }
  }

  handleOk = () => {
    this.props.saveBasicInfo((basicInfoData) => {
      this.saveBasicInfo(basicInfoData)
    })
  }

  handlCancel = () => {
    let url = `/conf/model`
    if (window.LOWCODE_APP_KEY) {
      url = `/modellist/${window.LOWCODE_APP_KEY}/?activeTab=model`
    }
    // this.props.history.push('/conf/model')
    linkTo({
      history: this.props.history,
      url: url,
      pageKey: 'home',
      modelId: ''
    })
  }

  render() {
    const { modelInsert } = this.props.globalStore.configAuthor
    return (
      <div className="u4-col-offset-3">
        {orLowcode(modelInsert) && (
          <Button type="primary" onClick={this.handleOk} style={{ marginRight: '16px' }}>
            {i18n('globe.create', '创建')}
          </Button>
        )}
        <Button onClick={this.handlCancel}>{i18n('cancel', '取消')}</Button>
      </div>
    )
  }
}

export default Footer

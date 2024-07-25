import React, { Component } from 'react'
import { qs } from '@uyun/utils'
import { Provider, observer } from 'mobx-react'
import TicketStore from '../ticket-list/stores/ticketStore'
import UserStore from '../ticket-list/stores/userStore'
import PrintForm from './printForm'

import './style/detail.less'
import './style/index.less'
const ticketStore = new TicketStore()
const userStore = new UserStore()

@observer
class Details extends Component {
  state = {
    fieldData: [],
    formInfo: {}
  }

  get locationQuery() {
    const search = this.props.location.search.slice(1)
    return qs.parse(search)
  }

  componentDidMount() {
    this.getDetailForms()
  }

  getDetailForms = async () => {
    const locationQuery = qs.parse(this.props.location.search.slice(1))
    const ticketId = this.props.match.params.id
    let formInfo = {}

    this.realname = locationQuery.realname
    this.theme = locationQuery.theme

    // 先从session中获取表单信息
    try {
      formInfo = JSON.parse(sessionStorage.getItem('printFormInfo'))
    } catch (error) {
      console.log(error)
    }

    // 如果session中拿不到表单信息，就查详情接口
    if (!formInfo) {
      const { tacheNo, tacheType, tacheId, modelId, caseId } = locationQuery

      formInfo = await ticketStore.getTicketDetail({
        ticketId,
        tacheNo,
        tacheType,
        tacheId,
        modelId,
        caseId
      })
    }

    // 获取处理记录
    ticketStore.getProcessRecord(ticketId, undefined, locationQuery.caseId)

    let arr = []

    _.map(formInfo.formLayoutVos, formLayoutVo => {
      _.map(formLayoutVo.fieldList, field => {
        if (field.type === 'user') {
          const initialValue = field.defaultValue
          let ids = []
          if (initialValue) {
            ids = initialValue
            // 服务门户时客户人员没有默认人员
          } else if (field.currUser) {
            ids = [].concat(locationQuery.userId)
          }
          arr = [...ids, ...arr]
        }
      })
      _.map(formLayoutVo.tabs, tab => {
        _.map(tab.fieldList, field => {
          if (field.type === 'user') {
            const initialValue = field.defaultValue
            let ids = []
            if (initialValue) {
              ids = initialValue
              // 服务门户时客户人员没有默认人员
            } else if (field.currUser) {
              ids = [].concat(locationQuery.userId)
            }
            arr = [...ids, ...arr]
          }
        })
      })
    })

    const List = await userStore.getUserList(arr)
    this.setState({
      formInfo,
      fieldData: List
    })
  }

  render() {
    const { formInfo, fieldData } = this.state
    const getFieldValue = code => {
      const printFormData = JSON.parse(sessionStorage.getItem('printForm'))
      return printFormData ? printFormData[code] : undefined
    }
    const locationQuery = qs.parse(this.props.location.search.slice(1))
    const { modelId } = locationQuery
    return (
      <Provider ticketStore={ticketStore}>
        <div className="clearfix ticket-detail-wrap">
          <PrintForm
            getFieldValue={getFieldValue}
            formInfo={formInfo}
            fieldData={fieldData}
            modelId={modelId}
            realname={this.realname}
            theme={this.theme}
          />
        </div>
      </Provider>
    )
  }
}

export default Details
